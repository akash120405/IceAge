# Igloo — Interactive Study

A static, interactive 3D visual study inspired by Igloo Inc. This is an independent prototype, not the original Igloo website.

## Host on GitHub Pages

1. Extract this ZIP.
2. Create a GitHub repository, then upload the extracted files and the entire `assets` folder to its root. `index.html` must be at the repository root, not inside another folder. Upload the extracted contents, not the ZIP itself.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the **main** branch (or your repository's default branch), choose **/(root)**, and click **Save**.
6. Wait for deployment, then open the URL shown in Pages settings.

No build command, package installation, API key, backend, or ChatGPT sign-in is required. All libraries and fonts are included.

Official hosting guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Project layout

- `index.html` — page and accessible interface
- `style.css` — responsive styling
- `app.js` — 3D scene, navigation, project dialogs, and sound
- `assets/` — Three.js, geometry helper, IBM Plex Mono, and third-party licenses
- `.nojekyll` — serves the files without Jekyll processing

## Navigation

This export uses relative asset paths so it works at both `username.github.io/` and `username.github.io/repository/`. Project links use URL fragments to support refreshes and shared links on GitHub Pages without server rewrite rules:

- `#/portfolio/pudgy-penguins`
- `#/portfolio/overpass`

Scroll, use the scene buttons, or press ArrowUp/ArrowDown to move between scenes. Select a project to open its details; use Close or Escape to exit. Sound starts off. The animation respects the device's reduced-motion setting.

## Preview locally

Serve this directory with any static HTTP server. For example, if Python is installed:

```sh
python -m http.server 8000
```

Then open http://localhost:8000/. Use a server rather than opening the HTML file directly because the project uses JavaScript modules.

## Credits

The scene geometry, procedural surfaces, animation, interface, and synthesized audio were authored for this study. Three.js is included under its MIT license (`assets/vendor/THREE-LICENSE.txt`). IBM Plex Mono is included under the SIL Open Font License (`assets/FONT-LICENSE.txt`). Original Igloo proprietary source code, models, and audio are not included.
