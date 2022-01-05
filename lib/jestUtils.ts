/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann
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
import { Wrapper } from '@vue/test-utils';

export function getFormInput(label: string, formWrapper: string = '.vf-wrapper'): Vue {
  const inputs = Array.from(document.querySelectorAll(`${formWrapper} .v-input`));
  const inputField = inputs.find((input) => input.querySelector('label')?.textContent === label);
  return (inputField as any)?.__vue__;
}

export function getVSelectComponentByDataCy(wrapper: Wrapper<Vue, Element>, name: string) {
  const rawInput = wrapper.find(`[data-cy=${name}]`);

  let el = rawInput.element;
  while (!el.className.split(' ').includes('v-select')) {
    if (!el.parentElement) {
      break;
    } else {
      el = el.parentElement;
    }
  }
  expect((el as any).__vue__).toBeTruthy();
  return (el as any).__vue__;
}

export function getEmittedEvent(wrapper: Wrapper<Vue, Element>, event: string): any {
  const emittedEvents = wrapper.emitted();
  expect(emittedEvents[event]).toBeTruthy();
  const eventValue: any[] = emittedEvents[event]?.pop() || [];

  return eventValue[0];
}
