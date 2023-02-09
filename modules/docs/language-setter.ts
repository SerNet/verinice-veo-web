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
import { ParsedContent } from "@nuxt/content/dist/runtime/types";

import { LOCALES } from "~~/types/locales";

/*
* We can't use defineTransformer here, as the package currently doesn't export it in the directory we need it to. (TODO-NuxtContent 2.3.0)
* @see https://content.nuxtjs.org/api/advanced#transformers
*/
export default ({
  name: 'language-setter',
  extensions: ['.md', '.yaml'],
  transform: (content: ParsedContent, _options = {}) => {
    const idParts = content._id.split('.');
    // Pop extension
    idParts.pop();
    // Pop language
    const language = idParts.pop();
    
    // Language either beeing a string or undefined is okay (undefined if there is no .de.md or .en.md suffix for the file)
    content.language = LOCALES.find((locale) => locale.code === language)?.code;
    return content;
  }
});
