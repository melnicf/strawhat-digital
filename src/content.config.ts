import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
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
          poster: z.string().optional(),
          alt: z.string(),
          caption: z.string().optional(),
        })
      )
      .optional(),
  }),
});

export const collections = { "case-studies": caseStudies };
