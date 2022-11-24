/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import { unref, useContext, watch } from '@nuxtjs/composition-api';
import { useMutation as vueQueryUseMutation } from '@tanstack/vue-query';
import { UseMutationOptions } from '@tanstack/vue-query/build/lib';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';

import { transformQueryParameters } from './query';
import { IBaseObject } from '~/lib/utils';

// Type for less typing in composables
export type MutationOptions<T = unknown> = Omit<UseMutationOptions<T, unknown, void, unknown>, 'queryFn'>;

/**
 * Wrapper for vue-query's useMutation to apply some custom logic to make it work more seamless with the legacy api plugin.
 *
 * @param mutationIdentifier Identifier of the mutation used for debugging.
 * @param mutationFunction Function to call to mutate (usually a function from the api plugin).
 * @param mutationParameters Parameters to pass to the mutation function.
 * @param mutationOptions Options modifiying mutation behaviour.
 * @returns Mutation object.
 */
export const useMutation = <T = void>(
  mutationIdentifier: string,
  mutationFunction: CallableFunction,
  mutationParameters: MaybeRef<IBaseObject>,
  mutationOptions?: MutationOptions<T>
) => {
  const { $config } = useContext();

  // Actual mutation getting executed
  const result = vueQueryUseMutation<T>(
    (mutationParameters: any) => mutationFunction(...transformQueryParameters(mutationIdentifier, mutationFunction.name, mutationParameters)),
    mutationOptions
  );

  // Debugging stuff
  if ($config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(mutationIdentifier))) {
    watch(
      () => result.isLoading?.value,
      (newValue) => {
        if (newValue) {
          // eslint-disable-next-line no-console
          console.log(
            `[vueQuery] Mutation "${mutationIdentifier}" is running with parameters "${JSON.stringify(mutationParameters)}". Fetching...\nOptions: "${JSON.stringify(
              mutationOptions
            )}"`
          );
        }
      }
    );
  }

  return {
    ...result,
    // @ts-ignore For some reason the type say mutate doesn't take parameters, even though it is documented that way and does.
    mutateAsync: () => result.mutateAsync(unref(mutationParameters))
  };
};
