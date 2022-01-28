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
import { resolve as pathResolve, relative as pathRelative, dirname as pathDirname } from 'path';
import { Module } from '@nuxt/types';
import { contentFileBeforeInstert, contentFileBeforeParse } from '@nuxt/content/types/content';

/**
 * Fields that may contain markdown
 */
const MARKDOWN_FIELDS = { steps: ['title', 'intro'], hints: ['hint'] } as const;
interface MdNode {
  type: 'root' | 'element' | 'text';
  tag?: string;
  props?: Record<string, any>;
  children?: MdNode[];
  value?: string;
}

/**
 * Clean nodes to be displayed correctly inside intro.js
 */
const sanitizeNode = (node: MdNode) => {
  // Do not produce nuxt-link tags, as intro.js will not render vue components
  if (node.tag === 'nuxt-link') {
    const props = { ...node.props, to: undefined, href: node.props?.to || '' };
    delete props.to;
    return { ...node, tag: 'a', props };
  }
  return node;
};

/**
 * Simple markdown html ast to HTML
 */
const toHtml = (node: MdNode): string => {
  const _node = sanitizeNode(node);
  const tag = _node.tag;
  const type = _node.type;
  const children = _node.children?.map(toHtml) || [];
  const props = _node.props ? Object.entries(_node.props).map(([prop, value]) => `${prop}="${value}"`) : [];
  const propStr = props.length ? [''].concat(props).join(' ') : '';
  if (type === 'root') return children.join('');
  if (type === 'text') return node.value || '';
  return tag ? `<${tag}${propStr}>${children.join('')}</${tag}>` : children.join('');
};

export default (function () {
  /**
   * Change image paths before parsing markdown documents
   */
  const replaceImagePaths: contentFileBeforeParse = (file) => {
    // Transforms relative image paths in documents:
    if (/\.md$/.test(file.extension)) {
      const matchImages = /(!\[[^[\]]*\]\()([^()]+?)(\))|(<[^>]*src=")([^"]+?)("[^>]*>)/gm;
      // Find markdown images (a): ![Alt](path) OR html image tags (b): <img...src...>
      file.data = String(file.data).replace(matchImages, (_, prePath, path, postPath, preSrc, src, postSrc) => {
        const filePath = src || path;
        const fileDir = pathDirname(file.path);
        // ...extract src and resolve it relative to file and build relative path from nuxt root directory
        const resolved = pathRelative(this.options.rootDir, pathResolve(fileDir, filePath));
        // replace path with resolved path
        return src ? `${preSrc}${resolved}${postSrc}` : `${prePath}${resolved}${postPath}`;
      });
    }
  };
  this.nuxt.hook('content:file:beforeParse', replaceImagePaths);

  /**
   * Add language property and allow specific keys inside yaml to include markdown
   */
  const extendDocument: contentFileBeforeInstert = async (document, database) => {
    // Compute language by extension
    if (['.md', '.yaml'].includes(document.extension)) {
      const [slug, lang] = document.slug.split('.');
      if (lang) {
        document.lang = lang;
        document.slug = slug;
      }
    }

    // Intro.js documents:
    if (document.extension === '.yaml') {
      // Allow markdown in specific fields (see MARKDOWN_FIELDS)
      for (const [key, fields] of Object.entries(MARKDOWN_FIELDS)) {
        const arr = document[key];
        if (arr && Array.isArray(arr)) {
          for (let i = 0; i < arr.length; i++) {
            const obj = arr[i];
            for (const field of fields) {
              const data = await database.markdown.toJSON(obj[field]);
              obj[field] = toHtml(data.body);
            }
          }
        }
      }
    }
  };
  this.nuxt.hook('content:file:beforeInsert', extendDocument);
} as Module<any>);
