import { FetchReturn } from '@nuxt/content/types/query-builder';

interface TreeItem<T extends FetchReturn> extends FetchReturn {
  url: string;
  breadcrumbs: string[];
  childItems?: TreeItem<T>[];
}

export const treeToStr = <K extends Record<string, any>>(items: K[], nameField: keyof K, childrenField: keyof K) => {
  const seen = new WeakSet();
  const _treeToStr = (items: any[], level = 0, originName?: string): string => {
    if (!items) return '';
    const ind = '  '.repeat(level);
    if (seen.has(items)) return ind + `- RECURSION via ${originName}\n`;
    seen.add(items);
    return items?.map((item) => ind + '- ' + [item[nameField] || '???', _treeToStr(item[childrenField], level + 1, item[nameField])].join('\n')).join('');
  };
  return _treeToStr(items);
};

export const listToTree = <T extends FetchReturn>(files: T[], emptyItem?: (item: T) => T): TreeItem<T>[] => {
  console.log('IN', JSON.parse(JSON.stringify(files)));
  const sortItem = (a: TreeItem<T>, b: TreeItem<T>) => String(a.url).localeCompare(String(b.url));
  const normalizePath = (path: string) => path.replace(/\/index(?:\.\w+)?$/i, '') || '/';
  const createItem = (file: T): TreeItem<T> => {
    const url = normalizePath(file.path);
    return { ...file, childItems: undefined as TreeItem<T>[] | undefined, url, breadcrumbs: url.split('/') };
  };

  // Create a map of all paths to files
  const fileMap = new Map(
    files.map((file) => {
      const item = createItem(file);
      return [item.url, item];
    })
  );

  // Create missing folders
  fileMap.forEach((file) => {
    const parentUrl = file.breadcrumbs.slice(0, -1).join('/') || '/';
    let parent = fileMap.get(parentUrl);
    if (!parent) {
      console.log(`Creating parent for ${parentUrl}`);
      const newItem: T = emptyItem ? emptyItem(file as any) : (file as any);
      parent = createItem({ ...newItem, path: parentUrl });
      fileMap.set(parentUrl, parent);
    }
  });

  const list = Array.from(fileMap.values()).sort(sortItem);

  // Assign files to folders
  list.forEach((file) => {
    const parentUrl = file.breadcrumbs.slice(0, -1).join('/') || '/';
    const parent = fileMap.get(parentUrl);
    if (parent) {
      const childItems = (parent.childItems = parent.childItems || []);
      if (parent === file) {
        // if item is a child of itself, just append the file to omit recursions
        childItems.push({ ...file, childItems: undefined });
      } else {
        childItems.push(file);
      }
    }
  });

  console.log('OUT', list);
  return list[0].childItems || []; // only top-level items */
};
