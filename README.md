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

## Copyright and legal notice

© 2026 Chaery Yoon. All rights reserved.

**Light design.** All lighting designs, light plots, show programming, 3D visualisations and texts on this site are the original work of Chaery Yoon and are protected by copyright. They may not be copied, reproduced, adapted, distributed or published, in whole or in part, without prior written permission.

**Photography and video.** Photographs and videos remain © their respective photographers and videographers, as credited on each project page, and are shown with their permission. Where no credit is given, they are © Chaery Yoon. Using them requires the permission of the rights holder.

**Artists and people shown.** Artists, performers and other people appear in the documentation of the events. Their rights to their own image and name remain with them. Images of people may not be reused, in particular not for advertising or in any other context. To have an image removed, write to chaeryyoon.de@gmail.com.

**Third parties.** Names of artists, venues, festivals and organisations belong to their respective owners. Mentioning them describes the collaboration and does not imply endorsement.

**Code.** The source code is public only so that GitHub Pages can host the site. No licence is granted: it may be viewed, but not copied or reused.

**No AI training or text and data mining.** Under § 44b(3) of the German Copyright Act (UrhG) and Article 4(3) of Directive (EU) 2019/790, Chaery Yoon expressly reserves the right to text and data mining for all content on this site and in this repository. Using any of it (texts, images, designs, light plots or code) to train, fine-tune or otherwise develop artificial intelligence or machine-learning systems, or to generate content with such systems, is prohibited without prior written permission. This reservation is also given in machine-readable form in `robots.txt`, `.well-known/tdmrep.json` and the `tdm-reservation` meta tag on every page.
