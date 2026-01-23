# Strawhat Digital

A modern, animated company website for **Strawhat Digital** — a software solutions company delivering high-quality digital products.

## About

Strawhat Digital is a software solutions company currently operated as a solo venture. This website serves as more than just a portfolio — it's a complete company presence that showcases projects, communicates value, and establishes credibility.

## Website Structure

Single-page design with smooth scroll navigation between sections:

| Section        | Description                                              |
| :------------- | :------------------------------------------------------- |
| **Hero**       | Bold introduction with animated elements and 3D effects |
| **About**      | Company story, mission, and what sets us apart           |
| **Services**   | Software solutions and capabilities offered              |
| **Projects**   | Showcase of work with case studies and results           |
| **Testimonials** | Client feedback and social proof                       |
| **Contact**    | Get in touch form and contact information                |

### Navigation
- Fixed navbar at top
- Smooth scroll to sections via anchor links (`#about`, `#services`, etc.)
- Active section highlighting as user scrolls
- Mobile-responsive hamburger menu

## Design Philosophy

### Visual Style
- **Dark mode by default** — Modern, sleek aesthetic
- **Light mode support** — Accessible theme switching
- **Micro-interactions** — Hover effects, transitions, and feedback
- **Scroll animations** — Elements animate into view as you scroll
- **Parallax effects** — Depth and movement on scroll
- **3D elements** — Interactive 3D components and effects

### Technical Approach
- **Tailwind CSS 4.x** — Utility-first styling with CSS variables for theming
- **Theme tokens** — Centralized color/spacing tokens for scalability
- **CSS custom properties** — Easy theme switching without rebuilding
- **Component-based** — Reusable, maintainable component architecture

## Tech Stack

- **[Astro 5.x](https://astro.build)** — Static site generation with islands architecture
- **[Tailwind CSS 4.x](https://tailwindcss.com)** — Utility-first CSS framework
- **TypeScript** — Type-safe development
- **View Transitions** — Smooth page transitions
- **Animation libraries** — (TBD: GSAP, Framer Motion, or Motion One)

## Project Structure

```
/
├── public/
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── assets/           # Images, SVGs, and static assets
│   ├── components/
│   │   ├── ui/           # Base UI components (buttons, cards, etc.)
│   │   ├── sections/     # Page sections (Hero, About, Services, etc.)
│   │   ├── Navbar.astro  # Fixed navigation with scroll links
│   │   └── Footer.astro  # Site footer
│   ├── layouts/
│   │   └── Layout.astro  # Main page layout
│   ├── pages/
│   │   └── index.astro   # Single page with all sections
│   ├── styles/
│   │   ├── global.css    # Global styles and Tailwind imports
│   │   └── theme.css     # Theme tokens and CSS variables
│   ├── lib/              # Utilities and helpers
│   └── data/             # Static data (projects, testimonials, services)
├── astro.config.mjs
└── tsconfig.json
```

## Theming Strategy

Using Tailwind CSS 4.x with CSS custom properties for scalable theming:

```css
/* Theme tokens in CSS variables */
:root {
  --color-background: theme(colors.zinc.950);
  --color-foreground: theme(colors.zinc.50);
  --color-primary: theme(colors.blue.500);
  --color-accent: theme(colors.violet.500);
  /* ... */
}

[data-theme="light"] {
  --color-background: theme(colors.white);
  --color-foreground: theme(colors.zinc.900);
  /* ... */
}
```

This approach allows:
- Easy theme switching via data attribute
- Consistent design tokens across components
- Simple color palette updates
- Dark/light mode without class duplication

## Commands

| Command          | Action                                      |
| :--------------- | :------------------------------------------ |
| `pnpm install`   | Install dependencies                        |
| `pnpm dev`       | Start dev server at `localhost:4321`        |
| `pnpm build`     | Build production site to `./dist/`          |
| `pnpm preview`   | Preview production build locally            |

## Roadmap

- [ ] Set up theme tokens and CSS variables
- [ ] Create base UI components
- [ ] Build fixed Navbar with smooth scroll navigation
- [ ] Build Hero section with animations
- [ ] Build About section
- [ ] Build Services section
- [ ] Build Projects showcase section
- [ ] Build Testimonials section
- [ ] Build Contact section with form
- [ ] Implement scroll-triggered animations
- [ ] Add 3D interactive elements
- [ ] Add active section highlighting in navbar
- [ ] Mobile responsive navigation
- [ ] Performance optimization
- [ ] Deploy

## License

Private — All rights reserved.
