/*
 * verinice.veo web
 * Copyright (C) 2022  Markus Werner
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { computed, isRef, nextTick, onBeforeUnmount, onBeforeUpdate, onMounted, Ref, ref, useAsync, useContext, useRoute, watch, WatchStopHandle } from '@nuxtjs/composition-api';
import introJs, { IntroJs } from 'intro.js';
import { useI18n } from 'nuxt-i18n-composable';
import * as pathToRegexp from 'path-to-regexp';

import { onContentUpdate, onFetchFinish } from './utils';

interface IHint {}
interface HintHandle {}
interface ITutorialDocument extends introJs.Options {
  title: string;
  route?: string;
}

const step = ref<number | undefined>(undefined);
const options = ref<introJs.Options>({});
const instance = ref<IntroJs | undefined>(undefined);
const visible = ref<boolean>(false);

let _instance: IntroJs & { _options?: introJs.Options };

/**
 * Create intro.js instance and watch for global state
 * @private
 */
export function createIntro() {
  if (_instance) return;
  onMounted(() => {
    _instance = instance.value = introJs().setOptions({
      disableInteraction: true,
      showBullets: false,
      showButtons: false,
      showProgress: false,
      showStepNumbers: false,
      hideNext: true,
      steps: [{ title: 'Please wait...', intro: 'Waiting for page...' }]
    });
    const _watchVisible = watch(
      visible,
      (v) => {
        if (v) {
          _instance.start();
        } else {
          _instance.exit(true);
        }
      },
      { immediate: true }
    );

    let _stopHandle: WatchStopHandle;
    onFetchFinish(() => {
      _stopHandle = watch(
        options,
        (o) => {
          if (o) {
            _instance.setOptions({
              disableInteraction: false,
              showBullets: false,
              showButtons: true,
              showProgress: false,
              showStepNumbers: true,
              hideNext: false,
              ...o
            });

            if (visible.value && o?.steps?.length) {
              _instance.exit(true).start();
              nextTick(() => _instance.previousStep());
            }
            const _step = step.value;
            // Restore last step (goToStep starts to count at 1)
            if (_step !== undefined) {
              // _instance.goToStep(_step);
            }
          }
        },
        { immediate: true, deep: true }
      );
    }, 1000);

    _instance.oncomplete(() => {
      step.value = undefined;
      visible.value = false;
    });

    _instance.onchange(() => {
      // Save current step
      const s = _instance.currentStep();
      if (s) {
        // ... if not undefined or 0
        step.value = s;
      }
    });

    onBeforeUpdate(() => {
      // Save step before updating (for HMR)
      step.value = _instance.currentStep();
    });

    onBeforeUnmount(() => {
      // Save step before unmounting (for HMR)
      step.value = _instance.currentStep();
      _watchVisible();
      _stopHandle?.();
      _instance.exit(true);
    });
  });
}

/**
 * Use intro.js
 */
export function useIntro() {
  createIntro();
  let _watchHandle: WatchStopHandle;
  const stop = () => {
    _watchHandle?.();
    visible.value = false;
  };
  return {
    options,
    visible,
    step,
    start(opts: introJs.Options | Ref<introJs.Options | undefined>) {
      _watchHandle?.();
      // Start at first step
      step.value = undefined;
      // support reactive tutorials
      if (isRef(opts)) {
        _watchHandle = watch(
          opts,
          (opts) => {
            if (opts) {
              options.value = opts;
            } else {
              stop();
            }
          },
          { immediate: true, deep: true }
        );
      } else {
        options.value = opts;
      }
      // Show intro.js
      visible.value = true;
    },
    stop,
    /**
     * Provides information about whether hints are currently present
     */
    isHintPresent() {},
    /**
     * Add a hint to current page
     */
    addHint(_hint: IHint): HintHandle {
      return {};
    },
    /**
     * Remove a hint from current page
     */
    removeHint(_hint: HintHandle) {
      return {};
    },
    /**
     * Remove all hints from current page
     */
    removeAllHints() {
      return {};
    }
  };
}

export function useTutorials() {
  const { $content } = useContext();
  const intro = useIntro();
  const route = useRoute();
  const i18n = useI18n();
  const fetchDocs = async () => {
    const docs = await $content('', { deep: true })
      .where({ lang: { $undefinedin: [i18n.locale.value, undefined] }, extension: '.yaml' })
      .sortBy('path', 'asc')
      .fetch<ITutorialDocument>();
    if (!Array.isArray(docs)) return [];

    return docs.map((doc) => {
      const regex = pathToRegex(doc.route);
      return {
        ...doc,
        match: (path: string) => (regex ? regex.test(path) : true)
      };
    });
  };
  const tutorials = useAsync(fetchDocs, 'tutorials');

  onContentUpdate(async () => {
    tutorials.value = await fetchDocs();
  });

  const tutorialsForRoute = computed(() => tutorials.value?.filter((tutorial) => tutorial.match(route.value.fullPath)));

  const tutorialsAvailable = computed(() => !!tutorialsForRoute.value?.length);

  return {
    /**
     * Start a specific tutorial or the first applicable if no tutorialPath given
     */
    start(tutorialPath?: string) {
      const tutorial = computed(() => (tutorialPath ? tutorials.value?.find((_) => _.path === tutorialPath) : tutorialsForRoute.value?.[0]));
      intro.start(tutorial);
    },
    /**
     * Move to specific step in current tutorial
     */
    goto(_step: number) {},
    /**
     * Start current tutorial over
     */
    reset() {},
    /**
     * Stop current tutorial
     */
    stop() {
      return intro.stop();
    },
    /**
     * All tutorials
     */
    tutorials,
    /**
     * Applicable tutorials
     */
    tutorialsForRoute,
    /**
     * Are tutorials available for current route?
     */
    tutorialsAvailable
  };
}

/**
 * Vue uses path-to-regexp 1.7.0 (wildcard asterisk support)
 * @see https://router.vuejs.org/guide/essentials/dynamic-matching.html#advanced-matching-patterns
 */
function pathToRegex(route?: string) {
  try {
    return route && pathToRegexp.default(route);
  } catch (e) {
    throw new Error(`${e} while parsing route: ${route}`);
  }
}
