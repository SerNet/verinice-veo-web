<template>
  <div
    style="flex-basis: 0;"
    class="mr-0 text-right flex-grow-1"
  >
    <v-menu
      v-model="value"
      :close-on-content-click="false"
      max-width="350px"
      nudge-bottom="5"
      offset-y
      origin="top right"
    >
      <template #activator="{ on }">
        <v-btn
          icon
          dark
          v-on="on"
        >
          <v-avatar
            size="48"
            color="secondary"
          >
            <span class="white--text headline">{{ initials }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar color="secondary">
              <v-icon class="white--text headline">
                {{ initials }}
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <span>
                {{ prename }}
                {{ lastname }}
              </span>
              <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <VeoUnitSelection :units="units" />
          <VeoDomainSelection :domains="currentUnitDomains" />
        </v-list>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="$emit('logout')"
          >
            {{ $t('logout') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { separateUUIDParam } from '~/lib/utils';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoDomain, IVeoUnit } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    prename: { type: String, default: '' },
    lastname: { type: String, default: '' },
    username: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  data() {
    return {
      value: false,
      units: [] as IVeoUnit[]
    };
  },
  async fetch() {
    this.units = await this.$api.unit.fetchAll();
  },
  computed: {
    currentUnitDomains(): IVeoDomain[] {
      return this.units.find((unit: IVeoUnit) => unit.id === (this.$route.params.unit && separateUUIDParam(this.$route.params.unit).id))?.domains || [];
    },
    initials(): string {
      return this.prename.substring(0, 1) + this.lastname.substring(0, 1);
    }
  },
  mounted() {
    this.$root.$on(VeoEvents.UNIT_CHANGED, () => {
      this.$nextTick(() => {
        this.$fetch();
      });
    });
  }
});
</script>

<i18n>
{
  "en": {
    "logout": "Logout"
  },
  "de": {
    "logout": "Abmelden"
  }
}
</i18n>
