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
import introJs, { Hint, IntroJs } from 'intro.js';
import { useI18n } from 'nuxt-i18n-composable';
import * as pathToRegexp from 'path-to-regexp';

import { onContentUpdate, onFetchFinish } from './utils';

interface HintHandle {}
interface ITutorialDocument extends introJs.Options {
  title: string;
  route?: string;
}

const step = ref<number | undefined>(undefined);
const options = ref<introJs.Options>({});
const instance = ref<IntroJs | undefined>(undefined);
const stepsVisible = ref<boolean>(false);
const hintsVisible = ref<boolean>(false);

/**
 * Will remove hints or steps on route change
 */
const stopOnRouteChange = ref<boolean>(true);

let _instance: IntroJs & { _options?: introJs.Options };

let _watchHandle: WatchStopHandle;
const stop = () => {
  _watchHandle?.();
  stepsVisible.value = false;
  hintsVisible.value = false;
};

/**
 * Undocumented Intro.js options
 * @see https://github.com/usablica/intro.js/blob/master/src/index.js
 */

/**
 * Create intro.js instance and watch for global state
 * @private
 */
export function createIntro() {
  if (_instance) return;
  const route = useRoute();
  onMounted(() => {
    // Configure intro.js to show loading screen
    _instance = instance.value = introJs().setOptions({
      disableInteraction: true,
      showBullets: false,
      showButtons: false,
      showProgress: false,
      showStepNumbers: false,
      hideNext: true,
      steps: [{ title: 'Please wait...', intro: 'Waiting for page...' }]
    });

    // Stop watching tutorial on route change
    const _watchRouteChange = watch(
      () => route.value.fullPath,
      () => {
        if (stopOnRouteChange.value) {
          stop();
        }
      }
    );

    // watch stepsVisible (show tutorial steps)
    const _watchStepsVisible = watch(
      stepsVisible,
      (v) => {
        if (v) {
          // Need to exit first, otherwise intro.js will start at step 2
          _instance.exit(true).start();
        } else {
          _instance.exit(true);
        }
      },
      { immediate: true }
    );

    let _watchOptionsHandle: WatchStopHandle;
    let _watchHintsVisible: WatchStopHandle;
    // wait for pending fetches on current page
    onFetchFinish(() => {
      _instance.exit(true);
      // watch hintsVisible (show hints bubbles)
      _watchHintsVisible = watch(
        hintsVisible,
        (v) => {
          if (v) {
            _instance.showHints();
          } else {
            _instance.hideHints();
          }
        },
        { immediate: true }
      );
      // watch options (configure intro.js)
      _watchOptionsHandle = watch(
        options,
        (o) => {
          if (o) {
            _instance.setOptions({
              disableInteraction: false,
              showBullets: false,
              showButtons: true,
              showProgress: false,
              showStepNumbers: true,
              hintShowButton: false,
              hideNext: false,
              ...o
            });
            // is tutorial visible and have steps been configured?
            if (stepsVisible.value && o?.steps?.length) {
              _instance.exit(true).start();
            }
            const _step = step.value;
            // Restore last step (goToStep starts to count at 1)
            if (_step !== undefined) {
              // TODO: Check goToStep
              // _instance.goToStep(_step + 1);
            }
          }
        },
        { immediate: true, deep: true }
      );
    }, 1000);

    // tutorial has been completed
    _instance.oncomplete(() => {
      // reset step
      step.value = undefined;
      // sync visibility status
      stepsVisible.value = false;
    });

    // the current step has been changed
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
      _watchStepsVisible();
      _watchHintsVisible();
      _watchRouteChange?.();
      _watchOptionsHandle?.();
      _instance.exit(true);
    });
  });
}

/**
 * Use intro.js
 */
export function useIntro() {
  createIntro();

  /**
   * Configure intro.js
   * @param opts Options
   */
  const configure = (opts: introJs.Options | Ref<introJs.Options | undefined>) => {
    _watchHandle?.();
    // support reactive tutorials
    if (isRef(opts)) {
      _watchHandle = watch(
        opts,
        (opts) => {
          if (opts) {
            console.log('UPDATED', opts);
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
  };

  return {
    options,
    stepsVisible,
    stopOnRouteChange,
    hintsVisible,
    step,
    start() {
      stepsVisible.value = true;
    },
    configure,
    stop,
    /**
     * Provides information about whether hints are currently present
     */
    hasHints: computed(() => !!options.value.hints?.length),
    /**
     * Provides information about whether steps are currently present
     */
    hasSteps: computed(() => !!options.value.steps?.length),
    /**
     * Add a hint to current page
     * @returns list of current hints
     */
    addHint(hint: Hint) {
      const hints = [...(options.value?.hints || []), hint];
      configure({ ...options.value, hints });
      return hints;
    },
    /**
     * Remove a hint from current page
     * @param predicate Number to remove a specific index, String to remove by hint text or a filter function
     * @returns false if no hint was removed otherwise the list of current hints
     */
    removeHint(predicate: number | string | ((hint: Hint) => boolean)) {
      const hints = options.value.hints || [];
      const filter = (() => {
        switch (typeof predicate) {
          case 'number':
            return (_: Hint, index: number) => index === predicate;
          case 'string':
            return (hint: Hint) => hint.hint === predicate;
          default:
            return predicate;
        }
      })();
      const newHints = hints.filter(filter);
      if (newHints.length < hints.length) {
        configure({ ...options.value, hints });
        return newHints;
      } else {
        return false;
      }
    },
    /**
     * Remove all hints from current page
     */
    removeAllHints() {
      options.value = { ...options.value, hints: [] };
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
    if (!docs || !Array.isArray(docs)) return [];

    return docs.map((doc) => {
      const regex = pathToRegex(doc.route);
      return {
        ...doc,
        match: (path: string) => (regex ? regex.test(path) : true)
      };
    });
  };
  const _tutorials = useAsync(fetchDocs, 'tutorials');
  onContentUpdate(async () => {
    _tutorials.value = await fetchDocs();
  });

  // Make sure tutorials is always present
  const tutorials = computed(() => _tutorials.value?.map((tutorial) => ({ ...tutorial, applicable: tutorial.match(route.value.fullPath) })) || []);
  type Tutorial = typeof tutorials.value extends Array<infer U> ? U : never;

  const tutorialsForRoute = computed(() => tutorials.value?.filter((tutorial) => tutorial.applicable));

  const hasTutorials = computed(() => !!tutorialsForRoute.value?.length);

  type TutorialPredicate = (tutorial: Tutorial) => boolean;
  return {
    ...intro,
    /**
     * Load a specific tutorial or the first applicable if no predicate given
     * @param predicate path of tutorial or find function
     */
    load(predicate?: string | TutorialPredicate) {
      const _find: TutorialPredicate = typeof predicate === 'function' ? predicate : (_) => _.path === predicate;
      const tutorial = computed(() => (predicate ? tutorials.value?.find(_find) : tutorialsForRoute.value?.[0]));
      intro.configure(tutorial);
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
    hasTutorials
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
