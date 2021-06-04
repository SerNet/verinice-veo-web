<template>
  <v-card flat>
    <v-card-title>{{ $props.title }}</v-card-title>
    <v-card-text>
      <slot />
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

interface IProps {
  title: String;
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String,
      required: true
    }
  }
});
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.v-card {
  border: 1px solid $grey;
}
</style>
