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
        text
        plain
        to="/docs"
      >
        {{ t('closePreview') }}
      </v-btn>
      <v-btn
        id="print-button"
        text
        color="primary"
      >
        {{ t('print') }}
      </v-btn>
    </div>
    <div class="document">
      <template v-if="documents">
        <TableOfContents
          class="page"
          children-property="childItems"
          :value="files"
        />
        <div
          v-for="document in documents"
          :id="document.path"
          :key="document.path"
          class="page"
        >
          <NuxtContent :document="document" />
          <div class="veo-pdf-preview-chapter-context">
            {{ getTranslatedHierarchyAsString(document) }}
          </div>
          <div class="veo-pdf-preview-copyright">
            <p>verinice.veo {{ t('documentation') }}<br>&copy; 2022, SerNet GmbH</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, useRoute } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { DocPageFetchReturn, useDocs } from '~/composables/docs';
export default defineComponent({
  layout: 'print',
  validate({ route, redirect }) {
    if ('print' in route.query) {
      return true;
    } else {
      redirect('/docs/index');
      return false;
    }
  },
  setup() {
    const route = useRoute();
    const { locale, t } = useI18n();
    const lang = route.value.query.lang?.toString() || undefined;
    if (lang) {
      locale.value = lang;
    }
    // It is possible to a query parameter root to only print the contents of a folder/chapter
    const root = [...(route.value.query.root || [])].join('') || undefined;
    const files = useDocs({
      root,
      createDirs: true,
      buildItem(item) {
        return {
          ...item,
          name: item.isDir ? `${upperFirst(item.slug)} (${item.path})` : `${item.title || item.slug} (${item.path})`,
          to: item.path
        };
      }
    });

    const documents = computed(() => files.value || []);
    const title = computed(() => t('documentation'));

    const documentsAsMap = computed(() => new Map(documents.value.map((document) => [document.path, document])));

    const getTranslatedHierarchyAsString = (document: DocPageFetchReturn) => {
      const segments = [...document.segments];

      let translatedSegments = [];

      while (segments.length > 0) {
        segments.pop();
        translatedSegments.push(documentsAsMap.value.get(segments.join('/'))?.title);
      }
      translatedSegments = translatedSegments.reverse().filter((segment) => segment);
      return translatedSegments.join(' / ');
    };

    return {
      documents,
      files,
      getTranslatedHierarchyAsString,
      t,
      title
    };
  },
  head(): any {
    return {
      title: this.title,
      // ensure pagedjs is not embedded until documents have been rendered
      script: this.documents.length
        ? [
            {
              // Do not execute PagedJS automatically
              innerHTML: 'window.PagedConfig = { auto: false };'
            },
            {
              src: '/paged.polyfill.js',
              callback: () => {
                const win = window as any;
                const Paged = win.Paged;
                class MyHandler extends Paged.Handler {
                  afterRendered() {
                    document.dispatchEvent(new Event('PAGEDJS_AFTER_RENDERED'));
                    document.querySelector('#print-button')?.addEventListener('click', () => {
                      window.print();
                    });
                  }
                }
                Paged.registerHandlers(MyHandler);
                win.PagedPolyfill.preview();
              }
            }
          ]
        : []
    };
  }
});
</script>

<i18n>
{
  "de": {
    "closePreview": "druckvorschau schließen",
    "documentation": "Dokumentation",
    "print": "drucken"
  },
  "en": {
    "closePreview": "Close print preview",
    "documentation": "Documentation",
    "print": "print"
  }
}
</i18n>

<style lang="scss">
html {
  overflow: initial !important;
}
</style>
<style lang="scss" scoped>
.veo-pdf-preview-copyright {
  position: running(copyright);
}

.veo-pdf-preview-chapter-context {
  position: running(context);
}

@media screen {
  .page {
    margin-bottom: 4em;
  }
  .document {
    width: 100%;
    max-width: 900px;
    margin: 1em;
  }
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