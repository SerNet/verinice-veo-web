const loadTutorialSteps = (fileName: string) => {
  return cy.task('readTutorialYaml', fileName).then((data: any) => data.steps);
};
const runTutorial = (fileName: string) => {
  loadTutorialSteps(fileName).then((steps) => {
    steps.forEach((step: { title: string; intro: string }, index: number) => {
      cy.get('.introjs-tooltip-title').should('contain', step.title);
      cy.get('.introjs-tooltiptext').should('contain.html', step.intro);
      cy.get('.introjs-helperLayer').should('exist');

      if (index === steps.length - 1) {
        cy.get('.introjs-donebutton').click();
      } else {
        cy.get('.introjs-nextbutton').click();
      }
    });

    cy.get('.introjs-tooltip').should('not.exist');
    cy.get('.introjs-overlay').should('not.exist');
  });
};
describe('Tutorials', () => {
  before(() => {
    cy.importUnit({ fixturePath: 'units/test-unit-dsgvo.json' });
  });
  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
    cy.selectUnit(Cypress.env('dynamicTestData').testUnits[0].name);
    cy.handleLanguageBug();
  });

  it('should go through application bar tutorial', () => {
    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The application bar').click();
    runTutorial('2.app-bar.en.yaml');

    cy.get('.introjs-tooltip').should('not.exist');
    cy.get('.introjs-overlay').should('not.exist');
  });

  it('should go through the menu tutorial', () => {
    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The menu').click();
    runTutorial('3.menu.en.yaml');
  });

  it('should go through units tutorial', () => {
    cy.goToUnitSelection();
    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The unit selection').click();
    runTutorial('4.unitselection.en.yaml');
  });

  it('should go through the dashboard tutorial', () => {
    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The Dashboard').click();
    runTutorial('5.dashboard.en.yaml');
  });

  it('should go through object overview tutorial', () => {
    cy.url().then((fullUrl) => {
      const url = new URL(fullUrl);
      cy.visit(`${url.pathname}/scopes/SCP_Scope`, { failOnStatusCode: false });
    });

    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The object overview').click();
    runTutorial('6.objectoverview.en.yaml');
  });

  it('should go through object details tutorial', () => {
    cy.url().then((fullUrl) => {
      const url = new URL(fullUrl);
      cy.visit(`${url.pathname}/scopes`, { failOnStatusCode: false });
    });
    cy.getCustom('.v-data-table__tr').first().click();
    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The object view').click();
    runTutorial('7.objectdetails.en.yaml');
  });

  it('should go through catalog tutorial', () => {
    cy.url().then((fullUrl) => {
      const url = new URL(fullUrl);
      cy.visit(`${url.pathname}/catalog`, { failOnStatusCode: false });
    });
    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The catalogs').click();
    runTutorial('8.catalogs.en.yaml');
  });

  it('should go through reports tutorial', () => {
    cy.url().then((fullUrl) => {
      const url = new URL(fullUrl);
      cy.visit(`${url.pathname}/reports`, { failOnStatusCode: false });
    });
    cy.getCustom('.v-data-table__tr').first().click();
    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The reports').click();
    runTutorial('9.reports.en.yaml');
  });

  it.skip('should go through risks tutorial', () => {
    cy.url().then((fullUrl) => {
      const url = new URL(fullUrl);
      cy.visit(`${url.pathname}/risks/DSRA`, { failOnStatusCode: false });
    });
    cy.get('[data-component-name=tutorial-select]').click();
    cy.contains('The risk definitions').click();
    runTutorial('10.riskdefinition.en.yaml');
  });
});
