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
import { FetchReturn } from '@nuxt/content/types/query-builder';
import { useAsync, useContext, computed } from '@nuxtjs/composition-api';
import { cloneDeep } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { onContentUpdate } from './utils';

export interface DocPage {
  title: string;
  position: number;
  lang: string;
  isDir?: boolean;
}

export type DocPageFetchReturn = FetchReturn & DocPage;

type ContentOptions = { path?: string; locale?: string; localeSeparator?: string; fallbackLocale?: string; where?: object };
const getOptions = (params: ContentOptions) => {
  const fallbackLocale = params.fallbackLocale ?? 'de';
  const localeSeparator = params.localeSeparator ?? '.';
  const locale = params.locale ?? useI18n().locale.value;
  return { ...params, fallbackLocale, localeSeparator, locale };
};

const ensureArray = <T>(result: T[] | T): T[] => {
  return result && Array.isArray(result) ? result : [result];
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

export const useDoc = (params: { path: string; locale?: string; localeSeparator?: string; fallbackLocale?: string }) => {
  const { localeSeparator, path, fallbackLocale, locale } = getOptions(params);
  const { $content } = useContext();

  const fetchDoc = async () => {
    const fetchResult = await $content({ deep: true })
      .where({
        $or: [
          { path: path + localeSeparator + locale },
          { path: path + localeSeparator + fallbackLocale },
          { path: path + '/index' + localeSeparator + locale },
          { path: path + '/index' + localeSeparator + fallbackLocale },
          { path }
        ],
        extension: '.md'
      })
      .limit(1)
      .fetch<DocPage>();

    return ensureArray(fetchResult).shift();
  };

  const doc = useAsync(fetchDoc, path);

  onContentUpdate(async () => {
    doc.value = await fetchDoc();
  });

  return doc;
};

export const useDocs = <T extends DocPageFetchReturn>(params: {
  root?: string;
  locale?: string;
  localeSeparator?: string;
  fallbackLocale?: string;
  createDirs?: boolean;
  buildItem?: (item: DocPageFetchReturn) => T;
}) => {
  const { localeSeparator, locale } = getOptions(params);
  const normalizePath = (path: string) => (path.split(localeSeparator).shift() || path).replace(/\/index(?:\.\w+)?$/i, '') || '/';
  const { $content } = useContext();
  const buildItem = params.buildItem ?? ((v) => v);
  const fetchDocs = async () => {
    const fetchResult = await (params.root ? $content(params.root, { deep: true }) : $content({ deep: true }))
      .where({ lang: { $in: [locale, undefined] }, extension: '.md' })
      .sortBy('path', 'asc')
      .fetch<DocPage>();

    const docs = sortDocs(
      ensureArray(fetchResult).map((item) => {
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
    const returnVal = params.createDirs
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

  const docs = useAsync(fetchDocs);

  onContentUpdate(async () => {
    docs.value = await fetchDocs();
  });

  return docs;
};
export const useDocTree = <T extends DocPageFetchReturn, ChildrenKey extends string = 'children'>(params: {
  root?: string;
  locale?: string;
  localeSeparator?: string;
  fallbackLocale?: string;
  childrenKey?: ChildrenKey;
  buildItem?: (item: DocPageFetchReturn) => T;
}) => {
  const childrenKey = params.childrenKey || 'children';
  const docs = useDocs({ ...params, createDirs: true });

  return computed(() => {
    const files = docs.value || [];
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
