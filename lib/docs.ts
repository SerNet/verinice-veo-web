import { FetchReturn } from '@nuxt/content/types/query-builder';

interface TreeItem<T extends FetchReturn> extends FetchReturn {
  url: string;
  breadcrumbs: string[];
  children: TreeItem<T>[];
}

export const listToTree = <T extends FetchReturn>(files: T[], emptyItem?: (item: T) => T): TreeItem<T>[] => {
  const sortItem = (a: TreeItem<T>, b: TreeItem<T>) => String(a.url).localeCompare(String(b.url));
  const normalizePath = (path: string) => path.replace(/\/index(?:\.\w+)?$/i, '') || '/';
  const createItem = (file: T): TreeItem<T> => {
    const url = normalizePath(file.path);
    return { ...file, children: [] as TreeItem<T>[], url, breadcrumbs: url.split('/') };
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
      parent.children.push(file);
    }
  });

  return list[0].children; // only top-level items */
};
