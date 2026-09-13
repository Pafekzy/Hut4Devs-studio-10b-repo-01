# Hut4Devs Brand Assets

This directory contains the canonical standalone vector brand assets for **Hut4Devs**. These assets are fully self-contained vector SVGs with transparent backgrounds, requiring no external React or Tailwind dependencies.

---

## Brand Asset Catalog

| File | Description | Background | Primary Use Cases |
| :--- | :--- | :--- | :--- |
| **`hut4devs-mark.svg`** | Standalone Hut/Keycap/4 mark symbol (64×64) | Transparent | App Icon, Browser Favicon, Square Profile / Avatar, Slack / Discord Icon |
| **`hut4devs-logo-horizontal.svg`** | Horizontal mark + "Hut4Devs" wordmark | Transparent (for Light) | Website Header / Navbar, Documentation, Invoices, Email Signatures |
| **`hut4devs-logo-horizontal-dark.svg`** | Horizontal mark + "Hut4Devs" wordmark | Transparent (for Dark) | Dark-mode navigation headers, terminal headers, dark deck footers |
| **`hut4devs-logo-vertical.svg`** | Stacked mark + centered "Hut4Devs" wordmark | Transparent (for Light) | Landing splash screens, presentation title slides, posters, marketing cards |
| **`hut4devs-logo-vertical-dark.svg`** | Stacked mark + centered "Hut4Devs" wordmark | Transparent (for Dark) | Dark presentation title slides, hero keynotes, dark-theme splash screens |

---

## Asset Selection Guide

### 📱 App Icon & Favicons
- **Use:** `hut4devs-mark.svg`
- Designed on a symmetrical square keycap base with 28% corner radius (`rounded-[28%]`) and subtle depth. Scales crisply down to 16×16 and up to 512×512.

### 🌐 Website Headers & Navbars
- **Light Theme:** `hut4devs-logo-horizontal.svg`
- **Dark Theme:** `hut4devs-logo-horizontal-dark.svg`
- Compact 56px height with optical baseline alignment for horizontal navbars and toolbars.

### 📊 Presentations & Keynotes
- **Title / Splash Slides:** `hut4devs-logo-vertical.svg` (or `hut4devs-logo-vertical-dark.svg`)
- **Slide Corner / Header / Footer:** `hut4devs-logo-horizontal.svg` (or `hut4devs-logo-horizontal-dark.svg`)

### 📣 Social Media
- **Profile Pictures / Avatars (Square / Circular):** `hut4devs-mark.svg`
- **Banner Headers / OpenGraph (OG) Images / Posts:** `hut4devs-logo-vertical.svg` (or dark equivalent) centered on a branded canvas (`#FFF9EE` or `#2F1707`).

### ☀️ Light Backgrounds
- Use `hut4devs-logo-horizontal.svg` or `hut4devs-logo-vertical.svg`.
- Wordmark rendered in Dark Chocolate (`#5A2D0C`) with Deep Golden Brown (`#B77620`) accent on the "4".

### 🌙 Dark Backgrounds
- Use `hut4devs-logo-horizontal-dark.svg` or `hut4devs-logo-vertical-dark.svg`.
- Wordmark rendered in Soft Cream (`#FFF9EE`) with Caramel Gold (`#D49A47`) accent on the "4".

---

## Canonical Brand Colors

| Swatch | Color Name | HEX Code | Role |
| :--- | :--- | :--- | :--- |
| ![#5A2D0C](https://via.placeholder.com/15/5A2D0C/000000?text=+) | **Dark Chocolate** | `#5A2D0C` | Keycap body, light-mode wordmark text, primary text |
| ![#C88D3A](https://via.placeholder.com/15/C88D3A/000000?text=+) | **Caramel Gold** | `#C88D3A` | Keycap outline, roof vector, signature 4 vector, dark accent |
| ![#B77620](https://via.placeholder.com/15/B77620/000000?text=+) | **Deep Golden Brown** | `#B77620` | Light-mode wordmark "4" accent color |
| ![#FFF9EE](https://via.placeholder.com/15/FFF9EE/000000?text=+) | **Soft Cream** | `#FFF9EE` | Keycap inner structure & doorway, dark-mode wordmark text |
| ![#F7F1E7](https://via.placeholder.com/15/F7F1E7/000000?text=+) | **Warm Ivory** | `#F7F1E7` | Brand canvas and card surface background |
| ![#2F1707](https://via.placeholder.com/15/2F1707/000000?text=+) | **Dark Surface** | `#2F1707` | Keycap bottom lip shadow, dark surface background |

---

## Typography & Geometry Notes

- **Wordmark Typeface:** `Fraunces`, Georgia, serif (Weight: 700 / 800 bold for "4", Letter-spacing: `-0.035em`).
- **Body / Interface Font:** `DM Sans`.
- **Symbol Metaphor:**
  - **Keycap Base:** Developers & Builders.
  - **Roof & Doorway:** Hut & Community.
  - **Signature 4:** Hut4Devs & Shared Forward Trail.
- **Optical Vertical Alignment:** In the vertical logo format, the wordmark remains fixed and centered on the composition canvas, while the hut keycap mark is optically positioned directly above the central gold `"4"`.
