/// <reference path="../support/index.d.ts" />

import { interceptLayoutCalls } from '../support/intercepts';
import { IVeoEntity } from '../../types/VeoTypes';

describe('Objectschema Editor', () => {
  beforeEach(() => {
    cy.auth();
    interceptLayoutCalls();
    cy.visit(`/unit-d496f98f-c051-443c-9b1f-65d65b64996d/domains/domain-ed67e4d7-c657-4479-ba8a-c53999d2930a/forms/form-abbd6bf3-891c-4120-a3fd-bff06748b3ab/`);
    cy.wait('@G_fetchFormSchema');
  });

  // Only checking for correct request, we expect the vuetify component to work correctly
  it('Navigates the forms table using the forward/back buttons', function () {
    // Define intercept used below
    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/
    }).as('fetchObjects');

    // Go to next page (from page 0 to page 1)
    cy.get('.v-data-footer__icons-after .v-btn__content').click();
    cy.wait('@fetchObjects');
    cy.get('@fetchObjects').then((req: any) => {
      expect(req.request.url).to.contain('page=1');
    });

    // Go to previous page (from page 1 to page 0)
    cy.get('.mdi-chevron-left').click();
    cy.wait('@fetchObjects');
    cy.get('@fetchObjects').then((req: any) => {
      expect(req.request.url).to.contain('page=0');
    });
  });

  // Only checking for correct request, we expect the vuetify component to work correctly
  it('Changes page size of the table', function () {
    // Define intercept used below
    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/
    }).as('fetchObjects');

    const newTablePageSize = 25; // Valid option defined in itemsPerPageOptions in VeoFormList.vue

    // Skip to next page
    cy.get('.v-data-footer__icons-after .v-btn__content').click();
    cy.wait('@fetchObjects');

    // Change page size
    cy.get('[data-cy=forms-table]').get('.v-data-footer .v-input').closest('.v-select').type(`${newTablePageSize}{enter}`);
    cy.wait('@fetchObjects');
    cy.get('@fetchObjects').then((req: any) => {
      expect(req.request.url).to.contain(`size=${newTablePageSize}`); // Expect page size to increase to previously defined value
      expect(req.request.url).to.contain('page=0'); // Expect page to jump back to first page
      expect(cy.get('.v-data-footer__icons-after button').should('be.disabled')); // There are now more items on this page than exist => disable skip button
    });
  });

  // Only checking for correct request, we expect the vuetify component to work correctly
  it('Tests the sorting for every sortable column', function () {
    // Define intercept used below
    cy.intercept({
      method: 'GET',
      url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/
    }).as('fetchObjects');

    // Test whether the page jumps back to one if the user changes the sort direction
    cy.get('.v-data-footer__icons-after .v-btn__content').click();
    cy.wait('@fetchObjects');
    cy.get('[data-cy=forms-table]').contains('Objektname').click();
    cy.wait('@fetchObjects');
    cy.get('@fetchObjects').then((req: any) => {
      expect(req.request.url).to.contain('page=0'); // Expect page to jump back to first page
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500); // Wait for pending requests to end before continuing to avoid conflicting data

    const sortableColumns = ['designator', 'name', 'updatedAt', 'updatedBy']; // Array containing the property that should be sorted for (NOTE: Column in the VeoFormList.vue file might be named differently), so we make sure only valid properties are sorted

    // Iterate over every sortable table header and check if the correct params are sent
    cy.get('[data-cy=forms-table] th.sortable').each(($element, _index, _$list) => {
      return new Cypress.Promise((resolve) => {
        // Sort asc and desc
        for (const sortOrder of ['asc', 'desc']) {
          cy.wrap($element).click();
          cy.wait('@fetchObjects');
          cy.get('@fetchObjects').then((req: any) => {
            const sortByPropertyExists = sortableColumns.includes(new URL(req.request.url).searchParams.get('sortBy'));
            expect(req.request.url).to.contain(`sortBy=`);
            // eslint-disable-next-line no-unused-expressions
            expect(sortByPropertyExists).to.be.true; // Expect parameter to sort by to be part of sortableColumns
            expect(req.request.url).to.contain(`sortOrder=${sortOrder}`);
          });
        }
        resolve();
      });
    });
  });

  // Checks whether the list redirects to the correct object for editing
  it('Redirects the user to the edit page of an object', function () {
    cy.wait('@G_fetchObjects');
    const index = 4;

    // Load fixture to get the id
    let id: string;
    cy.fixture('api/default/entities/assets/fetchAll.json').then((allAssets) => {
      id = allAssets.items[index].id;
    });

    // Click on the edit button
    cy.get('[data-cy=forms-table] tbody')
      .children()
      .eq(index)
      .within(() => {
        cy.get('[data-cy=edit-item]').click();
        cy.location('pathname').should('contain', `asset-${id}`);
      });
  });

  // Checks whether the correct url gets called for deleting the object
  it('Deletes an object from the forms table', function () {
    cy.wait('@G_fetchObjects');
    const index = 4;

    // Load fixture to get the id
    let id: string;
    cy.fixture('api/default/entities/assets/fetchAll.json').then((allAssets) => {
      id = allAssets.items[index].id;
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
    cy.get('[data-cy=forms-table] tbody')
      .children()
      .eq(index)
      .within(() => {
        cy.get('[data-cy=delete-item]').click();
      });
    cy.get('[data-cy=confirm-button]').click();
  });

  it.only('Clones the object in the forms table', function () {
    cy.wait('@G_fetchObjects');
    const index = 4;

    // Load fixture to get the id
    let entity: IVeoEntity;
    let returnedEntity: IVeoEntity;
    cy.fixture('api/default/entities/assets/fetchAll.json').then((allAssets) => {
      entity = allAssets.items[index];
      entity.name = `${entity.name} (Klon)`;
      returnedEntity = allAssets;
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
    cy.get('[data-cy=forms-table] tbody')
      .children()
      .eq(index)
      .within(() => {
        cy.get('[data-cy=clone-item]').click();
      });
  });
});
