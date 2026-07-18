param(
  [ValidateRange(1024, 65535)]
  [int]$Port = 8000,
  [switch]$NoBrowser
)

$rootPath = [System.IO.Path]::GetFullPath($PSScriptRoot)
$rootPrefix = $rootPath.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)

$mimeTypes = @{
  ".css"  = "text/css; charset=utf-8"
  ".html" = "text/html; charset=utf-8"
  ".ico"  = "image/x-icon"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".svg"  = "image/svg+xml"
  ".txt"  = "text/plain; charset=utf-8"
}

try {
  $listener.Start()
} catch {
  Write-Host "Could not start the local server on port $Port." -ForegroundColor Red
  Write-Host "Close any app using that port, then run this file again." -ForegroundColor Yellow
  Read-Host "Press Enter to close"
  exit 1
}

$url = "http://localhost:$Port/"
Write-Host "Local server is running: $url" -ForegroundColor Green
Write-Host "Keep this window open while using the game. Press Ctrl+C to stop it."
if (-not $NoBrowser) { Start-Process $url }

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
      $requestLine = $reader.ReadLine()
      while ($reader.ReadLine() -ne "") { }

      if ($requestLine -notmatch "^(GET|HEAD) ([^ ]+) HTTP/") {
        $status = "400 Bad Request"
        $body = [System.Text.Encoding]::UTF8.GetBytes("Bad request")
        $contentType = "text/plain; charset=utf-8"
      } else {
        $method = $Matches[1]
        $requestPath = [System.Uri]::UnescapeDataString(([System.Uri]::new("http://localhost" + $Matches[2])).AbsolutePath)
      if ($requestPath -eq "/") { $requestPath = "/index.html" }
      $relativePath = $requestPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
      $filePath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))

      if (-not $filePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
          $status = "404 Not Found"
          $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
          $contentType = "text/plain; charset=utf-8"
        } else {
          $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
          $contentType = $mimeTypes[$extension]
          if (-not $contentType) { $contentType = "application/octet-stream" }
          $body = [System.IO.File]::ReadAllBytes($filePath)
          $status = "200 OK"
        }
      }

      $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      if ($method -ne "HEAD") { $stream.Write($body, 0, $body.Length) }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Close()
}
