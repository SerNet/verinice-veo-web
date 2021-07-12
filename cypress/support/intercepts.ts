import { IBaseObject } from '~/types/VeoTypes';

export function interceptLayoutCalls(options?: IBaseObject) {
  if (!options?.ignoreAllSchemas) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/schemas$/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/schemas/fetchAll.json'
        });
      }
    );
  }

  if (!options?.ignoreFetchAllForms) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/formsapi$/
      },
      (req) => {
        req.reply({
          fixture: 'api/forms/fetchAll.json'
        });
      }
    );
  }

  if (!options?.ignoreSpecificForms) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/formsapi\/(.*)/
      },
      (req) => {
        req.reply({
          fixture: 'api/forms/$1.json'
        });
      }
    );
  }

  if (!options?.ignoreFetchAlLReports) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/reportsapi\/reports$/
      },
      (req) => {
        req.reply({
          fixture: 'api/reports/fetchAll.json'
        });
      }
    );
  }

  if (!options?.ignoreFetchAllUnits) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/units$/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/units/fetchAll.json'
        });
      }
    );
  }

  if (!options?.ignoreFetchAllDomains) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/domains\/$/
      },
      (req) => {
        req.reply({
          fixture: 'api/default/domains/fetchAll.json'
        });
      }
    );
  }
}
