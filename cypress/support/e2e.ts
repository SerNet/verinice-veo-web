import { veoRequest } from '../commands/requests';
import { getVeoDomains, selectRandomDomain, getSelectedDomain, selectDomain, addDomain } from '../commands/domains';
import { login } from '../commands/login';
import { acceptAllCookies } from '../commands/cookies';
import {
  goToUnitSelection,
  goToUnitDashboard,
  selectUnit,
  createUnit,
  editUnit,
  deleteUnit,
  deleteUnitGUI,
  getVeoTestUnitCard
} from '../commands/units';
import { generateUnitDetails } from './setupHelpers';
import { testDashboardWidgets } from '../commands/dashboard';
import { importUnit } from '../commands/importUnit';
import { languageTo } from '../commands/language';
import { navigateTo } from '../commands/navigation';

Cypress.Commands.addAll({
  veoRequest,
  getVeoDomains,
  addDomain,
  login,
  acceptAllCookies,
  goToUnitSelection,
  goToUnitDashboard,
  selectUnit,
  createUnit,
  deleteUnit,
  editUnit,
  navigateTo,
  deleteUnitGUI,
  importUnit,
  languageTo,
  getVeoTestUnitCard,
  testDashboardWidgets,
  selectRandomDomain,
  getSelectedDomain,
  selectDomain
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
