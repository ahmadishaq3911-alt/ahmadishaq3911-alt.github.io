# How to update your portfolio one project at a time

## 1. Make one project public

1. Create a separate public GitHub repository, e.g. `ga-doped-alsb-dft`.
2. Use its dedicated starter ZIP from the companion portfolio pack.
3. Add a real project summary, original or licensed figures, appropriate code and files.
4. On the matching page `projects/ga-alsb.html`, add a GitHub link in the side panel:

```html
<a href="https://github.com/ahmadishaq3911-alt/ga-doped-alsb-dft" target="_blank" rel="noopener noreferrer">View GitHub repository ↗</a>
```

5. Commit the changed HTML file to your Pages repo.

## 2. Add a figure from a published article

- Verify that you own the figure or have a right to reuse it. Recreating a plot from your own original data may be preferable to copying publisher-designed figures.
- Write a caption with correct units, publication citation, and a clear explanation.
- Put optimized PNG/WebP files under `assets/images/figures/`.
- In the corresponding `projects/*.html` page, use the relative path `../assets/images/figures/filename.webp`.
- Example:

```html
<figure class="media-panel">
  <img src="../assets/images/figures/ga-alsb-band-structure.webp" alt="Ga-alloyed AlSb calculated band structure, with composition and method described" loading="lazy">
  <figcaption>Band structure of [composition]; adapted from [citation], with permission where required.</figcaption>
</figure>
```

- For gallery items in `gallery.html`, use `assets/images/figures/filename.webp`.

## 3. Add an electronics project

- Edit the `digital-electronics-projects` repository: add a new subfolder using its template.
- Include actual circuit diagrams, simulation or test results, and a description of your contribution.
- Add a new project article or link on `projects/digital-electronics.html`.
- Do not claim you built a circuit until the original project files or report confirm it.

## 4. Edit general pages

- Change your summary in `index.html`.
- Add an accepted/published paper with DOI to `publications.html`.
- Update your education and roles in `experience.html` and `teaching.html`.
- Replace documents in `files/` and update their links if the filenames change.
- Layout rules live in `assets/style.css`; do not need to edit CSS for ordinary text or image updates.

## 5. Privacy and research-release checklist

- Remove street address, birth date, personal phone, national ID, student ID, or family information.
- Ask your advisor before posting unpublished computational figures, structures, parameters, data and research claims.
- Do not upload licensed codes, proprietary pseudopotentials or cluster credentials.
- Check copyright before uploading publisher PDFs and journal images.
- Credit collaborators and describe your own contribution accurately.

## 6. Common GitHub upload mistake

Replace the files *inside* the existing website repository. Do **not** upload the enclosing ZIP or create a nested `website/` directory. `index.html` must be in the root.
