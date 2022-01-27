<!--
   - verinice.veo web
   - Copyright (C) 2022  Markus Werner
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
  <VeoPage fullsize>
    <v-container fluid>
      <h4>Demo page for hints and tutorials</h4>
      <v-select
        label="Available tutorials"
        :items="tutorials"
        item-text="title"
        item-value="path"
        :value="options.route"
        @change="openTutorial"
      >
        <template #item="{item, on}">
          <v-list-item
            :disabled="item.disabled"
            v-on="on"
          >
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
              <v-list-item-subtitle v-text="item.subtitle" />
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>
      <v-btn
        :disabled="!hasHints"
        data-hint="showHintBtn"
        color="primary"
        elevation="0"
        :ripple="false"
        @click="hintsVisible = !hintsVisible"
        v-text="hintsVisible?'Hide hints':'Show hints'"
      />
      <v-btn
        :disabled="!hasSteps"
        color="primary"
        data-hint="showTutorialBtn"
        elevation="0"
        :ripple="false"
        @click="stepsVisible = !stepsVisible"
        v-text="stepsVisible?'Hide steps':'Show steps'"
      />
    </v-container>
    
    <v-container
      class="px-0"
      fluid
    >
      <v-row no-gutters>
        <v-col v-if="hasSteps">
          <v-subheader>Steps</v-subheader>
          <v-stepper
            vertical
            elevation="0"
            :value="step+1"
          >
            <v-stepper-step
              v-for="(s, index) in steps"
              :key="index"
              :step="index+1"
              @click="setStep(index)"
            >
              {{ s.title }}
              <small>{{ s.intro }}</small>
            </v-stepper-step>
          </v-stepper>
        </v-col>
        <v-col v-if="hasHints">
          <v-subheader>Hints</v-subheader>
          <v-stepper
            vertical
            elevation="0"
            :value="0"
          >
            <v-stepper-step
              v-for="(s, index) in hints"
              :key="index"
              :step="index+1"
            >
              {{ s.hint }}
            </v-stepper-step>
          </v-stepper>
        </v-col>
      </v-row>
    </v-container>
  </VeoPage>
</template>
<script lang="ts">
import { computed, defineComponent, useRoute } from '@nuxtjs/composition-api';
import { useTutorials } from '~/composables/intro';

export default defineComponent({
  setup() {
    const route = useRoute();
    const { hasHints, hasSteps, tutorials, load: openTutorial, hintsVisible, stepsVisible, hints, steps, step, options } = useTutorials();

    const items = computed(() =>
      tutorials.value
        .map((tutorial) => ({
          title: tutorial.title,
          subtitle: tutorial.route,
          value: tutorial.path,
          disabled: !tutorial.applicable,
          route: tutorial.route || '/',
          path: tutorial.path
        }))
        .sort((a, b) => a.route.localeCompare(b.route))
    );

    const setStep = (index: number) => {
      step.value = index;
      stepsVisible.value = true;
    };

    return {
      route,
      hasHints,
      hasSteps,
      hintsVisible,
      stepsVisible,
      tutorials: items,
      hints,
      steps,
      step,
      setStep,
      openTutorial,
      options
    };
  }
});
</script>
