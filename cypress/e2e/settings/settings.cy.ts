const featureEnabled = process.env.VEO_FEATURE_FLAG_SETTINGS === 'true';

const maybeDescribe = featureEnabled ? describe : describe.skip;

maybeDescribe('User Settings', function () {
  const settings = [{ key: 'compact', enabled: false }];

  beforeEach(() => {
    cy.login();
    cy.visit('/settings');
    cy.acceptAllCookies();
  });

  it('renders settings switches with correct labels and states', () => {
    settings.forEach((setting) => {
      const label = setting.key;

      cy.get(`[data-test="setting-${label}"]`)
        .should('exist')
        .within(() => {
          cy.contains('h2', new RegExp(label, 'i'));
          cy.get('input[type="checkbox"]').should(setting.enabled ? 'be.checked' : 'not.be.checked');
        });
    });
  });

  it('allows toggling a setting and saving', () => {
    const settingKey = 'compact';

    cy.get(`[data-test="setting-${settingKey}"]`).within(() => {
      cy.get('.v-input').click();
    });

    cy.get('button').contains('Save', { matchCase: false }).click();

    cy.get('.v-alert').should('be.visible').and('contain.text', 'successfully');
  });
});
