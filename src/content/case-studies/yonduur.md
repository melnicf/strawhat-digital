---
title: "Housing Rental Meta-Platform"
client: "Yonduur"
description: "A streamlined housing rental platform that unifies listings from external partners and native landlords, featuring an AI concierge assistant and intuitive search experience accessible to all users."
image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop"
tags: ["Next.js", "NestJS", "PostgreSQL", "PostGIS", "Capacitor", "AI"]
featured: true
order: 2
year: "2025"
media:
  - type: "image"
    src: "https://placehold.co/1200x900/18181b/a1a1aa?text=Map+Search"
    alt: "Interactive map search interface"
    caption: "PostGIS-powered map with polygon drawing"
  - type: "image"
    src: "https://placehold.co/1200x900/18181b/a1a1aa?text=AI+Concierge"
    alt: "AI concierge chatbot"
    caption: "Conversational property discovery"
  - type: "video"
    src: "/videos/yonduur-demo.mp4"
    poster: "https://placehold.co/1200x900/18181b/a1a1aa?text=App+Demo"
    alt: "Mobile app demonstration"
    caption: "Cross-platform mobile experience"
---

## The Challenge

The housing rental market suffers from severe fragmentation. Users must navigate multiple platforms with inconsistent interfaces, while landlords face barriers to reaching potential tenants directly. The goal: create a unified platform that makes finding and listing rental properties as intuitive as possible for everyone.

## The Solution

Yonduur unifies the rental market through a dual-listing architecture that aggregates external partner feeds alongside native landlord listings. Users access the complete rental inventory from a single interface, with clear source attribution for transparency.

The search experience centers on an interactive map powered by PostGIS. Users can draw custom search areas, apply comprehensive filters, and switch between split, list, and map views. An AI concierge assistant provides conversational guidance for users who prefer natural language queries over manual filtering.

For landlords, the platform offers a complete management system: multi-step listing creation, auto-save drafts, drag-and-drop image uploads, and publish controls. The partner integration handles scheduled synchronization, image caching, rate limiting, and compliance tracking automatically.

Built mobile-first with Capacitor for native iOS and Android apps, the platform supports multiple languages with localized formatting. Personalization features—saved searches, favorites, and account dashboards—ensure users can pick up exactly where they left off.

### Key Features

- **Interactive Map Search** — PostGIS-powered search with polygon drawing, bounds filtering, and real-time updates
- **Comprehensive Filters** — Location, price, type, amenities, availability, size, and rating
- **Multiple View Modes** — Split (list + map), list-only grid, and map-only options
- **AI Concierge** — Conversational chatbot for natural language property discovery
- **Dual Listing System** — Partner and native landlord listings unified in one interface
- **Partner Integration** — Scheduled sync jobs, image caching, rate limiting, click tracking
- **Landlord Tools** — Creation wizard, drafts, uploads, publish controls, statistics dashboard
- **Country Discovery** — Homepage grid with curated imagery and listing counts
- **Personalization** — Saved searches, favorites, notifications, account dashboards
- **Cross-Platform** — Capacitor for iOS/Android, responsive design, touch-optimized UI
- **Internationalization** — Multi-language support, localized currency, region-specific content

### Technologies

- **Frontend** — Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend** — NestJS, PostgreSQL with PostGIS, Prisma ORM
- **Maps** — MapLibre GL, Mapbox Draw
- **Infrastructure** — AWS S3, CloudFront CDN, Docker
- **Auth** — OAuth 2.0 (Google, Apple), JWT
- **Mobile** — Capacitor for iOS/Android
- **i18n** — next-intl
