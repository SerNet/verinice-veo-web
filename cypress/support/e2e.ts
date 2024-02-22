import { veoRequest } from '../commands/requests';
import { getVeoDomains } from '../commands/domains';
import { login } from '../commands/login';
import { acceptAllCookies } from '../commands/cookies';
import {
  goToUnitSelection,
  goToUnitDashboard,
  selectUnit,
  createUnit,
  createUnitGUI,
  deleteUnit,
  deleteUnitGUI
} from '../commands/units';
import { generateUnitDetails } from './setupHelpers';
import { navigateTo } from '../commands/navigation';

Cypress.Commands.addAll({
  veoRequest,
  getVeoDomains,
  login,
  acceptAllCookies,
  goToUnitSelection,
  goToUnitDashboard,
  selectUnit,
  createUnit,
  createUnitGUI,
  deleteUnit,
  navigateTo,
  deleteUnitGUI
});

before(() => {
  generateUnitDetails();
});

// Uncaught exeptions make cypress test runs fail
// However, this is not always correct, some errors can be ignored
Cypress.on('uncaught:exception', (err, _runnable) => {
  // Prevent tests from failing on localhost
  if (err.message.includes('Cannot read properties of null')) {
    return false;
  }

  // Prevent ResizeObserver errors when testing in headless firefox
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications.')) {
    return false;
  }

  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }

  return false;
});
