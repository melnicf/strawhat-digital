---
title: "Housing Rental Meta-Platform"
client: "Yonduur"
description: "A streamlined housing rental platform that unifies listings from external partners and native landlords, featuring an AI concierge assistant and intuitive search experience accessible to all users."
image: "/yonduur/desktop/home-hero.png"
tags: ["Next.js", "NestJS", "PostgreSQL", "PostGIS", "Capacitor", "AI"]
featured: true
order: 2
year: "2025"
media:
  - type: "image"
    src: "/yonduur/desktop/home-hero.png"
    srcMobile: "/yonduur/iphone/home-hero-iphone.png"
    alt: "Homepage hero section"
    caption: "Welcome to Yonduur - unified rental platform"
  - type: "image"
    src: "/yonduur/desktop/listings.png"
    srcMobile: "/yonduur/iphone/listings-iphone.png"
    alt: "Property listings view"
    caption: "Comprehensive property listings with filters"
  - type: "image"
    src: "/yonduur/desktop/listings-map-draw.png"
    srcMobile: "/yonduur/iphone/listings-map-draw-iphone.png"
    alt: "Interactive map search interface"
    caption: "PostGIS-powered map with polygon drawing"
  - type: "image"
    src: "/yonduur/desktop/listing-details.png"
    srcMobile: "/yonduur/iphone/listing-details-iphone.png"
    alt: "Property listing details"
    caption: "Detailed property information and features"
  - type: "image"
    src: "/yonduur/desktop/listing-details-pois.png"
    srcMobile: "/yonduur/iphone/listing-details-pois-iphone.png"
    alt: "Property points of interest"
    caption: "Nearby points of interest and amenities"
  - type: "image"
    src: "/yonduur/desktop/listing-details-own.png"
    srcMobile: "/yonduur/iphone/listing-details-own-iphone.png"
    alt: "Own property listing details"
    caption: "Landlord dashboard for property management"
  - type: "image"
    src: "/yonduur/desktop/home-ai-chat.png"
    srcMobile: "/yonduur/iphone/home-ai-chat-iphone.png"
    alt: "AI concierge chatbot"
    caption: "Conversational property discovery"
  - type: "image"
    src: "/yonduur/desktop/account-listings.png"
    srcMobile: "/yonduur/iphone/account-listings-iphone.png"
    alt: "Account listings management"
    caption: "Manage your property listings"
  - type: "image"
    src: "/yonduur/desktop/account-favorites.png"
    srcMobile: "/yonduur/iphone/account-favorites-iphone.png"
    alt: "Saved favorites"
    caption: "Your saved favorite properties"
  - type: "image"
    src: "/yonduur/desktop/account-saved-searches.png"
    srcMobile: "/yonduur/iphone/account-saved-searches-iphone.png"
    alt: "Saved searches"
    caption: "Manage your saved search criteria"
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
