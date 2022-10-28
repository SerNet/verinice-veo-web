<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <v-list-item
    v-if="!children || !children.length"
    :to="to"
    active-class="veo-docs-navigation-item--active"
    dense
  >
    <v-list-item-title>{{ name }}</v-list-item-title>
  </v-list-item>
  <v-list-group
    v-else-if="children && level <= 2"
    :sub-group="level > 1"
    no-action
    class="veo-docs-navigation-group"
    :class="{
      'veo-docs-navigation-group--active': itemIsActive
    }"
    active-class="black--text"
    @input="groupToggled"
  >
    <template #activator>
      <!-- The list item is not required by the markup and shouldn't be used, but we can't color the activator if the user is on the page of the activator any other way -->
      <v-list-item
        v-if="itemIsActive"
        class="veo-docs-navigation__mock-group-activator--active"
        dense
      />
      <v-list-item-title :class="{ 'primary--text': itemIsActive }">
        {{ name }}
      </v-list-item-title>
    </template>
    <v-list-item
      v-if="!children.length"
      dense
    >
      {{ t('noEntries') }}
    </v-list-item>
    <VeoDocsNavigationItem
      v-for="child of children"
      :key="child.to"
      v-bind="child"
    />
  </v-list-group>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useRoute, useRouter } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export interface IVeoDocsNavigationItem {
  level: number;
  to: string;
  children: IVeoDocsNavigationItem[];
  name: string;
}

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    children: {
      type: Array as PropType<IVeoDocsNavigationItem[]>,
      default: () => []
    }
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    const groupToggled = (isExpanded: boolean) => {
      if (isExpanded) {
        router.push(props.to);
      }
    };

    const itemIsActive = computed(() => route.value.path === props.to);

    return {
      groupToggled,
      itemIsActive,

      t
    };
  }
});
</script>

<style lang="scss" scoped>
.veo-docs-navigation__mock-group-activator--active {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  &:before {
    background: $primary;
    bottom: 0;
    content: '';
    left: 0;
    opacity: 0.12 !important;
    position: absolute;
    right: 0;
    top: 0;
  }
}

.veo-docs-navigation-item--active > .v-list-item__title,
.veo-docs-navigation-group > ::v-deep.v-list-group__header.v-list-item--active > .v-list-item__title {
  font-weight: 700 !important;
}

/* Disable before on hover if group is active */
.veo-docs-navigation-group--active > ::v-deep.v-list-group__header:before {
  opacity: 0;
}
</style>

<i18n>
{
  "en": {
    "noEntries": "No entries"
  },
  "de": {
    "noEntries": "Keine Einträge"
  }
}
</i18n>