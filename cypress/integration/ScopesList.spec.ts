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
/// <reference path="../support/index.d.ts" />
import { IVeoEntity } from '../../types/VeoTypes';

describe('Scopes List', () => {
  beforeEach(() => {
    cy.auth();

    cy.interceptLayoutCalls();
    cy.visit(`/unit-d496f98f-c051-443c-9b1f-65d65b64996d/scopes/-/list/`);
    cy.wait('@G_fetchObjects');
  });

  // Only checking for correct request, we expect the vuetify component to work correctly
  it('Navigates the forms table using the forward/back buttons', function () {
    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/,
      query: { page: '1' }
    }).as('fetchObjects1');

    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/,
      query: { page: '0' }
    }).as('fetchObjects2');

    // Go to next page (from page 0 to page 1)
    cy.get('.v-data-footer__icons-after .mdi-chevron-right').click();
    cy.wait('@fetchObjects1').its('request.url').should('contain', 'page=1');

    // Go to previous page (from page 1 to page 0)
    cy.get('.v-data-footer__icons-before .mdi-chevron-left').click();
    cy.wait('@fetchObjects2').its('request.url').should('contain', 'page=0');
  });

  // Only checking for correct request, we expect the vuetify component to work correctly
  it('Changes page size of the table', function () {
    const newTablePageSize = 25; // Valid option defined in itemsPerPageOptions in VeoFormList.vue

    // Skip to next page
    cy.get('.v-data-footer__icons-after .mdi-chevron-right').click();
    cy.wait('@G_fetchObjects');

    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/,
      query: { page: '0', size: '25' }
    }).as('fetchObjects');

    // Change page size
    cy.get('[data-cy=veo-object-list-objects-table] .v-data-footer .v-input').closest('.v-select').type(`${newTablePageSize}{enter}`);
    cy.wait('@fetchObjects').should((req: any) => {
      expect(req.request.url).to.contain(`size=${newTablePageSize}`); // Expect page size to increase to previously defined value
      expect(req.request.url).to.contain('page=0'); // Expect page to jump back to first page
    });
    cy.get('.v-data-footer__icons-after button').should('be.disabled'); // There are now more items on this page than exist => disable skip button
  });

  // Only checking for correct request, we expect the vuetify component to work correctly
  it('Tests the sorting for every sortable column', function () {
    let descendingSortings = 0;
    let ascendingSortings = 0;
    let totalQueries = 0;
    const sortableColumns = ['designator', 'name', 'updatedAt', 'updatedBy']; // Array containing the property that should be sorted for (NOTE: Column in the VeoFormList.vue file might be named differently), so we make sure only valid properties are sorted

    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/,
      query: { page: '0' }
    }).as('fetchObjects');

    // Test whether the page jumps back to one if the user changes the sort direction
    cy.get('.v-data-footer__icons-after .mdi-chevron-right').click();
    cy.wait('@G_fetchObjects');
    cy.get('[data-cy=veo-object-list-objects-table]').contains('Objektname').click();
    cy.wait('@fetchObjects').its('request.url').should('contain', 'page=0');

    // Iterate over every sortable table header and check if the correct params are sent
    cy.get('[data-cy=veo-object-list-objects-table] th.sortable').each(($element, _index, _$list) => {
      return new Cypress.Promise((resolve) => {
        // Sort asc and desc
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        for (const sortOrder of ['asc', 'desc']) {
          cy.wrap($element).click();
          cy.get('@G_fetchObjects').should((req: any) => {
            const sortByPropertyExists = sortableColumns.includes(new URL(req.request.url).searchParams.get('sortBy'));
            expect(req.request.url).to.contain(`sortBy=`);
            // eslint-disable-next-line no-unused-expressions
            expect(sortByPropertyExists).to.be.true; // Expect parameter to sort by to be part of sortableColumns
            if (req.request.url.includes('sortOrder=asc')) {
              ascendingSortings++;
            } else if (req.request.url.includes('sortOrder=desc')) {
              descendingSortings++;
            }
            totalQueries++;
          });
        }

        // eslint-disable-next-line no-unused-expressions
        expect(descendingSortings === ascendingSortings).to.be.true;
        // eslint-disable-next-line no-unused-expressions
        expect(totalQueries === descendingSortings * 2).to.be.true;
        resolve();
      });
    });
  });

  // Checks whether the list redirects to the correct object for editing
  it('Redirects the user to the edit page of an object', function () {
    const index = 4;
    let id: string;

    cy.wait('@G_fetchObjects');

    // Load fixture to get the id
    cy.fixture('api/default/entities/scopes/fetchAll.json').then((allScopes) => {
      id = allScopes.items[index].id;
    });

    // Click on the edit button
    cy.get('[data-cy=veo-object-list-objects-table] tbody tr:not(.v-data-table__empty-wrapper)')
      .eq(index)
      .within(() => {
        cy.get('[data-cy=veo-object-list-edit-item]').click();
        cy.location('pathname').should('contain', `scope-${id}`);
      });
  });

  // Checks whether the correct url gets called for deleting the object
  it('Deletes an object from the forms table', function () {
    const index = 4;
    let id: string;

    cy.wait('@G_fetchObjects');

    // Load fixture to get the id
    cy.fixture('api/default/entities/scopes/fetchAll.json').then((allScopes) => {
      id = allScopes.items[index].id;
    });

    cy.intercept(
      {
        method: 'DELETE',
        url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\/(.+)$/
      },
      (req) => {
        expect(req.url).to.contain(id);

        req.reply({
          success: true,
          resourceId: 'string',
          message: 'string'
        });
      }
    );

    // Click on the edit button
    cy.get('[data-cy=veo-object-list-objects-table] tbody tr:not(.v-data-table__empty-wrapper)')
      .eq(index)
      .within(() => {
        cy.get('[data-cy=veo-object-list-delete-item]').click();
      });
    cy.get('[data-cy=veo-delete-entity-dialog-confirm-button]').click();
  });

  it('Clones the object in the forms table', function () {
    const index = 4;
    let entity: IVeoEntity;
    let returnedEntity: IVeoEntity;

    cy.wait('@G_fetchObjects');

    // Load fixture to get the id
    cy.fixture('api/default/entities/scopes/fetchAll.json').then((allScopes) => {
      entity = allScopes.items[index];
      entity.name = `${entity.name} (Klon)`;
      returnedEntity = allScopes;
      delete entity.id;
      delete entity.designator;
    });

    cy.intercept(
      {
        method: 'POST',
        url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)$/
      },
      (req) => {
        expect(req.body).to.deep.equal(entity);

        req.reply(returnedEntity);
      }
    );

    // Click on the edit button
    cy.get('[data-cy=veo-object-list-objects-table] tbody  tr:not(.v-data-table__empty-wrapper)')
      .eq(index)
      .within(() => {
        cy.get('[data-cy=veo-object-list-clone-item]').click();
      });
  });

  it('Views the child items of an entity not containing child entities', function () {
    const index = 4;
    let id: string;

    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/
    }).as('fetchObjects');

    cy.wait('@G_fetchObjects');

    // Load fixture to get the id
    cy.fixture('api/default/entities/scopes/fetchAll.json').then((allScopes) => {
      id = allScopes.items[index].id;
    });

    // Click on the column to go into
    cy.get('[data-cy=veo-object-list-objects-table] tbody tr:not(.v-data-table__empty-wrapper)')
      .eq(index)
      .click()
      .then(() => {
        cy.location('pathname').should('contain', `unit-d496f98f-c051-443c-9b1f-65d65b64996d/scopes/scope-${id}/list`);

        cy.wait('@fetchObjects');
        cy.get('[data-cy=veo-object-list-objects-table] tbody tr:not(.v-data-table__empty-wrapper)').should('have.length', 1);
        cy.get('[data-cy=veo-object-list-navigate-parent]').should('exist');
      });
  });

  it('Views the child items of an entity containing child entities', function () {
    const index = 3;
    let id: string;

    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/
    }).as('fetchObjects');

    cy.wait('@G_fetchObjects');

    // Load fixture to get the id
    cy.fixture('api/default/entities/scopes/fetchAll.json').then((allScopes) => {
      id = allScopes.items[index].id;
    });

    // Click on the column to go into
    cy.get('[data-cy=veo-object-list-objects-table] tbody tr:not(.v-data-table__empty-wrapper)')
      .eq(index)
      .click()
      .then(() => {
        cy.location('pathname').should('contain', `unit-d496f98f-c051-443c-9b1f-65d65b64996d/scopes/scope-${id}/list`);

        cy.wait('@fetchObjects');
        cy.get('[data-cy=veo-object-list-objects-table] tbody tr:not(.v-data-table__empty-wrapper)').should('have.length', 5);
      });
  });

  it('Unlinks a child item from its parent', function () {
    const index = 3;
    const childIndex = 1;

    cy.intercept(
      {
        method: 'PUT',
        url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\/(.*)$/
      },
      (req) => {
        req.reply(req.body);
      }
    ).as('saveEntity');

    cy.wait('@G_fetchObjects');

    // Click on the column to go into
    cy.get('[data-cy=veo-object-list-objects-table] tbody tr:not(.v-data-table__empty-wrapper)')
      .eq(index)
      .click()
      .then(() => {
        cy.wait(['@G_fetchObjects', '@G_fetchObject']);
        cy.get('[data-cy=veo-object-list-objects-table] tbody tr:not(.v-data-table__empty-wrapper)')
          .eq(childIndex)
          .within(() => {
            cy.get('[data-cy=veo-object-list-unlink-item]').click();
          });
      });
    cy.get('[data-cy=veo-unlink-entity-dialog-confirm-button]').click();
    cy.wait('@saveEntity').its('request.body').toMatchSnapshot();
  });
});
