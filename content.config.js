import { defineContentConfig, defineCollection } from '@nuxt/content';
import { z } from 'zod';

export default defineContentConfig({
  collections: {
    tutorials: defineCollection({
      // Load every file inside the `content` directory
      source: 'tutorials/**',
      // Specify the type of content in this collection
      type: 'page',
      schema: z.object({
        steps: z.object(),
        route: z.string(),
        exact: z.boolean().optional(),
        language: z.string()
      })
    })
  }
});
