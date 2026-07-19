import { html, svg, type SVGTemplateResult, type TemplateResult } from 'lit';

// Inner shapes MUST be built with lit's `svg` tag: interpolating an
// `html` fragment into <svg> lands it in the HTML namespace and it
// never paints. The <svg> wrapper itself is fine inside `html`.
const line = (inner: SVGTemplateResult): TemplateResult => html`
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    ${inner}
  </svg>
`;

/** Inline line-style icons for the vehicle sheet (no emoji glyphs). */
export const sheetIcons = {
  collapse: line(svg`<path d="M6 9l6 6 6-6" />`),
  expand: line(svg`<path d="M6 15l6-6 6 6" />`),
  close: line(svg`<path d="M6 6l12 12M18 6L6 18" />`),
  bus: line(svg`
    <rect x="4" y="4" width="16" height="12" rx="2" />
    <path d="M4 11h16M8 16v3M16 16v3" />
    <circle cx="8.5" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="15.5" cy="13.5" r="0.6" fill="currentColor" />
  `),
  me: html`
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 12 7 12s7-6.8 7-12a7 7 0 0 0-7-7z" />
      <circle cx="12" cy="9" r="2.6" fill="var(--surface)" />
    </svg>
  `,
};
