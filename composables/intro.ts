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
import { computed, isRef, nextTick, onBeforeUnmount, onMounted, Ref, ref, useAsync, useContext, useRoute, useRouter, watch, WatchStopHandle } from '@nuxtjs/composition-api';
import introJs, { Hint, IntroJs } from 'intro.js';
import { useI18n } from 'nuxt-i18n-composable';
import * as pathToRegexp from 'path-to-regexp';

import { onContentUpdate, onFetchFinish } from './utils';

interface ITutorialDocument extends introJs.Options {
  title?: string;
  route?: string;
}

const step = ref<number>(0);
const options = ref<ITutorialDocument>({});
const stepsVisible = ref<boolean>(false);
const hintsVisible = ref<boolean>(false);

/**
 * Will remove hints or steps on route change
 */
const stopOnRouteChange = ref<boolean>(true);

/**
 * Stop watching options
 * @see {configure}
 */
let _watchHandle: WatchStopHandle;
const stop = () => {
  _watchHandle?.();
  stepsVisible.value = false;
  hintsVisible.value = false;
};

/**
 * Create intro.js instance and watch for global state
 * @private
 */
export function createIntro() {
  const route = useRoute();
  const router = useRouter();
  onMounted(() => {
    let _instance: IntroJs = (window as any).$intro;
    if (_instance) return;
    // Configure intro.js
    _instance = (window as any).$intro = introJs();

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
    let _watchOptionsHandle: WatchStopHandle;
    let _watchHintsVisible: WatchStopHandle;
    let _watchStepsVisible: WatchStopHandle;
    let tutorialReady = false;
    // wait for pending fetches on current page
    onFetchFinish(() => {
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

      _watchStepsVisible = watch(
        stepsVisible,
        (v) => {
          if (v) {
            nextTick(() => {
              _instance.start();
              // defer step change to happen after start is finished
              setTimeout(() => {
                tutorialReady = true;
                _instance.goToStep(step.value + 1);

                // check wether element is a link element
                const isAnchorElement = (el: HTMLElement): el is HTMLAnchorElement => el && el.tagName === 'A';
                // emulate nuxt-link behaviour
                const onClickHandler = (event: MouseEvent) => {
                  const target = event.target as HTMLElement;
                  if (isAnchorElement(target)) {
                    const url = new URL(target.href, document.location.href);
                    const isRelative = url.host === document.location.host;
                    if (isRelative && (!target.target || target.target === '_self')) {
                      // Keep tutorial open while navigating inside tooltip
                      const _oldStopOnRouteChangeValue = stopOnRouteChange.value;
                      stopOnRouteChange.value = false;
                      // prevent default browser behaviour
                      event.preventDefault();
                      const fullPath = url.pathname + url.search + url.hash;
                      // use vue router for navigation
                      router.push(fullPath, () => {
                        // restore old stopOnRouteChange value
                        stopOnRouteChange.value = _oldStopOnRouteChangeValue;
                      });
                    }
                  }
                };

                const tooltipEl = document.querySelector<HTMLDivElement>('.vue-introjs-tooltip');
                tooltipEl?.addEventListener('click', onClickHandler);

                // tutorial has been completed
                _instance.oncomplete(() => {
                  // reset step
                  step.value = 0;
                  // sync visibility status
                  stepsVisible.value = false;
                  step.value = 0;
                });

                // the current step has been changed
                _instance.onchange(() => {
                  // Save current step
                  step.value = _instance.currentStep() || 0;
                });

                _instance.onexit(() => {
                  stepsVisible.value = false;
                  step.value = 0;
                  tutorialReady = false;
                });
              });
            });
          } else {
            _instance.exit(true);
            // Reset handlers
            _instance.oncomplete(() => {});
            _instance.onchange(() => {});
            _instance.onexit(() => {});
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
              tooltipClass: 'vue-introjs-tooltip',
              disableInteraction: false,
              showBullets: false,
              showButtons: true,
              showProgress: false,
              showStepNumbers: true,
              hintShowButton: false,
              hideNext: false,
              ...o
            });

            if (stepsVisible.value && tutorialReady) {
              // refresh options & steps
              _instance.refresh(true);
              // make changes visible by refreshing steps
              _instance.goToStep(step.value + 1);
            }
          }
        },
        { immediate: true, deep: true }
      );
    }, 1000);

    onBeforeUnmount(() => {
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
    steps: computed(() => options.value.steps || []),
    hints: computed(() => options.value.hints || []),
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
    const docs = await $content('', { deep: true }).where({ extension: '.yaml' }).sortBy('path', 'asc').fetch<ITutorialDocument>();
    if (!docs || !Array.isArray(docs)) return [];

    return (
      docs
        // only include docs with current language
        .filter((doc) => doc.lang === undefined || doc.lang === i18n.locale.value)
        .map((doc) => {
          const regex = pathToRegex(doc.route);
          return {
            ...doc,
            match: (path: string) => (regex ? regex.test(path) : true)
          };
        })
    );
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
     * @example `load('/tutorials/tutorial-test-steps')`
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