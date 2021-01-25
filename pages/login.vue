<template>
  <div class="wrapper">
    <v-row class="flex-column text-center">
      <v-col>
        <h1 class="mb-6 primary--text">verinice.veo</h1>
      </v-col>
      <v-col class="d-flex justify-end mb-6">
        <v-select
          :value="$i18n.locale"
          :items="langs"
          class="language-btn"
          label="Languages"
          flat
          dense
          solo
          hide-details
          @input="$i18n.setLocale($event)"
        />
      </v-col>
      <v-col>
        <v-btn depressed block color="primary" class="login-button" @click="$user.auth.login('/')">
          {{ $t('page.login.button.login') }}
        </v-btn>
      </v-col>
      <v-col>
        <v-btn depressed block @click="$user.auth.register('/')">
          {{ $t('page.login.button.register') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  layout: 'plain',
  data() {
    return {
      langs: [
        { value: 'en', text: 'English' },
        { value: 'de', text: 'Deutsch' }
      ]
    }
  },
  head(): any {
    return {
      title: 'verinice.veo'
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.wrapper {
  margin: 5% auto 0;
  max-width: 420px;
  width: 90%;

  h1 {
    color: rgb(237, 237, 237);
    font-family: 'Trebuchet MS', Helvetica, Arial, sans-serif;
    font-size: 52px;
    font-weight: 400;
  }
}

.v-btn {
  border-radius: 0px;
}

.language-btn {
  max-width: 120px;
}
</style>
