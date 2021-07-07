import { IBaseObject } from '~/types/VeoTypes';

export function interceptLayoutCalls(options?: IBaseObject) {
  if (!options?.ignoreAllSchemas) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas$/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/schemas.json'
        });
      }
    );
  }

  if (!options?.ignoreFetchAllForms) {
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo-forms\.develop\.\w+\.\w+\//
      },
      (req) => {
        req.reply({
          fixture: 'forms/fetchAllForms.json'
        });
      }
    );
  }

  if (!options?.ignoreFetchAlLReports) {
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo-reporting\.develop\.\w+\.\w+\/reports/
      },
      (req) => {
        req.reply({
          fixture: 'reports/fetchAllReports.json'
        });
      }
    );
  }

  if (!options?.ignoreFetchAllDomains) {
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo\.develop\.\w+\.\w+\/domains/
      },
      (req) => {
        req.reply({
          fixture: 'default/fetchAllDomains.json'
        });
      }
    );
  }
}
