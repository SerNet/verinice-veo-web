/// <reference types="cypress" />

import { waitForPageToLoad } from './utils';
import { truncate } from 'lodash';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      checkSubTypePage: typeof checkSubTypePage;
    }
  }
}

export function checkSubTypePage(subTypeName: string) {
  const breadcrumbContent = truncate(subTypeName, { length: 19, omission: '' });
  cy.getCustom('[data-component-name="breadcrumbs"]').should('include.text', breadcrumbContent).as('activeBreadcrumb');

  //.contains(/breadcrumbContent */).as('activeBreadcrumb');
  cy.getCustom('@activeBreadcrumb').should('include.text', breadcrumbContent);
  waitForPageToLoad();
}
