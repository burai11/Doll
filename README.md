# studio_warabi

## Run locally on Windows

Double-click `start-local.cmd` in this folder.

The script starts a local web server and opens the game at:

`http://localhost:8000/`

Keep the PowerShell window open while using the game. Press `Ctrl+C` in that
window to stop the server.

If port 8000 is already in use, open PowerShell in this folder and run:

```powershell
.\Start-LocalServer.ps1 -Port 8001
```

No installation is required. The launcher uses Windows PowerShell, which is
included with supported Windows versions.

## Alternative development setup

For editing the game, Visual Studio Code with the Live Server extension is a
convenient alternative. Open this folder in VS Code, then use "Open with Live
Server" on `index.html`.

## Project layout

- `index.html`, `css/`, and `js/`: game interface and behavior
- `characters/`: character definitions and image assets
- `Start-LocalServer.ps1`: local static-file server
- `start-local.cmd`: double-click launcher for the local server
