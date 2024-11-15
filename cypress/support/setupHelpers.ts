import { format } from 'date-fns';

export type UnitDetails = {
  name: string | null;
  desc: string | null;
  domains: string[] | null;
};

// Generates unique unit details for each test run
export function generateUnitDetails(nodeName: string) {
  const uniqueSuffix =
    Cypress.env('pipelineId') ? Cypress.env('pipelineId') : `${Date.now()}-${self.crypto.randomUUID()}`;

  // Define the unit details
  const unitDetails: UnitDetails = {
    name: `${Cypress.env('testUnitPrefix')}${uniqueSuffix}-${nodeName}`, // Ensure uniqueness in the name
    desc: `StartAt: ${format(new Date(), 'yy-MM-dd::hh:mm:ss')} | Spec: ${Cypress.spec.name} | Test: ${Cypress.currentTest.title}`,
    domains: ['DS-GVO']
  };

  // Initialize env var to share test data between tests
  Cypress.env('dynamicTestData', {});

  return unitDetails;
}
