import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  perex: z.string(),
  // Volitelný odkaz "ven" – nejčastěji fotogalerie na Rajčeti nebo Facebook.
  odkaz: z.string().url().optional(),
  odkazPopis: z.string().optional(),
});

const aktuality = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/aktuality' }),
  schema: postSchema,
});

const udalosti = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/udalosti' }),
  schema: postSchema,
});

export const collections = { aktuality, udalosti };
