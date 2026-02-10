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
import { trim } from 'lodash';
import validator from 'validator';

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

  const formatTime = (date: Date) =>
    computed(() =>
      date.toLocaleDateString(locale.value, {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

  const formatDateTime = (date: Date) =>
    computed(() =>
      date.toLocaleDateString(locale.value, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

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

  const requiredRule = (v: string | undefined) => {
    switch (typeof v) {
      case 'string':
        return !!trim(v) || t('global.input.required');
      default:
        return (v !== undefined && v !== null) || t('global.input.required');
    }
  };

  const banSpecialChars = (v: string) => (hasNoSpecialChar(v) ? true : t('global.input.hasSpecialChar'));

  const usernameTooShort = (v: string) => (v.length < 3 ? t('global.input.usernameTooShort') : true);

  function hasNoSpecialChar(s: string): boolean {
    if (s === '') return true; // do not test empty strings
    const re = /^[\w-]+$/; // allowed characters
    return re.test(s);
  }

  const mailValidator = (v: string) => {
    if (typeof v !== 'string' || v.length > 254) return false;

    const isValid = validator.isEmail(v, {
      allow_utf8_local_part: false,
      require_tld: true
    });

    return isValid || t('global.input.invalidEmail');
  };

  return {
    requiredRule,
    banSpecialChars,
    mailValidator,
    usernameTooShort
  };
};

/**
 * generic helper handling error messages
 */
export type TVeoError = Error | { message: string; cause: string };

export function handleErrorMessage(err: unknown) {
  if (err instanceof Error) return { message: err.message, cause: err.cause } as Error;
  else return { message: String(err), cause: 'unknown' };
}
