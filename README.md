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
- `素材追加用/`: drop-zone for handing new outfit source images to the AI (see below)
- `Start-LocalServer.ps1`: local static-file server
- `start-local.cmd`: double-click launcher for the local server

## Adding outfits (`素材追加用` folder)

`素材追加用/` is a staging folder for **feeding new outfit source images to the
AI**. The app itself (`index.html`, `js/`, `characters/`) never reads this
folder, so it is completely optional: **the game works whether the folder is
empty, full, or deleted.**

Workflow:

1. Drop the new garment image(s) into `素材追加用/` (subfolders are fine).
   - A **green-screen background** is recommended — the AI chroma-keys it out to
     a transparent PNG automatically. White backgrounds also work.
   - Use the same canvas as existing assets (768x1280 / 784x1312) and place the
     garment where it sits on the character, so no manual offset is needed.
2. Ask the AI to add the material (e.g. "add the items in 素材追加用").
3. The AI saves the transparent PNG into `characters/<char>/images/` and
   registers it in `items.json` (and adds a category to `character.json` if a
   new one is needed).

After processing, the source files in `素材追加用/` can be emptied — the finished
transparent PNGs live under `characters/`. See `素材追加用/README.txt` for details.

### Asset data model (per character)

- `characters/<char>/character.json` — canvas size, draw-order `layers`, and the
  selectable `categories` (e.g. `hat`, `tops`, `skirt`, `bra`, `socks`).
- `characters/<char>/items.json` — one entry per garment. Useful fields:
  - `layer` — which layer it draws on (must exist in `character.json` `layers`).
  - `removeWhiteBackground: true` — flood-fill white to transparent (for
    white-background assets; omit for pre-cut transparent PNGs).
  - `offsetX` / `offsetY` — nudge the image in canvas pixels if a garment sits
    too high/low.
  - `hideLayers: ["armsFront"]` — hide other layers while worn (e.g. a
    long-sleeved top hides the bare-arm overlay).

### Backgrounds (shared across all characters)

Scene backgrounds are **shared by every character** from one place:

- Images live once in `characters/shared_backgrounds/` (full-frame opaque
  scenes; no chroma-key or white-removal needed).
- They are declared once in `characters/shared_backgrounds.json`
  (`{ id, name, image, tags }`, `image` = filename in that folder).
- A character opts in with `"sharedBackgrounds": true` in its `character.json`.
  At load time `dataLoader.js` injects a `background` category, a bottom-most
  `background` layer, and the shared background items (as a `Background` tab).

To give a **new character** the same backgrounds, just add
`"sharedBackgrounds": true` — nothing is duplicated. Adding a scene for everyone
is one image in `characters/shared_backgrounds/` plus one line in
`shared_backgrounds.json`.

For a scene to be visible **behind** the character, the character's `portrait`
must be cut out from its own background (`removeWhiteBackground: true` on the
portrait item, or a portrait/body PNG that is already transparent). With no
background selected the character shows on the neutral studio backdrop.

Note: background images fill the character's canvas, so a scene is stretched to
each character's aspect ratio (e.g. Warabi's 1024x1536 vs the 720x1280 sources).
