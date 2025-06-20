import type {
  IVeoRiskValue,
  IVeoRiskCategory,
  IVeoRiskValueLevel,
  IVeoDomainRiskDefinition,
  IVeoRiskPotentialImpact
} from '~/types/VeoTypes';

const defaultColor = '#444444';

// Helpers used in constructors
function getNewOrdinalValue(items: any[]) {
  return Math.max(...items.map((i) => i.ordinalValue)) + 1;
}

function getInitialTranslations(
  items?: IVeoRiskValueLevel[] | IVeoRiskPotentialImpact[] | UnsetItem[],
  abbreviation?: string
) {
  const initialTranslation = {
    name: 'N.N.',
    description: 'N.N.',
    ...(abbreviation ? { abbreviation } : {})
  };

  if (!items?.[0].translations?.[0]) return { de: { ...initialTranslation }, en: { ...initialTranslation } };

  return Object.keys(items[0].translations).reduce((acc, lang) => {
    acc[lang] = { name: '', description: '', ...(abbreviation ? { abbreviation } : {}) };
    return acc;
  });
}

// Classes used to manipulate risk categories

/** Used as filler marking items in risk matrices that are not set */
export class UnsetItem {
  isUnset: boolean;
  translations: any;
  htmlColor: string;
  ordinalValue: number;
  symbolicRisk: string;
  constructor() {
    this.isUnset = true;
    this.translations = getInitialTranslations();
    this.htmlColor = defaultColor;
    this.ordinalValue = -1;
    this.symbolicRisk = '';
  }
}

export class RiskValue {
  ordinalValue: number;
  htmlColor: string;
  translations: any;
  symbolicRisk: string;
  abbreviation: number;

  constructor(riskValues: IVeoRiskValueLevel[]) {
    this.ordinalValue = getNewOrdinalValue(riskValues);
    this.htmlColor = defaultColor;
    this.symbolicRisk = `symbolic_risk_${this.ordinalValue + 1}`;
    this.translations = getInitialTranslations(riskValues, (this.ordinalValue + 1).toString());
    this.abbreviation = this.ordinalValue + 1;
  }
}

export class ProbabilityLevel {
  ordinalValue: number;
  htmlColor: string;
  translations: any;

  constructor(probabilityLevels: any[]) {
    this.ordinalValue = getNewOrdinalValue(probabilityLevels);
    this.htmlColor = defaultColor;
    this.translations = getInitialTranslations(probabilityLevels);
  }
}

export class Impact {
  ordinalValue: number;
  htmlColor: string;
  translations: any;

  constructor(potentialImpacts: IVeoRiskPotentialImpact[] | UnsetItem[]) {
    this.ordinalValue = getNewOrdinalValue(potentialImpacts);
    this.htmlColor = defaultColor;
    this.translations = getInitialTranslations(potentialImpacts);
  }
}

// Check if values in risk matrices are unset
export function hasUnsetRiskValues(valueMatrix: IVeoRiskValueLevel[][]): boolean {
  if (!valueMatrix || !Array.isArray(valueMatrix)) return false;
  return (valueMatrix.flat() ?? []).some((riskValue) => Object.hasOwn(riskValue, 'isUnset'));
}

// Manipulate risk categories
export function updateRiskMatrixValues(
  category: IVeoRiskCategory,
  oldRiskValue: IVeoRiskValueLevel,
  newRiskValue: IVeoRiskValueLevel
) {
  const valueMatrix =
    category.valueMatrix?.map((row) =>
      row.map((riskValue) => (riskValue.ordinalValue === oldRiskValue.ordinalValue ? newRiskValue : riskValue))
    ) ?? undefined;
  return { ...category, valueMatrix };
}

export function updateRiskCategory(riskCategories: IVeoRiskCategory[], newRiskCategory: IVeoRiskCategory) {
  return riskCategories.map((oldCategory) => (oldCategory.id === newRiskCategory.id ? newRiskCategory : oldCategory));
}

export function getPotentialImpactsByCategory(riskDefinition: IVeoDomainRiskDefinition, categoryId: string) {
  if (!riskDefinition.categories) return [];
  const category = riskDefinition.categories.find((cat) => cat.id === categoryId);
  return category?.potentialImpacts ?? [];
}

export function createNewMatrixRow(
  valueMatrix: IVeoRiskValueLevel[][] = [],
  newValue: IVeoRiskValueLevel | UnsetItem,
  rowLength: number = 0
) {
  const valueMatrixRowLength = valueMatrix?.[0]?.length ?? rowLength;
  const newRow = Array(valueMatrixRowLength).fill(newValue);

  return [...valueMatrix, newRow];
}

export function removeMatrixRow(valueMatrix: IVeoRiskValueLevel[][], index: number) {
  if (!valueMatrix?.length) return;
  return valueMatrix.filter((_, i) => i !== index);
}
