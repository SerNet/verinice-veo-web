/*
 * verinice.veo web
 * Copyright (C) 2021  Markus Werner, Jonas Heitmann
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
import { ParsedContent } from '@nuxt/content/dist/runtime/types';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';
import { cloneDeep } from 'lodash';

import { onContentUpdate } from './utils';

export interface DocMetaInfo {
  isDir?: boolean;
}

export type DocPageFetchReturn = ParsedContent & DocMetaInfo;

type ContentOptions = { path?: string; locale?: string; localeSeparator?: string; fallbackLocale?: string; where?: object };
const getOptions = (params: ContentOptions, _locale: string) => {
  const fallbackLocale = params.fallbackLocale ?? 'de';
  const localeSeparator = params.localeSeparator ?? '.';
  const locale = params.locale ?? _locale;
  return { ...params, fallbackLocale, localeSeparator, locale };
};

/**
 * Why a special function only to sort? Docs don't only get sorted by their level or their position alone, they always get sorted relative to their parents.
 *
 * @param docs The docs to sort
 * @returns The sorted docs
 */
const sortDocs = (docs: (readonly [string, DocPageFetchReturn])[]) => {
  // Avoid mutation the original docs, to make the function clearer
  const localDocs = cloneDeep(docs);

  // We create a map with all paths as keys to make lookup easier
  const docsAsPathMap = new Map(localDocs);

  return localDocs.sort(([_pathA, itemA], [_pathB, itemB]) => {
    let segmentIndex = 1; // The first segment is always "", so we ignore it
    let joinedSegmentsOfItemA = '';
    let joinedSegmentsOfItemB = '';

    // Iterate over the path of the two items to compare as long as they have the same path
    do {
      // If either item no longer has a segment at this depth, it has to be the parent of the other item, as all previous segments are the same.
      if (itemA.segments[segmentIndex] === undefined) {
        return -1;
      } else if (itemB.segments[segmentIndex] === undefined) {
        return 1;
      }

      joinedSegmentsOfItemA += '/' + itemA.segments[segmentIndex];
      joinedSegmentsOfItemB += '/' + itemB.segments[segmentIndex];
      segmentIndex++;
    } while (joinedSegmentsOfItemA === joinedSegmentsOfItemB);

    // If the paths are no longer the same, the items are on the same level, so we can simply compare them by their position
    return (docsAsPathMap.get(joinedSegmentsOfItemA) as DocPageFetchReturn).position - (docsAsPathMap.get(joinedSegmentsOfItemB) as DocPageFetchReturn).position;
  });
};

/**
 * Load a single doc, based on path. Tries to fetch documents in falback locale if the localized document doesn't exist.
 * 
 * @param options Parameters containing the path and optionally locale, localeSeperator and fallbackLocale to overwrite defaults.
 * @returns The fetched page or undefined if not found.
 */
export const useDoc = (options: { path: string; locale?: string; localeSeparator?: string; fallbackLocale?: string }) => {
  const i18n = useI18n();
  const mergedOptions = computed(() => getOptions(options, i18n.locale.value));

  const doc = ref<ParsedContent | undefined>();

  const fetchDoc = async () => await queryContent({ deep: true })
    .where({
      $or: [
        { path: mergedOptions.value.path + mergedOptions.value.localeSeparator + mergedOptions.value.locale },
        { path: mergedOptions.value.path + mergedOptions.value.localeSeparator + mergedOptions.value.fallbackLocale },
        { path: mergedOptions.value.path + '/index' + mergedOptions.value.localeSeparator + mergedOptions.value.locale },
        { path: mergedOptions.value.path + '/index' + mergedOptions.value.localeSeparator + mergedOptions.value.fallbackLocale },
        { path: mergedOptions.value.path }
      ],
      extension: '.md'
    })
    .findOne();

  // Update doc as soon as content or the options change.
  watch(
    () => mergedOptions.value,
    async () => {
      doc.value = await fetchDoc();
    },
    { deep: true, immediate: true }
  );
  onContentUpdate(async () => {
    doc.value = await fetchDoc();
  });

  return doc;
};

/**
 * Fetches a document and all child documents. Returns them in an array, NOT a tree. To return them in a tree, use useDocTree
 * 
 * @param options Parameters to overwrite default behaviour, such as root directory, locale, localeSeparator, fallbackLocale and createDirs
 */
