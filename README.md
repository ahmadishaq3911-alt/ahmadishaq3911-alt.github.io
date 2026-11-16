# Muhammad Ahmad Ishaq — research portfolio

A complete static academic website, ready for GitHub Pages. No package installation, API key, subscription, or build step is needed.

## Publish to your GitHub Pages repository

1. Extract `website-ready-for-github.zip` on your computer.
2. Open your repository: [ahmadishaq3911-alt.github.io](https://github.com/ahmadishaq3911-alt/ahmadishaq3911-alt.github.io).
3. Choose **Add file → Upload files** and upload the extracted **contents**. `index.html`, `assets`, `files`, and `projects` must appear directly at the repository root. Upload the files and folders, not the ZIP or an enclosing folder.
4. Commit the uploaded changes. Existing files with matching paths are replaced by this redesigned version.
5. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select your publishing branch (usually `main`), choose **/(root)**, and save.
6. GitHub will publish to [https://ahmadishaq3911-alt.github.io/](https://ahmadishaq3911-alt.github.io/). The deployment may take several minutes. Check the repository’s Actions tab if it does not appear.

Keep the included `.nojekyll` file. If Windows hides it, the other static files still work with the normal GitHub Pages build; including it tells GitHub to serve the site directly.

These steps follow [GitHub’s publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart).

## Preview on your computer

Double-click `index.html` to open it in your browser. The site’s navigation, images, filters, search, and 3D model work locally. Clipboard behavior can depend on your browser; copying works best on the published HTTPS site.

## Included pages

- Home, Research, Publications, Visual lab, About, Teaching, Coursework, Contact, and Projects.
- Six individual project pages covering graphene interfaces, Ga-alloyed AlSb, In-alloyed AlSb, hybrid electrode materials, PFAS-free paper, and electronics.
- Figure sources and a 404 page.

## Visuals and interactions

- Two new detailed conceptual illustrations, optimized as local WebP images.
- Eighteen original published figure previews: Figures 1–9 from each AlSb paper.
- A rotatable atomic model with 2D and 3D views, layer separation, a neighboring-layer toggle, keyboard controls, and optional rotation.
- Filterable figure gallery with an accessible enlarged-image dialog.
- Publication search and citation copying.
- Mobile navigation, reduced-motion support, local CV and résumé downloads, social metadata, sitemap, and favicon.

The original paper figures are the publisher’s publicly accessible 312-pixel previews. They have not been reconstructed or altered with AI. New illustrations are explicitly labeled conceptual. Replace the preview files with your original high-resolution exports later using the same filenames if those become available.

## Editing

- Edit page text directly in the corresponding `.html` file.
- Shared visual styling: `assets/style.css`.
- Navigation, search, filters, and image dialog: `assets/site.js`.
- Interactive educational model: `assets/explorer.js`.
- Publication images: `assets/images/papers/`.
- Replace CV and résumé PDFs in `files/`, preserving their filenames.
- If your GitHub username changes, update canonical URLs, Open Graph image URLs, `robots.txt`, and `sitemap.xml`.
- See `sources.html`, `ASSET_CREDITS.md`, and `IMAGE_PROMPTS.md` for provenance.

The original supplied website folder has not been changed. This package has not been pushed to GitHub or published.

Updated using the full CV and transcript: 11 completed graduate courses, current internship focus, expanded project workflow, four original electronics diagrams, and an interactive full-adder demonstration. The transcript itself and its student identifiers are not included. The website now contains 17 HTML pages.
