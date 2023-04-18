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
import { NavItem, ParsedContent } from '@nuxt/content/dist/runtime/types';
import { cloneDeep, last } from 'lodash';

type ContentOptions = { path?: string; locale?: string; localeSeparator?: string; fallbackLocale?: string; where?: object };
const getOptions = (params: ContentOptions, _locale: string) => {
  const fallbackLocale = params.fallbackLocale ?? 'de';
  const localeSeparator = params.localeSeparator ?? '.';
  const locale = params.locale ?? _locale;
  return { ...params, fallbackLocale, localeSeparator, locale };
};

export const normalizePath = (path: string, localeSeparator = '.') => {
  const parts = path.split(localeSeparator);

  // Pop language extension. If there is no dot present in the path, the file hasn't been localized and there is nothing to pop
  if(parts.length > 1) {
    parts.pop();
  }

  // Remove /index from path
  return parts.join(localeSeparator).replace(/\/index$/i, '') || '/';
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

  const fetchDoc = async () => {
    const eligiblePages = await queryContent().where({ $or: [
      { _path: mergedOptions.value.path + mergedOptions.value.localeSeparator + mergedOptions.value.locale },
      { _path: mergedOptions.value.path + '/index' + mergedOptions.value.localeSeparator + mergedOptions.value.locale },
      { _path: mergedOptions.value.path + mergedOptions.value.localeSeparator + mergedOptions.value.fallbackLocale },
      { _path: mergedOptions.value.path + '/index' + mergedOptions.value.localeSeparator + mergedOptions.value.fallbackLocale },
      { _path: mergedOptions.value.path }
    ],
    _extension: 'md' }).find();
    return eligiblePages.find((page) => page.language === mergedOptions.value?.locale) || eligiblePages[0];
  };

  // Update doc as soon as content or the options change.
  watch(
    () => mergedOptions.value,
    async () => {
      doc.value = await fetchDoc();
    },
    { deep: true, immediate: true }
  );

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
}) => {
  const { locale } = useI18n();

  const mergedOptions = computed(() => getOptions(options, locale.value));
  
  const docs = ref<ParsedContent[] | undefined>();

  const fetchDocs = async () => {
    // Language has to be either the current locale or not set, as we only want the docs to contain non-i18n pages and i18n pages in the current languages.
    return await queryContent(options.root).where({ _extension: 'md', language: { $in: [mergedOptions.value.locale, undefined] }}).find();
  };

  const normalizedDocs = computed(() => (docs.value || []).map((doc) => ({ ...doc, _path: normalizePath(doc._path) })));

  // Update docs as soon as content or the options change.
  watch(
    () => mergedOptions.value,
    async () => {
      docs.value = await fetchDocs();
    },
    { deep: true, immediate: true }
  );

  return normalizedDocs;
};

export const useDocNavigation = (options: {
  root?: string;
  locale?: string;
}) => {
  const { locale } = useI18n();

  const mergedOptions = computed(() => getOptions(options, locale.value));
  const navigation = ref<NavItem[] | undefined>();

  const normalizedDocs = computed(() => {
    const removeIndexPages = (item: NavItem) => {
      if(!item.children || !item.children.length) {
        return item;
      }
      const children = cloneDeep(item.children);
      const searchCondition = (item: NavItem) => last(item._path.split('/')).startsWith('index');
      const indexChild = item.children.findIndex((child) => searchCondition(child));
      const newIndexPage = children.splice(indexChild, 1);
     
      item.title = newIndexPage[0].title;
      item.children = children;

      for(const child in item.children) {
        item.children[child] = removeIndexPages(item.children[child]);
      }

      return item;
    };
    return ((navigation.value || []).map((item) => removeIndexPages(item))).splice(1);
  });

  const fetch = async () => {
    navigation.value = await fetchContentNavigation({
      where: [
        { _extension: 'md' },
        { language: { $in: [mergedOptions.value.locale, undefined] } },
        ...options.root ? [{ _path: new RegExp(`/^/${options.root}/`) }] : []
      ]
    });
  };

  // Update docs as soon as content or the options change.
  watch(
    () => mergedOptions.value,
    async () => {
      fetch();
    },
    { deep: true, immediate: true }
  );

  return normalizedDocs;
};

export const useDocNavigationFlat = (options: {
  root?: string;
  locale?: string;
}) => {
  const docEntries = useDocNavigation(options);

  const navigation = computed<NavItem[]>(() => {
    const reduceItems = (items: NavItem[]): any[] => 
      items.reduce((previous, current) => {
        let item = {
          title: current.title,
          _path: normalizePath(current._path)
        };
  
        if(current.children) {
          const searchCondition = (item: NavItem) => last(item._path.split('/')).startsWith('index');
          const indexChild = current.children.findIndex((child) => searchCondition(child));
  
          const children = cloneDeep(current.children);
          if(indexChild >= 0) {
            const newIndexPage = children.splice(indexChild, 1);
            item = {
              title: newIndexPage[0].title,
              _path: normalizePath(newIndexPage[0]._path)
            };
          }
          return previous.concat(item, reduceItems(children));
        }
  
        return previous.concat(item);
      }, []);
    return reduceItems(docEntries.value || []);
  });
  return navigation;
};
