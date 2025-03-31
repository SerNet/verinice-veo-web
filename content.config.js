import { defineContentConfig, defineCollection, z } from '@nuxt/content';
export default defineContentConfig({
  collections: {
    tutorials: defineCollection({
      // Load every file inside the `content` directory
      source: 'tutorials/**',
      // Specify the type of content in this collection
      type: 'page'
    })
  }
});
