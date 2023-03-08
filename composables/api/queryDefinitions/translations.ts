/*
 * verinice.veo web
 * Copyright (C) 2023  Jonas Heitmann
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
import { IVeoQueryDefinition, STALE_TIME } from "../utils/query";

export interface IVeoTranslations {
  lang: {
    [key: string]: Record<string, string>;
  };
}

export interface IVeoFetchTranslationsParameters {
  languages: string[];
}

export default {
  queries: {
    fetch: {
      primaryQueryKey: 'translations',
      url: '/api/translations',
      queryParameterTransformationFn: (queryParameters) => ({ query: { languages: queryParameters.languages.toString() } }),
      staticQueryOptions: {
        staleTime: STALE_TIME.LONG,
        placeholderData: { lang: {} }
      }
    } as IVeoQueryDefinition<IVeoFetchTranslationsParameters, IVeoTranslations>
  },
  mutations: {

  }
};
