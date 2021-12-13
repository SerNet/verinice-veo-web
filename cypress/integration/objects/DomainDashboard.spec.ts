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
/// <reference path="../../support/index.d.ts" />
/// <reference types="cypress" />

import { upperFirst } from 'lodash';
import { FIRST_STEPS_COMPLETED } from '../../../util/LocalStorage';

describe('Domain dashboard', () => {
  beforeEach(() => {
    cy.auth();

    cy.interceptLayoutCalls();
  });

  before(() => {
    cy.auth();

    cy.interceptLayoutCalls();
    localStorage.setItem(FIRST_STEPS_COMPLETED, 'true');
    cy.visit(`/unit-d496f98f-c051-443c-9b1f-65d65b64996d/domains/domain-ed67e4d7-c657-4479-ba8a-c53999d2930a`);
    cy.wait('@G_fetchObjects');
  });

  it('Checks whether for every object type a widget gets shown', function () {
    cy.fixture('api/default/schemas/fetchAll.json').then((allSchemas) => {
      cy.get('[data-cy=unit-domains-domain-status-bar-chart-widget]').should('have.length', Object.keys(allSchemas).length);
    });
  });

  it('Checks whether every subtype of an object type gets shown and translated if a translation exists', function () {
    // Widget should contain at least one subtype with a translation and one without
    const widgetIndex = 2;
    const objectType = 'process';

    cy.fixture(`api/default/schemas/${objectType}.json`).then((objectSchema) => {
      const subTypes = (Object.values(objectSchema.properties.domains.properties)[0] as any).properties.subType.enum;

      cy.get('[data-cy=unit-domains-domain-status-bar-chart-widget]')
        .eq(widgetIndex)
        .within(() => {
          // Correct amount of charts get shown (one for every subtype)
          cy.get('[data-cy=veo-stacked-status-bar-chart-widget-subtype-row]').should('have.length', subTypes.length);

          for (const i in subTypes) {
            cy.fixture('api/forms/fetchAll.json').then((allForms) => {
              const form = allForms.find((form) => form.subType === subTypes[i]);

              // If the translation of the name exists, display it, else display the subtype
              if (form.name.de) {
                cy.get('h4').eq(Number(i)).should('have.text', form.name.de);
              } else {
                cy.get('h4').eq(Number(i)).should('have.text', subTypes[i]);
              }
            });
          }
        });
    });
  });

  it('Checks whether a placeholder text gets shown if either no objects or no subtypes exist', function () {
    // Widget should contain at least one subtype with a translation and one without
    const noSubtypesWidgetIndex = 3;
    const noObjectsWidgetIndex = 1;
    const noObjectsSubtype = 'INC_Incident';

    // No subtypes
    cy.get('[data-cy=unit-domains-domain-status-bar-chart-widget]')
      .eq(noSubtypesWidgetIndex)
      .within(() => {
        // Placeholder text gets shown
        cy.get('.v-card__text > div').should('contain.text', 'Für diesen Objekttyp existieren keine Subtypen');
      });

    // No objects
    cy.get('[data-cy=unit-domains-domain-status-bar-chart-widget]')
      .eq(noObjectsWidgetIndex)
      .within(() => {
        // Placeholder text gets shown
        cy.get('h4').contains(noObjectsSubtype).parent().parent().children().eq(1).children().eq(0).should('contain.text', 'Keine Objekte vorhanden');
      });
  });
});
