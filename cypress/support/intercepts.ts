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
        url: /.*\/formsapi\/(.+)/
      },
      (req) => {
        const id = req.url.split('/').pop();
        req.reply({
          fixture: `api/forms/${id}.json`
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

  if (!options?.ignoreFetchSpecificDomains) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/domains\/(.+)$/
      },
      (req) => {
        const id = req.url.split('/').pop();
        req.reply({
          fixture: `api/default/domains/${id}.json`
        });
      }
    );
  }

  if (!options?.ignoreSpecificEntities) {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/api\/(assets|controls|documents|incidents|persons|processes|scenarios|scopes)\?(.+)$/
      },
      (req) => {
        const path = req.url.split('?')[0];
        const type = path.split('/').pop();
        req.reply({
          fixture: `api/default/entities/${type}/fetchAll.json`
        });
      }
    );
  }
}
