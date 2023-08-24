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

Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent tests from failing on localhost
  if (err.message.includes("Cannot read properties of null")) {
    return false
  }
});
