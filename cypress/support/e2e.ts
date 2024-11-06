import { containsCustom, getCustom } from '../commands/base';
import { acceptAllCookies } from '../commands/cookies';
import { testDashboardWidgets, testEmptyDashboard } from '../commands/dashboard';
import { addDomain, getSelectedDomain, getVeoDomains, selectDomain, selectRandomDomain } from '../commands/domains';
import { checkSubTypePage } from '../commands/elements';
import { importUnit } from '../commands/importUnit';
import { handleLanguageBug, languageTo } from '../commands/language';
import { login } from '../commands/login';
import { iterateSubTypes, navigateTo } from '../commands/navigation';
import { veoRequest } from '../commands/requests';
import { checkPagination } from '../commands/table/pagination';
import {
  createUnit,
  deleteUnit,
  deleteUnitGUI,
  editUnit,
  getVeoTestUnitCard,
  goToUnitDashboard,
  goToUnitSelection,
  selectUnit,
  selectUnitFromDropdown
} from '../commands/units';

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
  testEmptyDashboard,
  selectRandomDomain,
  getSelectedDomain,
  selectDomain,
  handleLanguageBug,
  checkSubTypePage,
  iterateSubTypes,
  selectUnitFromDropdown,
  checkPagination,
  getCustom,
  containsCustom
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

const dismissAlertIfPresent = () => {
  setInterval(() => {
    const alert = Cypress.$('div[role="alert"][params="[object Object]"]');
    if (alert.length > 0) {
      alert.first().trigger('click');
    }
  }, 1000);
};

dismissAlertIfPresent();
