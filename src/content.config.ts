import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string().transform((str) => new Date(str)),
        lang: z.enum(['en', 'ja']),
        tags: z.array(z.string()).default([]),
        coverImage: z.string().optional(),
        galleryImages: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
        problem: z.string().optional(),
        solution: z.string().optional(),
        techStack: z.array(z.string()).default([]),
        impact: z.string().optional(),
        role: z.string().optional(),
        context: z.string().optional(),
        timelineLabel: z.string().optional(),
        awards: z.array(z.string()).default([]),
        stations: z.array(z.string()).default([]),
        category: z.enum(['Practice', 'Tools', 'Digital Twin']).optional(),
    })
});

const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string().transform((str) => new Date(str)),
        lang: z.enum(['en', 'ja']),
        tags: z.array(z.string()).default([]),
        coverImage: z.string().optional(),
        readingTime: z.string().optional(),
    })
});

export const collections = { projects, blog };
