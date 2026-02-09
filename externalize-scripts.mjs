/*
 * verinice.veo web
 * Copyright (C) 2026 jae
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

/** @description: This script processes HTML: It moves the content of inline scripts into external files */

import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NUXT_BUILD_DIR = resolve(__dirname, '.output', 'public');

(function init() {
  const htmlFiles = glob.sync(`${NUXT_BUILD_DIR}/**/*.html`);

  for (const htmlFile of htmlFiles) {
    processHtmlFile(htmlFile);
  }
})();

function processHtmlFile(htmlFile) {
  const htmlContent = fs.readFileSync(htmlFile, 'utf8');
  const nuxtDir = `_nuxt`;

  const regex = new RegExp(/<script([^>]*)>([\s\S]*?)<\/script>/g);
  const processedHtml = htmlContent.replace(regex, (match, attributes, content) => {
    // Skip empty scripts
    if (!content.trim()) {
      return match;
    }

    // Skip scripts with id="__NUXT_DATA__"
    if (attributes.includes('id="__NUXT_DATA__"')) {
      return match;
    }

    // Skip scripts that already have src attribute, they aren't inline scripts
    if (attributes.includes('src=')) {
      return match;
    }

    // Process inline script
    // Generate a unique filename
    const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    const scriptFilename = `script-${hash}.js`;
    const scriptPath = path.join(NUXT_BUILD_DIR, nuxtDir, scriptFilename);

    // Copy the script's content into a file
    if (!fs.existsSync(scriptPath)) {
      fs.writeFileSync(scriptPath, content);
    }

    // Replace the script's content with a reference to the new external script
    return `<script${attributes} src="/${nuxtDir}/${scriptFilename}"></script>`;
  });

  // Write the processed HTML back into the original file
  fs.writeFileSync(htmlFile, processedHtml);
}
