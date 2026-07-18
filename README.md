# studio_蕨（MVP）

キャラクターカスタマイズ・スタジオ。
HTML / CSS / JavaScript のみで動作します（外部ライブラリ不使用）。

## 起動方法

JSONを`fetch`で読み込むため、**HTMLファイルを直接ダブルクリックで開くと動作しません**（ブラウザのセキュリティ制限）。以下のいずれかで起動してください。

### GitHub Pages（推奨）
リポジトリにアップロードしてGitHub Pagesを有効化するだけで動作します。

### ローカルサーバー
プロジェクトフォルダで以下を実行し、表示されたURLをブラウザで開きます。

```
python -m http.server 8000
```

→ http://localhost:8000

VSCodeの「Live Server」拡張機能でも起動できます。

## フォルダ構成

```
studio_warabi/
├─ index.html
├─ css/
│   └─ style.css
├─ js/
│   ├─ dataLoader.js   … JSON・画像の読み込み
│   ├─ renderer.js     … レイヤー描画
│   ├─ wardrobe.js     … 着せ替えUI
│   ├─ studio.js       … Studio Mode・PNG保存
│   └─ main.js         … 初期化
└─ characters/
    ├─ characters.json … キャラクター一覧
    └─ character_a/
        ├─ character.json … レイヤー順・カテゴリ・基本パーツ・初期衣装
        ├─ items.json     … 衣装データ
        └─ images/        … 透過PNG素材（全て1024×1536）
```

## 衣装の追加手順（コード修正不要）

1. `characters/character_a/images/` に透過PNGを追加（1024×1536、統一基準で配置）
2. `characters/character_a/items.json` に1件追加

```json
{ "id": "tops_red_shirt", "name": "赤シャツ", "category": "tops",
  "image": "images/tops_red_shirt.png", "layer": "costume", "tags": ["red"] }
```

3. リロードすると自動的に一覧へ表示されます

## カテゴリ・レイヤーの追加

`character.json` の `categories` / `layers` に追加するだけで反映されます。

## キャラクターの追加

1. `characters/` に新しいフォルダを作成（`character_a` と同じ構成）
2. `characters/characters.json` に1件追加

※MVPではキャラクター切替UIは未実装です（`characters.json` の `default` で切替可能）。

## 素材について

現在の画像はすべて動作確認用のプレースホルダーです。
本番素材が完成したら、同名ファイルで差し替えるだけで使えます。

## Studio Mode

右上のカメラボタンでUIを非表示にし、「PNG保存」でキャラクター表示のみ（1024×1536）を保存します。保存画像にUIは一切含まれません。
