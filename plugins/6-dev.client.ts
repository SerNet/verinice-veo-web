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
import { useQuerySync } from "~~/composables/api/utils/query";
import accounts from '~~/composables/api/queryDefinitions/accounts';
import catalogs from '~~/composables/api/queryDefinitions/catalogs';
import domains from '~~/composables/api/queryDefinitions/domains';
import forms from '~~/composables/api/queryDefinitions/forms';
import history from '~~/composables/api/queryDefinitions/history';
import monitoring from '~~/composables/api/queryDefinitions/monitoring';
import objects from '~~/composables/api/queryDefinitions/objects';
import reports from '~~/composables/api/queryDefinitions/reports';
import schemas from '~~/composables/api/queryDefinitions/schemas';
import translations from '~~/composables/api/queryDefinitions/translations';
import units from '~~/composables/api/queryDefinitions/units';

/**
 * This plugin allows developers to use the request functions of the frontend in the console, enabling them to develop e2e tests easier
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if(config.public.debug) {
    const api = {
      request: useQuerySync,
      queryDefinitions: {
        accounts,
        catalogs,
        domains,
        forms,
        history,
        monitoring,
        objects,
        reports,
        schemas,
        translations,
        units
      }
    };
        
    // @ts-ignore We expose the api to the window for developement purposes, so the integration-test-team can script without having to care about auth tokens and so on.
    window.api = api;
  }
});
