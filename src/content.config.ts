import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string().transform((str) => new Date(str)),
        lang: z.enum(['en', 'ja']),
        tags: z.array(z.string()).default([]),
        coverImage: z.string().optional(),
        featured: z.boolean().default(false),
        problem: z.string().optional(),
        solution: z.string().optional(),
        techStack: z.array(z.string()).default([]),
        impact: z.string().optional(),
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
