import { FetchReturn } from '@nuxt/content/types/query-builder';
import { useAsync, useContext, computed } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export interface DocPage {
  title: string;
  position: number;
  lang: string;
  isDir?: boolean;
}

type DocPageFetchReturn = FetchReturn & DocPage;

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

export const useDoc = (params: { path: string; locale?: string; localeSeparator?: string; fallbackLocale?: string }) => {
  const { localeSeparator, path, fallbackLocale, locale } = getOptions(params);
  const { $content } = useContext();

  return useAsync(async () => {
    const fetchResult = await $content({ deep: true })
      .where({
        $or: [{ path: path + localeSeparator + locale }, { path: path + fallbackLocale }, { path }]
      })
      .limit(1)
      .fetch<DocPage>();

    return ensureArray(fetchResult).shift();
  }, path);
};

export const useDocs = <T extends DocPageFetchReturn>(params: {
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
  return useAsync(async () => {
    const fetchResult = await $content({ deep: true })
      .where({ lang: { $undefinedin: [locale, undefined] } })
      .sortBy('path', 'asc')
      .fetch<DocPage>();

    const docs = ensureArray(fetchResult)
      .map((item) => {
        const path = normalizePath(item.path); // Remove language extension from path
        const segments = path.split('/');
        const dir = path === item.dir ? segments.slice(0, -1).join('/') || '/' : item.dir; // Correct dir
        return [path, buildItem({ ...item, path, dir, level: segments.length - 1, segments })] as const;
      })
      // Sort by normalized path and move documents with matching locale to the end
      .sort(([pathA, a], [pathB, b]) => pathA.localeCompare(pathB) || ((a.lang || b.lang || locale) === locale ? 0 : -1));

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
  });
};
export const useDocTree = <T extends DocPageFetchReturn, ChildrenKey extends string = 'children'>(params: {
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
    const tree = new Map(files.map((item) => [item.path, item]));
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
