import { generateUnitDetails, UnitDetails } from '../../support/setupHelpers';

const featureEnabled = Cypress.env('VEO_FEATURE_FLAG_USER_SETTINGS') === 'true';

const maybeDescribe = featureEnabled ? describe : describe.skip;
let unitDetails: UnitDetails;
maybeDescribe('User Settings', function () {
  const settings = [{ key: 'compact-styles', enabled: false }];

  beforeEach(() => {
    cy.login();
    cy.visit('/user-settings');
    cy.acceptAllCookies();
  });

  it('renders settings switches with correct labels and states', () => {
    settings.forEach((setting) => {
      const label = setting.key;

      cy.get(`[data-test="setting-${label}"]`)
        .should('exist')
        .within(() => {
          cy.get('input[type="checkbox"]').should(setting.enabled ? 'be.checked' : 'not.be.checked');
        });
    });
  });

  it('allows toggling a setting and saving', () => {
    const settingKey = 'compact-styles';

    cy.get(`[data-test="setting-${settingKey}"]`).within(() => {
      cy.get('.v-input').click();
    });

    cy.get('button').contains('Save', { matchCase: false }).click();

    cy.get('.v-alert').should('be.visible').and('contain.text', 'successfully');
  });
  it('check compact table', () => {
    unitDetails = generateUnitDetails('catalogs');
    cy.createUnit(unitDetails);

    cy.goToUnitSelection();
    cy.selectUnit(unitDetails.name);

    // go to catalog page to check table
    cy.navigateTo({ group: 'catalog', entry: 'all' });
    cy.getCustom('.v-data-table__tr').should('be.visible');
    cy.get(`[data-veo-test=loadedDataTable]`).should('have.class', 'ultra-compact-table');
  });
});
