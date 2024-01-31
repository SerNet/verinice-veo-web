type UnitDetails = {
  name: string | null;
  desc: string | null;
  domains: string[] | null;
};

export function generateUnitDetails() {
  const id =
    Cypress.env('pipelineId') ?
      Cypress.env('pipelineId')
    : self.crypto.randomUUID();

  const unitDetails: UnitDetails = {
    name: `${Cypress.env('testUnitPrefix')}${id}-spec-${Cypress.spec.name}`,
    desc: `Spec: ${Cypress.spec.name} | Test: ${Cypress.currentTest.title}`,
    domains: ['DS-GVO']
  };

  Cypress.env('unitDetails', unitDetails);
}
