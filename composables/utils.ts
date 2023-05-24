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
import { isString, trim } from "lodash";

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


export const useRules = () => {
  const { t } = useI18n({ useScope: 'global' });

  const requiredRule = (v: string | undefined) => !!v && isString(v) && !!trim(v) || t('global.input.required');

  const banSpecialChars = (v: string) => hasNoSpecialChar(v) ? true : t('global.input.hasSpecialChar');
  function hasNoSpecialChar(s: string): boolean {
    if(s === '') return true; // do not test empty strings
    const re = /^[a-zA-Z0-9_-]+$/; // allowed characters
    return re.test(s);
  }

  return {
    requiredRule,
    banSpecialChars
  };
};
