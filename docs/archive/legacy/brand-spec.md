# ResumeScore AI Brand Spec

## Core System

- Brand: ResumeScore AI
- Direction: Apple-inspired minimalism
- Personality: professional, trustworthy, intelligent, premium

## Color Tokens

```css
:root {
  --bg: oklch(100% 0 0);
  --surface: oklch(97.25% 0.002 286.3);
  --fg: oklch(21.24% 0 0);
  --muted: oklch(55.1% 0.01 260);
  --border: oklch(90.5% 0.004 260);
  --accent: oklch(57.7% 0.18 254.5);
}
```

## Typography

- Display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif
- Body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif
- Mono: "SFMono-Regular", ui-monospace, Menlo, Monaco, monospace

## Layout Posture

- Large typography with disciplined line lengths and generous whitespace
- Single primary action zone centered around resume upload
- Hairline borders, minimal shadows, and soft Apple-like radii
- One electric-blue accent reserved for actions, progress, and score emphasis
- Motion should explain state changes, never decorate empty space

## Avoid

- Generic SaaS dashboard structures
- Startup gradients or neon color moments
- Excessive shadows or glass-heavy surfaces
- Cluttered section stacking or dense card grids
