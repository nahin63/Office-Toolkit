# Office Toolkit

All-in-one offline office app for your phone. **Developed by Nahin.**

Image Resizer · PDF Maker · Document Reader & Editor · Spreadsheet · PowerPoint Slides (transitions + animations) · My Files

Plain HTML + CSS + vanilla JavaScript. No backend, no login. Works offline after the first visit. English UI with a Bangla switch (top bar: `EN | বাং`), light/dark mode.

## Look and feel
Dark navy theme (light mode available), top navigation on wide screens and bottom navigation on phones, 4-tile app icon, and a serif display font (Fraunces) for the hero heading. All fonts are bundled in `fonts/` so they work offline.
Back navigation: the in-app back arrow and the phone's back button both move through screens, close dialogs and exit Present mode.

## Run on your computer
```bash
cd office-toolkit
python3 -m http.server 8080      # or: npx serve
```
Open http://localhost:8080 (service workers need http://localhost or https).

## Publish on GitHub Pages (free live URL)
1. Create a **public** repo on GitHub, e.g. `office-toolkit`.
2. Push this folder:
   ```bash
   git init && git add . && git commit -m "Office Toolkit by Nahin"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/office-toolkit.git
   git push -u origin main
   ```
3. Repo **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
4. After a minute your live link is `https://YOUR-USERNAME.github.io/office-toolkit/`. Share it.

## Install on phone
- **Android (Chrome):** open the link → tap **Install** (top bar) or menu ⋮ → *Install app*.
- **iPhone (Safari):** open the link → Share → **Add to Home Screen**.
- The blue **Install App** button (home screen and top bar) opens the phone's native install dialog in one tap on Android and desktop Chrome/Edge. iPhone does not allow this, so it shows the Share → Add to Home Screen steps. Facebook/WhatsApp in-app browsers cannot install apps: open the link in Chrome or Safari first.
- Open it once while online; after that it works fully offline.

## Saving
- Green **Save** button on every screen: saves to **My Files** and downloads to your phone.
- Drafts auto-save every 3 seconds and are restored when you reopen the app.
- Data lives in the browser (IndexedDB). Clearing site data removes it, so download important files.

## Notes
- Libraries are bundled in `libs/` (jsPDF, pdf-lib, pdf.js, mammoth, docx, SheetJS, PptxGenJS, JSZip); fonts are in `fonts/` (Inter, Fraunces, JetBrains Mono).
- Bangla/other-script text in Text→PDF and Doc→PDF is drawn as page images (not selectable).
- .xlsx export keeps values/formulas/number formats (SheetJS community edition cannot write colors/bold).
- .pptx export keeps text, images, themes, notes and transitions (Flip/Cube become Fade); element animations play in Present mode inside the app.
- Image Resizer can limit the output to a chosen size (e.g. 200 KB or 1 MB): it tunes quality first, then reduces dimensions only if needed.
- Spreadsheet formulas: SUM AVERAGE MIN MAX COUNT COUNTA IF ROUND ABS SQRT POWER MOD PRODUCT AND OR NOT CONCAT LEN UPPER LOWER TRIM and + - * / ^ & comparisons.
- To update after changing files, bump `VERSION` in `sw.js`.

© Developed by Nahin
