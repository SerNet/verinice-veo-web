import { resolve } from "path";
import { Nuxt, NuxtPage } from "@nuxt/schema";

// Create a page for each doc page.
export default async (_inlineOptions: object, nuxt: Nuxt) => {
  /*nuxt.hook('pages:extend', async (pages: NuxtPage[]) => {
    const files = await queryContent().only(['path']).find();

    pages.concat(files.map((file) => ({ path: '/docs' + file.path.replace(/\.\w+$/, '').replace(/\/index$/, '/'), file: resolve(__dirname, file.path ) })));
  });*/
};
