# FLUUUID landing

A responsive WebGL landing inspired by the supplied 10-second FLUUUID ident. The original SVG is sampled directly in a shader: fractured letter strips, independent glyph offsets, stretched slices, nine uneven ghost trails, ink abrasion, and ripped fragments give the logo a distressed texture. Fragment positions, trails, screen tearing, and exposure leaks interpolate continuously at the display's refresh rate. Sharp attacks and smooth releases preserve the dramatic hits; fine raster defects retain their abrupt character. Logo damage has its own intensity track, separate from the background interference. Bursts resolve after 2.88 seconds into the clean wordmark. Use **Replay intro** to watch it again.

The layout and SVG remain readable if WebGL is unavailable or its context is lost. Reduced motion disables the glitch and continuous rendering. Rendering pauses in hidden tabs and stops after the intro when the pointer settles, then resumes on interaction. The shader confines the costly logo effects to the logo region, uses a 1.8 million pixel budget with density capped at 1.5, and applies time-based pointer easing. Fonts are bundled locally.

## Run

```sh
npm install
npm run dev
```

## Publish

```sh
npm run build
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, or Cloudflare Pages). The site uses no server endpoints or environment variables.

For the `fluuuid/landing` repository, the included GitHub Actions workflow deploys on pushes to `main`. In repository Settings → Pages, choose **GitHub Actions** as the source. Relative asset URLs work under the repository path or a custom domain.

## Edit

- Copy and section markup: `index.html`
- Layout, transitions, reduced-motion styles: `src/style.css`
- WebGL renderer and fallback: `src/main.js`
- Glitch composition: `src/atmosphere.frag`
- Intensity and burst timing: `src/intro.js`

The concept copy is illustrative. Replace it with approved brand language before a public launch. No contact address or company claims are assumed.
