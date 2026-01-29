import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      description: z.string(),
      // Keep as string for now since markdown uses absolute paths
      // We'll resolve these in components using imageMap
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
            poster: z.string().optional(),
            alt: z.string(),
            caption: z.string().optional(),
          })
        )
        .optional(),
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/testimonials" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    image: z.string().optional(),
    website: z.string().url().optional(),
    featured: z.boolean().default(true),
    order: z.number().default(0),
  }),
});

export const collections = {
  "case-studies": caseStudies,
  testimonials,
};
