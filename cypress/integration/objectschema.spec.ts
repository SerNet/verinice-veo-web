/// <reference path="../support/index.d.ts" />

describe('Objectschema', () => {
  beforeEach(() => {
    cy.auth()
    cy.fixture('objectschema/process.json').as('processSchema')
  })
  it('All functionalies from dialog to add/delete/change', function() {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/process?domains=GDPR%2CISO_27001'
      },
      req => {
        req.reply(this.processSchema)
      }
    )

    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas'
      },
      req => {
        req.reply({
          fixture: 'objectschema/schemas.json'
        })
      }
    )

    cy.visit('http://localhost:3000/editor')
    cy.get<HTMLLinkElement>('.v-main__wrap a.v-list-item.v-list-item--link')
      .first()
      .should('have.attr', 'href', '/editor/objectschema')

    cy.get<HTMLLinkElement>('.v-main__wrap a.v-list-item.v-list-item--link')
      .first()
      .click()

    cy.get('.v-dialog--active #input-86')
      .parent()
      .click()

    cy.get('.v-menu__content .v-list-item__title').should('contain.text', 'Process')

    cy.get('.v-menu__content .v-list-item__title')
      .contains('Process')
      .click()

    cy.get('.v-dialog--active .v-btn__content')
      .contains('Weiter')
      .click()

    const processRealValues = [
      { text: 'Standardattribute', numberOfProperties: Object.keys(this.processSchema.properties).length - 2 },
      {
        text: 'Individuelle Aspekte',
        numberOfProperties: Object.keys(this.processSchema.properties.customAspects.properties).length
      },
      {
        text: 'Individuelle Links',
        numberOfProperties: Object.keys(this.processSchema.properties.links.properties).length
      }
    ]

    /**
     * Define aliases
     */
    cy.get<HTMLElement>('.v-expansion-panel').as('expansionPanels')
    cy.get('@expansionPanels')
      .find<HTMLElement>('button.v-expansion-panel-header')
      .as('expansionPanelHeaders')
    cy.get('@expansionPanels')
      .find<HTMLDivElement>('.v-expansion-panel-content')
      .as('expansionPanelContent')

    /**
     * Test if number expansion panel header are correct with number of attributes
     */
    cy.get('@expansionPanelHeaders').each((el, i) => {
      const expansionPanelText = el[0].childNodes[0].nodeValue.trim()
      cy.wrap(expansionPanelText).should(
        'equal',
        `${processRealValues[i].text} (${processRealValues[i].numberOfProperties})`
      )
    })

    /**
     * Test customAspect delete
     */
    cy.get('@expansionPanels')
      .eq(1)
      .scrollIntoView({ offset: { top: -100, left: 0 } })
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[1].numberOfProperties)
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap > div:first-child .v-list-item__action--stack > .v-btn')
      .eq(1)
      .click()
    cy.get('.v-dialog__content--active .v-card__actions .v-btn')
      .eq(1)
      .click()
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[1].numberOfProperties - 1)

    /**
     * Test link delete
     */
    cy.get('@expansionPanels')
      .eq(2)
      .scrollIntoView({ offset: { top: -100, left: 0 } })
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[2].numberOfProperties)
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap > div:first-child .v-list-item__action--stack > .v-btn')
      .eq(1)
      .click()
    cy.get('.v-dialog__content--active .v-card__actions .v-btn')
      .eq(1)
      .click()
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[2].numberOfProperties - 1)
  })
})
