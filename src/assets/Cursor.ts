/**
 * Custom Cursor Generator
 * SVG data-URI crosshair cursor for bug smashing
 */

// ─── CROSSHAIR SVG ──────────────────────────────────────────────────────────

const CROSSHAIR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <!-- Outer ring -->
  <circle cx="16" cy="16" r="12" fill="none" stroke="#00ffff" stroke-width="1.5" opacity="0.8"/>
  <!-- Inner ring -->
  <circle cx="16" cy="16" r="7" fill="none" stroke="#00ffff" stroke-width="1" opacity="0.5"/>
  <!-- Crosshair lines -->
  <line x1="16" y1="1" x2="16" y2="9" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="16" y1="23" x2="16" y2="31" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="1" y1="16" x2="9" y2="16" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="23" y1="16" x2="31" y2="16" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Center dot -->
  <circle cx="16" cy="16" r="2" fill="#ff0000"/>
  <circle cx="16" cy="16" r="1" fill="#ffffff"/>
  <!-- Direction indicators -->
  <line x1="16" y1="4" x2="16" y2="6" stroke="#ffffff" stroke-width="0.8" opacity="0.7"/>
  <line x1="16" y1="26" x2="16" y2="28" stroke="#ffffff" stroke-width="0.8" opacity="0.7"/>
  <line x1="4" y1="16" x2="6" y2="16" stroke="#ffffff" stroke-width="0.8" opacity="0.7"/>
  <line x1="26" y1="16" x2="28" y2="16" stroke="#ffffff" stroke-width="0.8" opacity="0.7"/>
</svg>`.trim();

const SMASH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <!-- Outer ring (pressed) -->
  <circle cx="16" cy="16" r="14" fill="none" stroke="#ff0000" stroke-width="2" opacity="0.9"/>
  <circle cx="16" cy="16" r="10" fill="none" stroke="#ff0000" stroke-width="1.5" opacity="0.6"/>
  <!-- Crosshair lines -->
  <line x1="16" y1="0" x2="16" y2="8" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
  <line x1="16" y1="24" x2="16" y2="32" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
  <line x1="0" y1="16" x2="8" y2="16" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
  <line x1="24" y1="16" x2="32" y2="16" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
  <!-- Center smash point -->
  <circle cx="16" cy="16" r="3" fill="#ffffff" opacity="0.9"/>
  <circle cx="16" cy="16" r="1.5" fill="#ff0000"/>
</svg>`.trim();

// ─── EXPORTED CURSORS ───────────────────────────────────────────────────────

export function getCrosshairDataURI(): string {
  return `url("data:image/svg+xml;base64,${btoa(CROSSHAIR_SVG)}") 16 16, crosshair`;
}

export function getSmashDataURI(): string {
  return `url("data:image/svg+xml;base64,${btoa(SMASH_SVG)}") 16 16, crosshair`;
}

export function getCrosshairSVG(): string {
  return CROSSHAIR_SVG;
}

export function getSmashSVG(): string {
  return SMASH_SVG;
}

export function createCursorStyle(): { normal: string; pressed: string } {
  return {
    normal: getCrosshairDataURI(),
    pressed: getSmashDataURI(),
  };
}
