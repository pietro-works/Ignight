# Deployment Checklist

## Before Upload
- Run JS syntax checks.
- Validate locale deck IDs and tier counts.
- Test first visit with a clean browser profile.
- Test returning visit after accepting the age gate.
- Test EN, PL, PT, FR, and DE.
- Test both game modes and all spice tiers.
- Test sponsor click tracking with a real destination URL.
- Replace `contact@ignight.me` if needed.

## Upload
- Upload only the production app files to the intended web root.
- Archive the existing live files before replacement.
- Keep local experiments, diagnostics, and private credentials out of the upload.

## After Upload
- Visit the live site on mobile data and Wi-Fi.
- Confirm icons, manifest, CSS, scripts, and locale files load.
- Confirm no browser console errors.
- Confirm analytics events are firing in `window.IgnightAnalytics.queue`.
- Confirm sponsor slots appear only on game select and results.
