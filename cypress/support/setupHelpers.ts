import { format } from 'date-fns';

type UnitDetails = {
  name: string | null;
  desc: string | null;
  domains: string[] | null;
};

export function generateUnitDetails() {
  const id = Cypress.env('pipelineId') ? Cypress.env('pipelineId') : self.crypto.randomUUID();

  const unitDetails: UnitDetails = {
    name: `${Cypress.env('testUnitPrefix')}${id}`,
    desc: `StartAt: ${format(new Date(), 'yy-MM-dd::hh:mm:ss')} | Spec: ${Cypress.spec.name} | Test: ${
      Cypress.currentTest.title
    }`,
    domains: ['DS-GVO']
  };

  Cypress.env('unitDetails', unitDetails);
}
