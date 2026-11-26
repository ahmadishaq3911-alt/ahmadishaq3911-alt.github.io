# Keep Microsoft PowerPoint viewers; remove old static slide viewers

Updated files in this package:
- `index.html`: Ph.D. presentation now appears once, using the Microsoft OneDrive embed. Old 36-slide image viewer removed.
- `research.html`: same improvement on the research page, so it does not show the old 36-slide static version.

Upload both files to the ROOT of `ahmadishaq3911-alt.github.io` and commit. Do not upload the ZIP itself. No files in `assets/` need deleting; the site may use those images elsewhere.

## Arduino Radar project

The existing `projects/arduino-radar.html` was not among the HTML files supplied, so it has NOT been edited in this package. To replace its older 17-image-slide viewer, open that file in GitHub and remove ONLY the old `<div class="slide-viewer" data-deck="radar" ...>` through its matching `</div>`, plus its associated paragraph `class="deck-note"` (if present). Keep surrounding project content and `<section>` tags. Replace that content with:

```html
<div class="powerpoint-embed" style="max-width:1050px;margin:30px auto 36px;">
  <h3>Arduino Radar — Interactive PowerPoint</h3>
  <div style="width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#f3f4f6;">
    <iframe src="https://1drv.ms/p/c/b9ef310711526f63/IQTAqsMs707wTpu15dWras8NAR_Hui3YDsFXHx1SdfoG1ng?em=2&amp;wdAr=1.7777777777777777" title="Arduino Radar Project PowerPoint" loading="lazy" allowfullscreen style="width:100%;height:100%;border:0;display:block;"></iframe>
  </div>
  <p><a href="https://1drv.ms/p/c/b9ef310711526f63/IQTAqsMs707wTpu15dWras8NAR_Hui3YDsFXHx1SdfoG1ng?em=2&amp;wdAr=1.7777777777777777" target="_blank" rel="noopener noreferrer">Open PowerPoint in a new tab ↗</a></p>
</div>
```

Alternatively provide the current `projects/arduino-radar.html` file and I can generate the replacement with no manual editing.

Note: PowerPoint for the web does not necessarily reproduce every desktop transition or animation. OneDrive public access should be view-only. Check with your supervisor before publishing unpublished PhD results.
