<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div>
    <div class="preview-controls justify-space-between pb-2">
      <v-btn
        variant="text"
        plain
        to="/docs"
      >
        {{ t('closePreview') }}
      </v-btn>
      <v-btn
        id="print-button"
        variant="text"
        color="primary"
      >
        {{ t('print') }}
      </v-btn>
    </div>
    <div class="coverpage document">
      <h1>verinice.veo</h1>
      <h3>{{ t('documentation') }}</h3>
      <img
        src="/images/documentation/coverpage-icongroup.svg"
        class="mt-12 mb-2"
      >
      <span>{{ t('lastModified') }} {{ new Date().toLocaleDateString() }}</span>
      <LayoutAppLogoDesktop style="position: absolute; bottom: 0;" />
    </div>
    <div class="document">
      <template v-if="documents">
        <TableOfContents
          class="page"
          :model-value="navigation"
        />
        <div
          v-for="document in documents"
          :id="document._path"
          :key="document._path"
          class="page"
        >
          <h2>{{ document.title }}</h2>
          <div>
            <ContentRendererMarkdown :value="document" />
          </div>
          <div class="veo-pdf-preview-chapter-context">
            {{ getTranslatedHierarchyAsString(document._path) }}
          </div>

          <div class="veo-pdf-preview-copyright">
            <p>&copy; {{ currentYear }}, SerNet GmbH</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDocs, useDocNavigationFlat } from '~/composables/docs';

definePageMeta({ layout: 'none' });

const route = useRoute();
const { locale, t } = useI18n();

// Redirect user if he enters this page without the print query parameter, as this page is only for generating the pdf file
if(!('print' in route.query)) {
  await navigateTo('/docs/index');
}

const currentYear = new Date().getFullYear();

const lang = route.query.lang?.toString() || undefined;
if (lang) {
  locale.value = lang;
}
// It is possible to a query parameter root to only print the contents of a folder/chapter
const root = [...(route.query.root || [])].join('') || undefined;
const documents = useDocs({ root });

// Table of contents
const navigation = useDocNavigationFlat({ root });

const getTranslatedHierarchyAsString = (path: string) => {
  const parts = path.split('/').filter((path) => path);

  const translatedParts = [];
  while(parts.length > 0) {
    parts.pop();
    translatedParts.push(navigation.value.find((item) => item._path === `/${parts.join('/')}`)?.title);
  }
  // Pop as the first page is always the welcome page (we don't want to show that)
  translatedParts.pop();
  return translatedParts.reverse()[0];
  // return translatedParts.reverse().join('/'); // Currently disabled, as only the highest chapter name should be shown
};

useHead(() => ({
  title: t('documentation'),
  script: [
    {
      // Do not execute PagedJS automatically
      innerHTML: 'window.PagedConfig = { auto: false };'
    },
    ...documents.value?.length && navigation.value?.length ? [
      {
        src: '/paged.polyfill.js',
        onload: () => {
          setTimeout(() => {
            const _window: any = window;
            const Paged = _window.Paged;
            class MyHandler extends Paged.Handler {
              afterRendered() {
                document.dispatchEvent(new Event('PAGEDJS_AFTER_RENDERED'));
                // We have to register the event handler here, as @click gets broken by paged.js
                document.querySelector('#print-button')?.addEventListener('click', () => {
                  window.print();
                });

              }
            }

            Paged.registerHandlers(MyHandler);
            _window.PagedPolyfill.preview();
          }, 1000);
        }
      }
    ] : []
  ]
}));
</script>

<i18n>
{
  "de": {
    "closePreview": "druckvorschau schließen",
    "documentation": "Dokumentation",
    "lastModified": "Stand",
    "print": "drucken"
  },
  "en": {
    "closePreview": "Close print preview",
    "documentation": "Documentation",
    "lastModified": "Last modified",
    "print": "print"
  }
}
</i18n>

<style lang="scss">
html {
  color: #878786;
  overflow: initial !important;
}

.coverpage {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 900px;
  justify-content: center;
}

.pagedjs_pagebox > .pagedjs_area {
    border: 1px solid $medium-grey;
    border-radius: 12px;
    padding: 0 12px;
}
</style>

<style lang="scss" scoped>
@import url('~/assets/styles/docs.scss');

.veo-pdf-preview-copyright {
  position: running(copyright);
}

.veo-pdf-preview-chapter-context {
  position: running(context);
}

@media screen {
  .preview-controls {
    border-bottom: 1px solid $medium-grey;
    display: flex !important;
  }
}

@media print {
  @page {
    size: A4;
    margin: 25mm 25mm 25mm 25mm;
    counter-increment: page;
  }

  @page {
    @bottom-right {
      content: counter(page) '/' counter(pages);
      font-family: Arial, Sans Serif;
    }

    @bottom-center {
      content: element(copyright);
    }

    @bottom-left {
      content: element(context);
    }
  }

  .preview-controls {
    display: none;
  }

  .page {
    page-break-after: always;
  }
}
</style>
