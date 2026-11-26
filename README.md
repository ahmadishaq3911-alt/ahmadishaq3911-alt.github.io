# Muhammad Ahmad Ishaq — academic portfolio

A static website ready for GitHub Pages, with no build step or API key required.

## Current design

The supplied academic reference inspired the gradient background, circular portrait, two-column biography, education cards, purple accents, and navigation. All personal content and the portrait are Ishaq’s own. The new homepage includes four attributed recommendation-letter summaries with their dates, identified as paraphrases.

- Responsive desktop and phone layouts, with a collapsible menu.
- Search across research, publications, projects, teaching, and recommendations.
- Light/dark theme switch, remembered in the browser.
- 18 HTML pages, publications, downloadable CV, and original research figures.
- All 36 proposal slides and 17 radar slides, with navigation, expanded view, and slide text.
- Interactive educational atomic model and digital-logic demonstration.

## Upload using the two packages

1. Extract `website-upload-2-slides.zip` and upload the **assets folder inside it** to the repository root. Commit this batch.
2. Extract `website-upload-1-main.zip` and upload **all of its contents** to the same repository root. Commit this batch.
3. Keep `index.html`, `assets`, `files`, and `projects` at the root, not inside an extra folder. Upload extracted contents, not the ZIP files.
4. If the previous slide package is already uploaded, only the main package needs updating; the 53 slide images are unchanged.

Each upload batch contains fewer than 100 files. The shared assets directory is intentional: the batches contain different files within it. A complete `website-ready-for-github.zip` is also supplied for local preview or Git-based upload.

Repository: https://github.com/ahmadishaq3911-alt/ahmadishaq3911-alt.github.io
Expected published address: https://ahmadishaq3911-alt.github.io/
This package does not itself publish or change the live site.

## Preview and maintain

Open `index.html` locally, or serve this directory with a static HTTP server. Clipboard copying works best on the published HTTPS site.

- Current theme: `assets/academic.css` and `assets/academic.js`.
- Shared base styles: `assets/final-home.css`, `assets/final-detail.css`, and `assets/polish.css`.
- Slides: `assets/slides/`, `assets/decks.js`, and `assets/slideshow.js`.
- Educational atomic model: `assets/explorer.js`.
- The old `assets/final-home.js` file is retained but is not loaded by the new homepage.

Research figures and presentation content retain their source attributions; see ASSET_CREDITS.md and the Figure credits page. Slides are static renderings of the original PowerPoint decks. Preliminary research results and future plans remain identified. The educational model is not a calculated atomic structure.
