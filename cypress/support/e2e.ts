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
