/*
 * verinice.veo web
 * Copyright (C) 2023  Jonas Heitmann
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { resolve } from 'path';
import { defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
  setup (_options, nuxt) {
    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {};
    nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || [];
    nuxt.options.nitro.externals.inline.push(resolve('./docs'));

    nuxt.hooks.hook('content:context', (contentContext) => {
      // @see https://content.nuxtjs.org/api/advanced#transformers. DONT PREFIX WITH ./, will break import (TODO-NuxtContent 2.3.0)
      contentContext.transformers.push(resolve('modules/docs/language-setter.ts'));
    });
  }
});
