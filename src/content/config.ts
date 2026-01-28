import { defineCollection, z } from "astro:content";

// Case studies collection schema
const caseStudiesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    client: z.string(),
    description: z.string(),
    image: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    year: z.string().optional(),
    media: z
      .array(
        z.object({
          type: z.enum(["image", "video"]),
          src: z.string(),
          srcMobile: z.string().optional(),
          alt: z.string(),
          caption: z.string().optional(),
        })
      )
      .optional(),
  }),
});

// Testimonials collection schema
const testimonialsCollection = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    quote: z.string(),
    image: z.string().optional(),
    featured: z.boolean().default(true),
    order: z.number().default(0),
  }),
});

export const collections = {
  "case-studies": caseStudiesCollection,
  testimonials: testimonialsCollection,
};
