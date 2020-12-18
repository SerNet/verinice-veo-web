<template>
  <div class="wrapper">
    <v-row class="flex-column text-center">
      <v-col>
        <h1 class="text-uppercase mb-6">verinice-veo</h1>
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
        <v-btn
          depressed
          block
          color="primary"
          class="login-button"
          @click="$auth.login('/')"
        >
          {{ $t('page.login.button.login') }}
        </v-btn>
      </v-col>
      <v-col>
        <v-btn depressed block @click="$auth.register('/')">
          {{
            $t('page.login.button.register')
          }}
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
.wrapper {
  margin: 5% auto 0;
  max-width: 420px;
  width: 90%;

  h1 {
    color: rgb(237, 237, 237);
    font-weight: 300;
  }
}

.v-btn.login-button {
  border: 1px solid rgb(155, 0, 0) !important;
}

.v-btn {
  border-radius: 0px;
}

.language-btn {
  max-width: 120px;
}
</style>
