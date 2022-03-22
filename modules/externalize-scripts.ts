/*
 * verinice.veo web
 * Copyright (C) 2022  Markus Werner
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
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { NuxtOptions, Module } from '@nuxt/types';
// hash-sum is also used by nuxt generator
import hash from 'hash-sum';

/**
 * Partial definition for generator
 * (as it is currently not typed)
 */
interface Generator {
  distNuxtPath: string;
  options: NuxtOptions;
  minifyHtml(this: Generator, html: string): string;
}

/**
 * Hook into nuxt generator (will only work for files used in production)
 * to rewrite inline scripts into external scipt files
 */
export default (function () {
  this.nuxt.hook('generate:before', (generator: Generator) => {
    const distNuxtPath = generator.distNuxtPath;
    const publicPath = this.options.build.publicPath || '';
    const _minifyHtml = generator.minifyHtml;
    // Patch generator.minifyHtml to externalize inline scripts
    generator.minifyHtml = function (...params) {
      const html = _minifyHtml.apply(this, params);
      return html.replace(/<script([^>]*)>(.+?)<\/script>/gis, (text, args, content) => {
        // if src is already defined, skip rewrite
        if (args.includes('src=')) return text;
        const codeHash = hash(content);
        const fileName = `${codeHash}.js`;
        // _nuxt folder in dist
        const filePath = resolve(distNuxtPath, fileName);
        // create external javascript file (same hash = same content)
        writeFileSync(filePath, content);
        return `<script${args} src="${publicPath}${fileName}"></script>`;
      });
    } as Generator['minifyHtml'];
  });
} as Module<any>);