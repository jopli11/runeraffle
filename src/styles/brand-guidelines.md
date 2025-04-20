# Probemas Brand Guidelines

## Overview
This document outlines the brand guidelines for Probemas and its product lines, including Probemas | Raffles. These guidelines should be followed when creating new products or modifying existing ones to ensure a consistent brand experience.

## Brand Name
- **Primary Brand**: Probemas
- **Product Line Format**: Probemas | [Product Name]
  - Example: "Probemas | Raffles"

## Key Files
The following files contain essential brand styling elements:
- `src/styles/probemas-theme.css` - Core theme variables
- `src/index.css` - Global CSS variables
- `src/components/layout/Header.tsx` - Header component with branding
- `src/components/layout/Footer.tsx` - Footer component with branding

## Colors

### Primary Brand Colors
```css
--probemas-gold: #eab516;  /* Primary accent color */
--probemas-dark: #1a1e2c;  /* Dark background */
--probemas-accent: #3b82f6; /* Secondary accent */
```

### Extended Color Palette
```css
--background: 218 35% 7%;      /* Dark background */
--foreground: 0 0% 100%;       /* White text */
--card: 222 42% 11%;           /* Card background */
--primary: 43 91% 50%;         /* #eab516 Gold */
--primary-foreground: 0 0% 0%; /* Black text on primary */
--secondary: 33 29% 16%;       /* #372f18 Secondary buttons */
--secondary-foreground: 43 91% 50%; /* Gold text on secondary */
--destructive: 0 63% 50%;      /* Red for destructive elements */
--destructive-foreground: 0 0% 100%; /* White text on destructive */
--border: 217 33% 25%;         /* Border color */
```

## Typography

### Font Family
```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Logo Typography
- **"Pro"**: Primary gold color, font-weight: 800
- **"bemas"**: White color, font-weight: 800
- **Divider**: White "|" character between Probemas and product name
- **Product Name**: Primary gold color, font-weight: 800

### Headings
```css
h1, h2, h3, h4, h5, h6 {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-weight: 600;
  line-height: 1.2;
}
```

## Components

### Buttons

#### Primary Button
- Background: Primary gold (#eab516)
- Text color: Black
- Font weight: 600
- Hover effects:
  - Subtle scale transform
  - Drop shadow
  - Background lightens slightly

```jsx
const PrimaryButton = styled(Button)`
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 0.875rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  box-shadow: 0 10px 15px -3px rgba(234, 181, 22, 0.25);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(234, 181, 22, 0.3);
  }
`;
```

#### Secondary Button
- Background: Dark secondary color (#372f18)
- Text color: Gold
- Border: 1px solid primary gold
- Hover effect: Background darkens slightly

```jsx
const SecondaryButton = styled(Button)`
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  padding: 0.875rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border: 1px solid hsl(var(--primary));
  
  &:hover {
    background-color: #453b1f;
    transform: translateY(-4px);
  }
`;
```

### Cards
- Background color: #181c2e (--card)
- Border radius: 0.75rem or 1rem
- Drop shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- Hover state: Transform translateY(-5px) and increased shadow

### Containers
- Max width: 1280px (desktop)
- Padding: 0 1rem on smaller devices
- Responsive breakpoints:
  - 640px
  - 768px
  - 1024px
  - 1280px

## Animations

### Keyframes
The brand uses several animation keyframes for interactive elements:

```jsx
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;
```

## Header & Footer

### Header
- Sticky position with z-index: 50
- Border-bottom: 1px solid rgba(255, 255, 255, 0.1)
- Background color: hsl(var(--card))
- Logo: "Probemas" (without product name in header)
- Navigation links with underline animation on hover/active

### Footer
- Background color: hsl(220, 47%, 5%)
- Border-top: 1px solid rgba(255, 255, 255, 0.1)
- Social media links with hover animation
- Logo includes only "Probemas" (not product name)
- Copyright with current year: ©[YEAR] Probemas. All Rights Reserved.

## Creating New Products
When creating new products under the Probemas brand:

1. Maintain the "Probemas | [Product Name]" format in the landing page and meta tags
2. Use only "Probemas" in the header/navigation
3. Apply the same color scheme and component styling
4. Import the same theme files for consistency

## Dark Mode / Light Mode
The current implementation uses a dark theme by default. For light mode implementation:

1. Create a light theme variant in the theme CSS file
2. Use CSS variables with the same names but different values
3. Implement theme toggling with the next-themes library (already included) 