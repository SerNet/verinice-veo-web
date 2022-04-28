<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann, Samuel Vitzthum
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
  <v-breadcrumbs
    :items="breadcrumbItems"
    class="px-0"
    data-component-name="breadcrumbs"
  >
    <template #item="{ item }">
      <v-menu
        v-if="item.menuItems"
        offset-y
      >
        <template #activator="{ on, attrs }">
          <v-btn
            color="primary"
            x-small
            text
            v-bind="attrs"
            v-on="on"
          >
            {{ item.text }}
          </v-btn>
        </template>
        <v-list
          dense
          class="py-0"
        >
          <v-list-item
            v-for="(menuItem, index) in item.menuItems"
            :key="index"
            :to="menuItem.to"
            :exact="menuItem.exact"
          >
            <v-list-item-title
              v-if="menuItem.text"
              class="primary--text font-weight-regular"
            >
              {{
                menuItem.text
              }}
            </v-list-item-title>
            <v-icon
              v-else-if="menuItem.icon"
              small
              class="primary--text"
            >
              {{ menuItem.icon }}
            </v-icon>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-breadcrumbs-item
        v-if="!item.menuItems"
        :to="item.to"
        :disabled="item.disabled"
        :exact="item.exact"
      >
        <template v-if="item.text">
          {{ item.text }}
        </template>
        <v-icon
          v-else-if="item.icon"
          style="color: inherit;"
        >
          {{ item.icon }}
        </v-icon>
      </v-breadcrumbs-item>
    </template>
    <template #divider>
      <v-icon
        color="black"
        small
      >
        {{ mdiChevronRight }}
      </v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { ref, defineComponent, watch, Ref, PropOptions, useRoute, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { capitalize, last, intersection } from 'lodash';
import { mdiChevronRight, mdiHomeOutline } from '@mdi/js';
import { separateUUIDParam } from '~/lib/utils';

interface IBaseStringObject {
  [key: string]: string;
}

interface IBaseBreadcrumbEntry {
  text: string;
  to: string;
  icon?: string;
}

interface IBreadcrumbEntry extends IBaseBreadcrumbEntry {
  disabled: boolean;
  exact: boolean;
}

// TODO: check if :group should be added here, after groups are implemented
type ParamsWithUUID = ':form' | ':entity' | ':id' | ':domain' | ':catalog';

interface ICustomBreadcrumbEntry {
  [key: string]: IBaseBreadcrumbEntry[];
}

interface ICollapsedBreadcrumbEntry {
  text: string;
  menuItems: IBreadcrumbEntry[];
}

interface ICustomBreadcrumbTextEntry {
  [key: string]: { text: string; icon?: string };
}

export default defineComponent({
  props: {
    customBreadcrumbs: {
      type: Object,
      default: undefined
    } as PropOptions<ICustomBreadcrumbEntry>
  },
  setup(props) {
    const { t, te } = useI18n();
    const { app, $api } = useContext();
    const route = useRoute();

    /**
     * Definitions of custom values
     */

    // Notice: to define custom translations for parameters from route path (objectschema, formschema, help, ...)
    // Define values in de.ts and en.ts with this pattern breadcrumbs.PARAMETER (e.g. breadcrumbs.objectschema)

    // Define which keys from path should be replaces with custom Text
    let breadcrumbsReplacement: ICustomBreadcrumbTextEntry = {
      ':unit': { text: '', icon: mdiHomeOutline },
      forms: { text: t('breadcrumbs.forms').toString() },
      objects: { text: t('breadcrumbs.objects').toString() },
      domains: { text: t('breadcrumbs.domain').toString() }
    };

    // TODO: check if :group should be added here, after groups are implemented
    // Definition of route fragments in path, which is represented with UUID in standard path
    const paramsWithUUID: ParamsWithUUID[] = [':form', ':entity', ':id', ':domain', ':catalog'];

    // This array contains route parts that should not be part of the breadcrumbs
    const hiddenRouteParts = ['domains'];

    // KeyMap for definition of object properties which represent displayName
    const displayNameKeyMap = {
      ':form': 'name',
      ':entity': 'displayName',
      ':id': 'displayName',
      ':domain': 'name',
      ':catalog': 'name'
    };

    // KeyMap for definition of KEY in $api.KEY.fetch()
    const apiKeyMap = {
      ':form': 'form',
      ':entity': 'entity',
      ':id': 'entity',
      ':domain': 'domain',
      ':catalog': 'catalog'
    };

    // Default properties for Breadcrumb listItem
    const defaultListItem = { exact: true, disabled: false };

    // Definition of collapse threshold for breadrumb listItems
    const collapseThreshold = 6;

    /**
     * Definitions of variables
     */

    const breadcrumbItems: Ref<(IBreadcrumbEntry | ICollapsedBreadcrumbEntry)[]> = ref([]);

    /**
     * Definitions of functions
     */

    // Get the title of a dynamic parameter
    function getCachedTitle(type: ParamsWithUUID, key: string) {
      if (type === ':form') {
        return { [type]: { text: JSON.parse(sessionStorage.getItem(key) as string)[app.i18n.locale] || 'Missing translation' } };
      } else {
        return { [type]: { text: sessionStorage.getItem(key) as string } };
      }
    }

    // Receive a titel of a dynamic parameter value (type-UUID) from server and cache it
    async function getUUIDParamTitel(type: ParamsWithUUID, param: string) {
      // "param" has always pattern: type-UUID, where type can be form, process, control, asset, ...
      const paramSeparated = separateUUIDParam(param);

      if (paramSeparated.id === '-') {
        return { [type]: { text: t('breadcrumbs.all') as string } };
      }

      // If a parameter title is already cached, return its value
      if (sessionStorage.getItem(paramSeparated.id)) {
        return getCachedTitle(type, paramSeparated.id);
      }

      // Otherwise, If a parameter title is not cached, send request to server and cache it in Session Storage
      const apiKey = apiKeyMap[type];
      const displayNameKey = displayNameKeyMap[type];

      let text: string;
      // @ts-ignore
      const api = $api[apiKey];
      try {
        if (type === ':entity') {
          text = (await api.fetch(paramSeparated.type, paramSeparated.id))[displayNameKey];
        } else if (type === ':form') {
          text = JSON.stringify((await api.fetch(paramSeparated.id))[displayNameKey]);
        } else {
          text = (await api.fetch(paramSeparated.id))[displayNameKey];
        }
      } catch (ignore) {
        text = '404';
      }
      sessionStorage.setItem(paramSeparated.id, text);

      return new Promise<ICustomBreadcrumbTextEntry>((resolve) => {
        resolve(getCachedTitle(type, paramSeparated.id));
      });
    }

    // Get text for listItem: it can be custom text, translation or just parameters from route path (forms, :unit, ...)
    function getText(params: IBaseStringObject, param: string) {
      const text: string = params[param] || (te('breadcrumbs.' + param) && (t('breadcrumbs.' + param) as string)) || param;
      return capitalize(text);
    }

    // Generate route paths for each listItem of standard breadcrumbs
    function generatItemRoute(routes: string[], params: IBaseStringObject, index: number): string {
      return `/${routes
        .slice(0, index + 1)
        .map((route) => params[route] || route)
        .join('/')}/`;
    }

    // Generate custom breadcrumbs if a user externally defined component props "customBreadcrumbs"
    function generateCustomBreadcrumb(pathTemplate: string, params: IBaseStringObject) {
      return (props.customBreadcrumbs?.[pathTemplate] || []).map((item) => {
        return {
          ...defaultListItem,
          ...item,
          to: item.to.replace(/:\w+/g, (paramKey) => params[paramKey])
        };
      });
    }

    // Generate standard (dynamic) breadcrumbs with translations, dynamic titels for UUID parameters and custom text
    async function generateStandardBreadcrumb(pathTemplate: string, params: IBaseStringObject): Promise<IBreadcrumbEntry[]> {
      // Keys from path in general form Dynamic (e.g. - :unit, :object), Static (e.g. - forms, objects)
      const routes: string[] = pathTemplate.split('/').filter((el: string) => el !== '');

      // Parameters from with UUID which currently exist in route path
      const usedParamsWithUUID = intersection(paramsWithUUID, routes) as ParamsWithUUID[];

      // Load titels for UUID parameters dynamically
      const dynamicUUIDTitels = await Promise.all(
        usedParamsWithUUID.map((param: ParamsWithUUID) => {
          return getUUIDParamTitel(param, params[param]);
        })
      );
      // Add these titels with their parameter names to breadcrumsReplacement object to replace default values with dynamic ones in the loop
      dynamicUUIDTitels.forEach((titelObject: ICustomBreadcrumbTextEntry) => {
        breadcrumbsReplacement = { ...breadcrumbsReplacement, ...titelObject };
      });

      // Generate for each route parameter dynamic breadcrumbs listItem
      return routes
        .map((param: string, i: number) => {
          const item = breadcrumbsReplacement[param] ? { ...breadcrumbsReplacement[param] } : { text: getText(params, param) };
          return {
            ...defaultListItem,
            ...item,
            to: generatItemRoute(routes, params, i),
            param
          };
        })
        .filter((route) => !hiddenRouteParts.includes(route.param)); // We filter afterwards to not impact route generation that uses the index of the route parameter
    }

    // Collapse breadcrumbs listItems, if number of them is higher than the custom threshold, else return original listItems
    function collapseBreadcrumb(listItems: IBreadcrumbEntry[]): (ICollapsedBreadcrumbEntry | IBreadcrumbEntry)[] {
      const numberOfNotCollapsedListItems = collapseThreshold - 2;
      const sliceEndIndexForCollapsedListItems = listItems.length - numberOfNotCollapsedListItems;
      // If list items are longer than required, listItems should be collapsed
      return listItems.length >= collapseThreshold
        ? [{ text: '•••', menuItems: listItems.slice(0, sliceEndIndexForCollapsedListItems) }, ...listItems.slice(sliceEndIndexForCollapsedListItems)]
        : listItems;
    }

    async function createBreadcrumbs() {
      // Parameters map from route path
      const params: IBaseStringObject = {};
      Object.entries(route.value.params).forEach(([key, value]) => {
        params[`:${key}`] = value;
      });

      // Pathtemplate is general definition of current path without real values (e.g. /:unit/domains/:domain/forms/:form)
      const pathTemplate = last(route.value.matched)?.path;
      if (pathTemplate) {
        const listItems: IBreadcrumbEntry[] = props.customBreadcrumbs?.[pathTemplate]
          ? generateCustomBreadcrumb(pathTemplate, params)
          : await generateStandardBreadcrumb(pathTemplate, params);

        breadcrumbItems.value = collapseBreadcrumb(listItems);
      } else {
        // console.warn('Pathtemplate is undefined in Breadcrumbs');
        breadcrumbItems.value = [];
      }
    }

    /**
     * Definition of watchers for route changes
     */

    watch(
      () => route.value.fullPath,
      async () => {
        await createBreadcrumbs();
      },
      { immediate: true }
    );

    watch(
      () => app.i18n.locale,
      () => {
        createBreadcrumbs();
      }
    );

    /**
     * Definition of returned values to templace
     */

    return { breadcrumbItems, mdiChevronRight };
  }
});
</script>
