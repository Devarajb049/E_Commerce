# ClickCart Design System (`DESIGN.md`)

> **Tagline:** Shop in a click.  
> **Brand Concept:** Clean commerce combining a stylized shopping cart and mouse-click pointer for instant, effortless shopping.

---

## 1. Brand Tokens & Color Palette

ClickCart uses a focused, high-contrast, professional palette designed for commercial trust and clarity.

| Token | CSS Variable | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Indigo** | `--cc-primary` | `#4F46E5` | Primary buttons, active indicators, brand accents |
| **Primary Hover** | `--cc-primary-hover` | `#4338CA` | Hover state for primary actions |
| **Primary Muted** | `--cc-primary-muted` | `#EEF2FF` | Selection cards, subtle pill backgrounds |
| **Orange Accent** | `--cc-accent` | `#F97316` | Micro-interactions, light beams, highlight badges |
| **Orange Hover** | `--cc-accent-hover` | `#EA580C` | Accent hover interaction |
| **Orange Muted** | `--cc-accent-muted` | `#FFF7ED` | Sale badge, low-stock alerts |
| **Dark Text** | `--cc-text` | `#111827` | Primary titles, prices, labels |
| **Secondary Text**| `--cc-muted` | `#6B7280` | Descriptions, metadata, placeholders |
| **Page Background**| `--cc-bg` | `#F9FAFB` | Application canvas background |
| **Card Surface** | `--cc-card` | `#FFFFFF` | Product cards, checkout modules, modals |
| **Border Neutral** | `--cc-border` | `#E5E7EB` | Card dividers, input borders, table borders |
| **Success** | `--cc-success` | `#16A34A` | Order confirmed, in-stock badge, toast success |
| **Warning** | `--cc-warning` | `#D97706` | Low stock alerts, processing status |
| **Error** | `--cc-error` | `#DC2626` | Validation errors, cancelled order, toast error |

---

## 2. Typography Hierarchy

Font Family: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `40px–48px` | 700 / 800 | 1.15 | Homepage hero header |
| **H1** | `32px–36px` | 700 | 1.25 | Page titles, major section headers |
| **H2** | `24px–28px` | 600 / 700 | 1.3 | Card titles, category headers |
| **H3** | `18px–20px` | 600 | 1.35 | Product title, section subheaders |
| **Body** | `15px–16px` | 400 / 500 | 1.5 | General descriptions, form text |
| **Small** | `13px–14px` | 400 / 500 | 1.45 | Helper text, secondary specs |
| **Caption** | `11px–12px` | 500 / 600 | 1.4 | Technical product tags, status badges |
| **Button** | `14px–15px` | 600 | 1.0 | Action button typography |

---

## 3. Spacing Scale

Strict 4px/8px incremental scale:
`4px` | `8px` | `12px` | `16px` | `20px` | `24px` | `32px` | `40px` | `48px` | `64px` | `80px`

- **Card Padding**: `16px` (compact) to `24px` (standard)
- **Form Control Gap**: `16px`
- **Section Margin**: `48px` to `64px`
- **Grid Gap**: `16px` (mobile), `24px` (tablet/desktop)

---

## 4. Elevation & Shadows

| Level | CSS Value | Usage |
| :--- | :--- | :--- |
| **Subtle** | `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)` | Default cards, inputs |
| **Medium** | `0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)` | Hover cards, dropdowns |
| **Elevated** | `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)` | Modals, floating notifications |

---

## 5. Border Radii

- **Micro Controls (checkbox/badges)**: `4px–6px`
- **Form Inputs & Buttons**: `8px–10px`
- **Product Cards & Panels**: `12px–14px`
- **Pill Badges**: `9999px`

---

## 6. Micro-Interactions & Motion System

- **Fast (`120–150ms`)**: Input border focus, button active press `scale(0.98)`
- **Normal (`180–250ms`)**: Product card lift `translateY(-2px)`, arrow shift `translateX(3px)`
- **Emphasis (`350–500ms`)**: Package lid open, modal backdrop reveal
- **Accessibility**: `@media (prefers-reduced-motion: reduce)` disables keyframe transforms.

---

## 7. Component Reference Guide

### 7.1 `<AnimatedOrderButton />`
- **Base**: Indigo `#4F46E5` background with glowing traveling accent on hover.
- **Micro-Interaction**: Icon nudges right `3px` on hover; button slightly lifts.
- **States**: Default, Hover, Active (`scale(0.98)`), Loading (`Processing...`), Success (`✓ Order Placed`).

### 7.2 `<FormInput />` & `<PasswordInput />`
- **Accent Line**: Subtle animated bottom indicator expands on focus.
- **Validation**: Red border with clear helper text for invalid states.
- **Password Toggle**: Accessible eye toggle icon.

### 7.3 `<RadioGroup />` & `<SelectionCard />`
- **Container**: Fully clickable cards with real `<input type="radio">` semantics.
- **Selected**: Solid Indigo border with subtle lavender tinted background.

### 7.4 `<PackageSuccessAnimation />`
- **Sequence**: Entrance → Spring Settle → Flap Opens → SVG Checkmark draws → Order details stagger.

### 7.5 `<OrderTimeline />`
- **Progression**: Placed → Processing → Shipped → Delivered (or Cancelled).
- **Desktop**: Horizontal tracker with connecting progress line.
- **Mobile**: Vertical tracker with full legibility.
