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
import { useRequest } from "~~/composables/api/utils/request";

/**
 * This plugin allows developers to use the request function of the frontend in the console, enabling them to develop e2e tests easier
 * Example: await request('/api/units/1234-abcde-...', { method: DELETE })
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const { request } = useRequest();

  if(config.public.debug) {
    // @ts-ignore We expose the request function to the window for developement purposes, so the integration-test-team can script without having to care about auth tokens and so on.
    window.request = request;
  }
});
