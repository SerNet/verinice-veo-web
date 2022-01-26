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
import { getCurrentInstance, nextTick, useRoute } from '@nuxtjs/composition-api';
import { kebabCase } from 'lodash';

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

export const useCypress = () => {
  const instance = getCurrentInstance();
  const route = useRoute();
  return {
    /**
     * Composable version of prefixCyData
     * @param name Name that will be prefixed with component name
     */
    prefixCyData(name: string) {
      const componentName = instance?.type?.name as string | undefined;
      const prefix = componentName || route.value.name;
      return [prefix && kebabCase(prefix), name].flat().join('-');
    }
  };
};
