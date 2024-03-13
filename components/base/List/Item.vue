<template>
  <v-col cols="12">
    <v-card :loading="false" data-veo-test="veo-card">
      <div data-veo-test="item-card-slot-prepend" class="veo-base-card__slot-prepend" style="padding: 0">
        <slot :item="item" name="prepend" />
      </div>

      <div class="veo-base-card__slot-center" data-veo-test="item-card-slot-center">
        <div>
          <NuxtLink :to="item.link" class="veo-base-card__slot-center__main" data-veo-test="item-card-slot-center-link">
            <v-card-title v-text="item.name"></v-card-title>
            <v-card-subtitle v-text="item.metaData ?? 'No meta data available'"></v-card-subtitle>
            <v-card-text
              data-veo-test="item-card-text"
              v-text="item.description ?? 'No description available.'"
            ></v-card-text>
          </NuxtLink>

          <div data-veo-test="item-card-slot-center-aside" class="veo-base-card__slot-center__aside">
            <slot :item="item" name="center-aside"></slot>
          </div>
        </div>

        <v-card-actions class="veo-card-actions">
          <div data-veo-test="item-card-slot-left" class="veo-card-actions__slot-left">
            <slot :item="item" name="bottom-left"></slot>
          </div>

          <div class="veo-base-card-actions__slot-append">
            <slot :item="item" name="bottom-right"></slot>
          </div>
        </v-card-actions>
      </div>
    </v-card>
  </v-col>
</template>
<script setup lang="ts">
interface Props {
  item: {
    name: string;
    link: string;
    description: string | undefined;
    metaData: string | undefined;
  };
}
const props = defineProps<Props>();
</script>
<style scoped lang="scss">
.v-card {
  display: flex;
}

.veo-base-card__slot-center {
  flex: 1;

  > div:first-child {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  /* reset padding */
  a > * {
    padding-left: 8px;
    white-space: break-spaces;
  }
  a:hover div:first-child {
    text-decoration: underline;
  }
}

.veo-base-card__slot-center__main {
  text-decoration: none;
  color: var(--veo-text, rgba(0, 0, 0, 0.87)) !important;
  display: flex;
  flex-direction: column;
}

.veo-base-card__slot-center__aside {
  flex-direction: column;
}

.veo-card-actions__slot-left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  > * {
    margin: 0 !important;
  }
}
.veo-base-card-actions__slot-append {
  margin-left: auto;
}

.v-theme--dark {
  /* Dark mode text color */
  --veo-text: white;
}
</style>
