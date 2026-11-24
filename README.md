# chaery-yoon.de

Plain HTML, CSS and JavaScript, served by GitHub Pages from `main`. No build step.

- `index.html`: the 3D room (home)
- `work.html`: the project list
- `about.html`: bio and contact
- `works/<project>/`: one folder per project, with its `index.html`, images and `cover.jpg`
- `works/works.css`, `works/works.js`: shared by the Work page and every project page

## Adding a project

1. Copy `works/_template/` to `works/<project-name>/` (lowercase, hyphens).
2. Put the images in that folder, plus `cover.jpg` (shown when hovering the name on the Work page).
3. In the new `index.html`, edit the title, the meta line, the text and the `<img>` lines.
4. In `work.html`, add one `<li>` at the top of the list (newest first), copying an existing line.

Folders starting with `_` are not published, so the template never appears on the site.

Before adding photos taken on a phone, check they don't carry GPS location data (most export or "save for web" options strip it).

## Copyright

© 2026 Chaery Yoon. All rights reserved. The code is public so the site can be hosted here, but no licence is granted: the code, text, light designs and images may not be copied or reused without permission. Photographs remain © their photographers, as credited on each project page.
