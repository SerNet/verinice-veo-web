/*
 * verinice.veo web
 * Copyright (C) 2021  Markus Werner
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
import { NuxtApp } from '@nuxt/types/app';
import { computed, nextTick, onMounted, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export const useFormatters = () => {
  const { locale } = useI18n();

  const formatDate = (date: Date) =>
    computed(() =>
      date.toLocaleDateString(locale.value, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    );

  const formatTime = (date: Date) => computed(() => date.toLocaleDateString(locale.value, { hour: '2-digit', minute: '2-digit' }));

  const formatDateTime = (date: Date) =>
    computed(() => date.toLocaleDateString(locale.value, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }));

  return {
    formatDate,
    formatDateTime,
    formatTime
  };
};

/**
 * Performs the action `fn` and ignores further calls until nextTick
 */
export const useThrottleNextTick = () => {
  let lastPromise: Promise<any> | undefined;

  const throttle = (fn: () => any) => {
    if (lastPromise) return lastPromise;
    lastPromise = new Promise<void>((resolve) =>
      nextTick(() => {
        try {
          fn();
        } finally {
          lastPromise = undefined;
          resolve();
        }
      })
    );
    return lastPromise;
  };

  return { throttle };
};

export const onContentUpdate = (callback: (context: { event: string; path: string }) => void) => {
  const { isDev } = useContext();
  if (isDev && process.client) {
    withNuxt(($nuxt: Vue) => {
      $nuxt.$on('content:update', callback);
    });
  }
};

export const withNuxt = (callback: (nuxt: NuxtApp) => any) => {
  const win = window as any;
  if ('$nuxt' in win) {
    callback(win.$nuxt);
  } else {
    win.onNuxtReady(callback);
  }
};

export const onFetchFinish = (callback: (nuxt: NuxtApp) => any, interval: number = 100) =>
  withNuxt((nuxt) => {
    const intervalHandle = setInterval(() => {
      if (!nuxt.isFetching) {
        clearInterval(intervalHandle);
        nextTick(() => callback(nuxt));
      }
    }, interval);
  });

export const onMountedFetchFinish = (callback: (nuxt: NuxtApp) => any, interval: number = 100) => onMounted(() => onFetchFinish(callback, interval));
