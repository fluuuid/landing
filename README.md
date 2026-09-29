# FLUUUID landing

A responsive WebGL landing inspired by the supplied 10-second FLUUUID ident. The original SVG is sampled directly in a shader: broken horizontal strips, scanline displacement, six ghost trails, exposure leaks, and signal debris share a stepped 25 fps rhythm. Bursts resolve after 2.88 seconds into the clean wordmark. Use **Replay intro** to watch it again.

The layout and SVG remain readable if WebGL is unavailable or its context is lost. Reduced motion disables the glitch and continuous rendering. Rendering pauses in hidden tabs, pixel density is capped at 1.5, and fonts are bundled locally.

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
