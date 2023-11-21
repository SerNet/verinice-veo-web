import { login } from '../commands/login';
import { acceptAllCookies } from '../commands/cookies';
import { goToUnitSelection, selectUnit, createUnit, deleteUnit } from '../commands/units';

Cypress.Commands.addAll({
  login,
  acceptAllCookies,
  goToUnitSelection,
  selectUnit,
  createUnit,
  deleteUnit
});



// Uncaught exeptions make cypress test runs fail
// However, this is not always correct, some errors can be ignored
Cypress.on('uncaught:exception', (err, _runnable) => {

  // Prevent tests from failing on localhost
  if (err.message.includes("Cannot read properties of null")) {
    return false;
  }

  // Prevent ResizeObserver errors when testing in headless firefox
  if (err.message.includes("ResizeObserver loop completed with undelivered notifications.")) {
    return false;
  }

  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }

});