export const useDocs = (options: {
  root?: string;
  locale?: string;
  localeSeparator?: string;
  fallbackLocale?: string;
  createDirs?: boolean;
  buildItem?: (item: DocPageFetchReturn) => DocPageFetchReturn;
}) => {
  const {
    i18n: { locales }
  } = useNuxtApp();
  const i18n = useI18n();

  const mergedOptions = computed(() => getOptions(options, i18n.locale.value));
  const normalizePath = (path: string) => (path.split(mergedOptions.value.localeSeparator).shift() || path).replace(/\/index(?:\.\w+)?$/i, '') || '/';
  const buildItem = options.buildItem ?? ((v) => v);

  const docs = ref<DocPageFetchReturn[] | undefined>();

  const fetchDocs = async () => {
    // The nuxt content queries are using lokiJS, however they aren't properly implemented and most operators aren't working. To circumvent undefinedIn (checking for a key or its value), we use nin to only check for the value
    // In addition, lang: { $eq: undefined } or lang: undefined seems to unset the filter, so we have to take all possible other values expect the current language and undefined and check if the page does have one of those
    const fetchResult = await (options.root ? queryContent(options.root) : queryContent())
      .where({ lang: { $nin: (locales as LocaleObject[]).filter((_locale: any) => _locale.code !== mergedOptions.value.locale).map((_locale: any) => _locale.code) }, extension: '.md' })
      .sort({ path: 1 })
      .find();

    const docs = sortDocs(
      fetchResult.map((item) => {
        const path = normalizePath(item.path); // Remove language extension from path
        const segments = path.split('/');
        const dir = path === item.dir ? segments.slice(0, -1).join('/') || '/' : item.dir; // Correct dir
        return [path, buildItem({ ...item, path, dir, level: segments.length - 1, segments })] as const;
      })
    );

    // Filter duplicates by path
    const list = Array.from(new Map(docs).values());
    // Completing the list of files
    const fileMap: Record<string, ReturnType<typeof buildItem>> = {};
    const returnVal = options.createDirs
      ? list.flatMap((item) => {
        const path = item.path;
        fileMap[path] = item;
        const segments = path.split('/').slice(1);
        const items = [item];
        // Create parent directories (upwards the tree)
        for (let i = 1; i < segments.length; i++) {
          const pathSegments = segments.slice(0, -i);
          const path = '/' + pathSegments.join('/');
          if (fileMap[path]) break; // stop at first existing directory
          const dir = '/' + pathSegments.slice(0, -1).join('/');
          const newItem = (fileMap[path] = buildItem({ ...item, isDir: true, path, dir, segments, level: segments.length - i }));
          // Add created directories to the list of files
          items.unshift(newItem);
        }
        return items;
      })
      : list;
    return returnVal;
  };

  // Update docs as soon as content or the options change.
  onContentUpdate(async () => {
    docs.value = await fetchDocs();
  });
  watch(
    () => mergedOptions.value,
    async () => {
      docs.value = await fetchDocs();
    },
    { deep: true, immediate: true }
  );

  return docs;
};
export const useDocTree = async <T extends DocPageFetchReturn, ChildrenKey extends string = 'children'>(params: {
  root?: string;
  locale?: string;
  localeSeparator?: string;
  fallbackLocale?: string;
  childrenKey?: ChildrenKey;
  buildItem?: (item: DocPageFetchReturn) => T;
}) => {
  const childrenKey = params.childrenKey || 'children';
  const docs = await useDocs({ ...params, createDirs: true });

  return computed(() => {
    const files = (docs.value || []).map(
      (file) =>
        ({
          key: file.path,
          name: file.title,
          to: file.to,
          activePath: file.path,
          path: file.path,
          position: file.position,
          dir: file.dir
        } as any)
    );
    const tree = new Map(files.sort((itemA, itemB) => itemA.position - itemB.position).map((item) => [item.path, item]));

    tree.forEach((item) => {
      const parentPath = item.dir;
      const parent = tree.get(parentPath);
      if (parent && parent !== item) {
        const children = (parent[childrenKey] = parent[childrenKey] || ([] as T[]));
        children.push(item);
      }
    });

    // Return root of tree
    const firstNode = tree.values().next().value;
    return firstNode?.[childrenKey] || [];
  });
};
