/*
 * verinice.veo web
 * Copyright (C) 2026 Haneen Husin
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIntro } from '~/composables/intro';

// Mocks
const introJsMocks = vi.hoisted(() => ({
  tourMock: vi.fn(),
  hintMock: vi.fn(),
  useIsFetchingMock: vi.fn(() => ({ value: 0 }))
}));

vi.mock('intro.js', () => ({
  default: {
    tour: introJsMocks.tourMock,
    hint: introJsMocks.hintMock
  }
}));

vi.mock('@tanstack/vue-query', () => ({
  useIsFetching: introJsMocks.useIsFetchingMock
}));

const TestComponent = {
  setup() {
    useIntro();
    useIntro();
    useIntro();
    return () => null;
  }
};

describe('useIntro', () => {
  let tourInstance: any;
  let hintInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    tourInstance = {
      onComplete: vi.fn(),
      onChange: vi.fn(),
      onExit: vi.fn(),
      exit: vi.fn(),
      setOptions: vi.fn(),
      start: vi.fn(),
      goToStep: vi.fn(),
      refresh: vi.fn(),
      getCurrentStep: vi.fn(() => 0)
    };

    hintInstance = {
      showHints: vi.fn(),
      hideHints: vi.fn(),
      destroy: vi.fn()
    };

    introJsMocks.tourMock.mockImplementation(() => tourInstance);
    introJsMocks.hintMock.mockImplementation(() => hintInstance);
  });

  it('should initialize intro.js tour and hint instances only once when useIntro is called multiple times', async () => {
    // given a component calling useIntro multiple times during setup
    // when the component is mounted
    await mountSuspended(TestComponent);

    // then intro.js tour and hint instances are initialized only once
    expect(introJsMocks.tourMock).toHaveBeenCalledTimes(1);
    expect(introJsMocks.hintMock).toHaveBeenCalledTimes(1);
  });
});
