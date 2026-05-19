# Ad And Sponsor Provider Checklist

## Preferred First Test
- Use native sponsor placements before classic banners.
- Place monetization only on game select and results.
- Avoid ads during swiping, reading, or answering cards.
- Require adult-friendly creative that matches the premium tone.

## Provider Setup
- Confirm explicit erotic/kink card-game content is allowed.
- Confirm traffic from PWA/mobile browsers is allowed.
- Confirm blocked categories and creative review controls.
- Confirm payout threshold, payout region, and tax requirements.
- Confirm whether the provider injects popups, redirects, autoplay video, or aggressive tracking.

## Implementation Notes
- Enable sponsor placements with a small runtime config:

```html
<script>
window.IgnightSponsors = {
  mode: {
    enabled: true,
    provider: 'velvet-room',
    placement: 'mode_select',
    url: 'https://ignight.me/partners',
    eyebrow: 'After-dark partner',
    title: 'The Velvet Room',
    body: 'Objects and rituals for after-dark play.',
    cta: 'Visit partner'
  },
  after: {
    enabled: true,
    provider: 'velvet-room',
    placement: 'results',
    url: 'https://ignight.me/partners'
  }
};
</script>
```

Add the config before `scripts/app.js`.

## Metrics To Watch
- `sponsor_impression`
- `sponsor_click`
- click-through rate by placement
- deck completion rate before and after sponsors
- return visits after sponsor exposure
