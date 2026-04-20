/*
 * verinice.veo web
 * Copyright (C) 2026 jae
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
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { expectElementsToExist, expectElementsNotToExist } from './helpers';

// @ts-ignore // TS thinks this file would not exist
import domainUpdateOverview from '~/components/domain/update/overview.vue';
import type { VueWrapper } from '@vue/test-utils';

// Domain update mock data
const data = [
  {
    domain: {
      id: '00093b10-147d-40b2-9d22-4811ff95cd30',
      name: '00-test-template-domain-migration',
      templateVersion: 'template-version',
      translations: {
        de: {
          name: '00-translated-domain-name',
          abbreviation: '00-translated-domain-abbreviation',
          description: '00-translated-domain-description'
        }
      }
    },
    latestPossibleUpdate: {
      id: '471eb1d4-c2e2-5e6c-aa64-0d57ceebabe4',
      name: '00-test-template-domain-migration-latest-possible-update',
      templateVersion: '0.0.3',
      translations: {
        de: {
          name: '00-latest-possible-update-translated-domain-name',
          abbreviation: '00-latest-possible-update-translated-domain-abbreviation',
          description: '00-latest-possible-update-translated-domain-description'
        }
      }
    }
  },
  {
    domain: {
      id: '10093b10-147d-40b2-9d22-4811ff95cd30',
      name: '01-test-template-domain-migration',
      templateVersion: 'template-version',
      translations: {
        de: {
          name: '01-translated-domain-name',
          abbreviation: '01-translated-domain-abbreviation',
          description: '01-translated-domain-description'
        }
      }
    },
    latestPossibleUpdate: {
      id: '171eb1d4-c2e2-5e6c-aa64-0d57ceebabe4',
      name: '01-test-template-domain-migration-latest-possible-update',
      templateVersion: '1.0.3',
      translations: {
        de: {
          name: '10-latest-possible-update-translated-domain-name',
          abbreviation: '10-latest-possible-update-translated-domain-abbreviation',
          description: '10-latest-possible-update-translated-domain-description'
        }
      }
    }
  },
  {
    domain: {
      id: '20093b10-147d-40b2-9d22-4811ff95cd30',
      name: '02-test-template-domain-migration',
      templateVersion: '02-template-version',
      translations: {
        de: {
          name: '02-translated-domain-name',
          abbreviation: '02-translated-domain-abbreviation',
          description: '02-translated-domain-description'
        }
      }
    },
    latestPossibleUpdate: {
      id: '271eb1d4-c2e2-5e6c-aa64-0d57ceebabe4',
      name: '02-test-template-domain-migration',
      templateVersion: '2.0.3',
      translations: {
        de: {
          name: 'latest-possible-update-translated-domain-name',
          abbreviation: 'latest-possible-update-translated-domain-abbreviation',
          description: 'latest-possible-update-translated-domain-description'
        }
      }
    }
  }
];

// Mocks
const { useFetchDomainUpdateMock, useDomainUpdateMock } = vi.hoisted(() => {
  return {
    useFetchDomainUpdateMock: vi.fn(() => {
      return {
        data,
        isLoading: false
      };
    }),
    useDomainUpdateMock: vi.fn(() => {
      return {
        mutate: vi.fn(),
        isSuccess: false,
        isError: false,
        status: 'idle',
        error: ref(null)
      };
    })
  };
});

mockNuxtImport('useFetchDomainUpdate', () => {
  return useFetchDomainUpdateMock;
});

mockNuxtImport('useDomainUpdate', () => {
  return useDomainUpdateMock;
});

async function mountWithState(state: { data: typeof data; isLoading: boolean }): Promise<VueWrapper<any>> {
  useFetchDomainUpdateMock.mockReturnValue(state);
  return await mountSuspended(domainUpdateOverview);
}

const SELECTORS = {
  domainUpdateRecommendedAlert: '[data-veo-test="domain-update-recommended-alert"]',
  noDomainUpdatesAlert: '[data-veo-test="no-domain-updates-alert"]',
  domainUpdatesHeader: '[data-veo-test="domain-updates-header"]',
  domainUpdateCard: '[data-veo-test="domain-update-card"]',
  domainUpdateButton: '[data-veo-test="domain-update-button"]',
  domainUpdateConflictsHeader: '[data-veo-test="domain-update-conflicts-header"]',
  domainUpdateConflictsAlert: '[data-veo-test="domain-update-conflicts-alert"]',
  domainUpdatesConflictsList: '[data-veo-test="domain-update-conflicts-list"]'
};

const UPDATE_UI_SELECTORS = [SELECTORS.domainUpdateCard, SELECTORS.domainUpdatesHeader];

const CONFLICT_UI_SELECTORS = [
  SELECTORS.domainUpdateConflictsHeader,
  SELECTORS.domainUpdateConflictsAlert,
  SELECTORS.domainUpdatesConflictsList
];

describe('domainUpdateOverview - NO update available', () => {
  let component: VueWrapper<any>;

  beforeAll(async () => {
    component = await mountWithState({
      data: [],
      isLoading: false
    });
  });

  it('renders `no updates` alert', () => {
    component.getComponent(SELECTORS.noDomainUpdatesAlert);
  });

  it('does not render update alert', () => {
    expectElementsNotToExist(component, [SELECTORS.domainUpdateRecommendedAlert]);
  });

  it('does not render updates UI', () => {
    expectElementsNotToExist(component, UPDATE_UI_SELECTORS);
  });

  it('does not render conflicts UI', () => {
    expectElementsNotToExist(component, CONFLICT_UI_SELECTORS);
  });
});

describe('domainUpdateOverview - ONE update available', () => {
  let component: VueWrapper<any>;
  let cardText: string;

  beforeAll(async () => {
    component = await mountWithState({
      data: data.slice(0, 1),
      isLoading: false
    });

    const domainUpdateCard = component.find(SELECTORS.domainUpdateCard);
    cardText = domainUpdateCard.text();
  });

  it('renders exactly ONE card with domain updates', () => {
    const domainUpdateCards = component.findAll(SELECTORS.domainUpdateCard);
    expect(domainUpdateCards.length).toBe(1);
  });

  it('renders the correct domain name and update version in the card', () => {
    expect(cardText).toContain(data[0].domain.translations.de.name);
  });

  it('renders the correct update version in the card', () => {
    expect(cardText).toContain(data[0].latestPossibleUpdate.templateVersion);
  });

  it('does not render `no updates` alert', () => {
    expectElementsNotToExist(component, [SELECTORS.noDomainUpdatesAlert]);
  });

  it('renders `update recommended` alert', () => {
    expectElementsToExist(component, [SELECTORS.domainUpdateRecommendedAlert]);
  });

  it('renders the domain updates header', () => {
    expectElementsToExist(component, [SELECTORS.domainUpdatesHeader]);
  });

  it('does not render any HTML related to conflicts', () => {
    expectElementsNotToExist(component, CONFLICT_UI_SELECTORS);
  });
});

describe('Domain Updates Overview: THREE updates available', () => {
  let component: VueWrapper<any>;
  let domainUpdateCards: ReturnType<VueWrapper<any>['findAll']>;

  beforeAll(async () => {
    component = await mountWithState({
      data,
      isLoading: false
    });

    domainUpdateCards = component.findAll(SELECTORS.domainUpdateCard);
  });

  it('renders THREE cards with domain updates', () => {
    expect(domainUpdateCards.length).toBe(3);
  });

  it('renders correct domain names and update versions in cards', () => {
    const cardsData = data.map((item, index) => ({
      cardText: domainUpdateCards[index].text(),
      expectedName: item.domain.translations.de.name,
      expectedVersion: item.latestPossibleUpdate.templateVersion
    }));

    cardsData.forEach(({ cardText, expectedName, expectedVersion }) => {
      expect(cardText).toContain(expectedName);
      expect(cardText).toContain(expectedVersion);
    });
  });
});

describe('Domain Update Overview - Trigger update', () => {
  let component: VueWrapper<any>;
  let updateDomainMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    updateDomainMock = vi.fn();

    useDomainUpdateMock.mockReturnValue({
      mutate: updateDomainMock,
      isSuccess: false,
      isError: false,
      status: 'idle',
      error: ref(null)
    });

    component = await mountWithState({
      data: data.slice(0, 1),
      isLoading: false
    });

    const updateButton = component.find(SELECTORS.domainUpdateButton);
    expect(updateButton.exists()).toBe(true);
    await updateButton.trigger('click');
  });

  it('sets domain ID and template ID when update button is clicked', async () => {
    // Verify the updateDomain function was called
    expect(updateDomainMock).toHaveBeenCalledTimes(1);

    // Check correct refs were passed to useDomainUpdate()
    expect(useDomainUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({ value: data[0].domain.id }),
      expect.objectContaining({ value: data[0].latestPossibleUpdate.id })
    );
  });

  it('renders conflicts UI if conflicts exists', async () => {
    const conflictedElementsByUnit = [
      {
        unit: {
          id: 'unit-1',
          name: 'Test Unit 1'
        },
        elements: [
          {
            id: 'element-1',
            name: 'Test Element 1',
            type: 'asset'
          },
          {
            id: 'element-2',
            name: 'Test Element 2',
            type: 'process'
          }
        ]
      },
      {
        unit: {
          id: 'unit-2',
          name: 'Test Unit 2'
        },
        elements: [
          {
            id: 'element-3',
            name: 'Test Element 3',
            type: 'scope'
          }
        ]
      }
    ];

    // Update mock to simulate a response; here: 409 error
    const errorMock = {
      status: 409,
      data: {
        conflictedElementsByUnit
      }
    };

    useDomainUpdateMock.mockReturnValue({
      mutate: updateDomainMock,
      isSuccess: false,
      isError: true,
      status: 'error',
      error: ref(errorMock)
    });

    // Re-mount component with the error state
    component = await mountWithState({
      data: data.slice(0, 1),
      isLoading: false
    });

    expect(updateDomainMock).toHaveBeenCalledTimes(1);

    // Assert UI
    // Update recommended alert
    expectElementsToExist(component, [SELECTORS.domainUpdateRecommendedAlert]);

    // Conflicts UI
    expectElementsToExist(component, [
      SELECTORS.domainUpdateConflictsHeader,
      SELECTORS.domainUpdateConflictsAlert,
      SELECTORS.domainUpdatesConflictsList
    ]);

    // Updates UI is hidden?
    expectElementsNotToExist(component, [SELECTORS.domainUpdateCard, SELECTORS.domainUpdatesHeader]);
  });
});
