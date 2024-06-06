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
// import { writeFileSync, readFile } from 'fs';
// import { resolve } from 'path';
// import glob from 'glob';
// import hash from 'hash-sum';
import { Nuxt } from '@nuxt/schema';

// CURRENTLY DOESN'T WORK AS THERE IS NO "AFTER EVERYTHING" HOOK. CURRENTLY externalize-scripts.js is used instead in the dockerfile

/**
 * Hook running after the build process to externalize all scripts
 */
export default (_inlineOptions: object, _nuxt: Nuxt) => {
  // _nuxt.hooks.hook('build:done', () => {
  //   const BUILD_OUTPUT_DIR = resolve(_nuxt.options.rootDir, '.output', 'public');
  //   let configData: string;
  //   let configFileName: string;
  //   // Get a list of all compiled html files (those could contain <script>)
  //   const htmlFiles = glob.sync(`${BUILD_OUTPUT_DIR}/**/*.html`);
  //   for(const file of htmlFiles) {
  //     // Read every file and check whether <script> exists within. if so, replace it with a link to the config file (created as soon as the first match is found with the config data of the match (all files contain the same config))
  //     readFile(file, (_error, fileContent) => {
  //       const newContent = fileContent.toString().replace(/<script([^>]*)>(.+?)<\/script>/gis, (text, args, content) => {
  //         // If src= is already set, this is not the tag we are looking for, so leave everything as it is
  //         if (args.includes('src=')) {
  //           return text;
  //         }
  //         // If config isn't saved yet, do so
  //         if(!configData && !configFileName) {
  //           configData = content;
  //           configFileName = `config.${hash(content)}.js`;
  //           writeFileSync(resolve(BUILD_OUTPUT_DIR, '_nuxt', configFileName), configData);
  //         }
  //         // Replace old script tag with new one with the link
  //         return `<script${args} src="/_nuxt/${configFileName}"></script>`;
  //       });
  //       writeFileSync(file, newContent);
  //     });
  //   }
  // });
};
