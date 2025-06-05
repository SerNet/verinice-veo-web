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

function getInitialTranslations(riskValues?: IVeoRiskValueLevel[], abbreviation?: string) {
  const initialTranslation = {
    name: 'N.N.',
    description: 'N.N.',
    ...(abbreviation ? { abbreviation } : {})
  };

  if (!riskValues?.[0].translations?.[0]) return { de: initialTranslation, en: initialTranslation };

  return Object.keys(riskValues[0].translations).reduce((acc, lang) => {
    acc[lang] = { name: '', description: '', ...(abbreviation ? { abbreviation } : {}) };
    return acc;
  });
}

// Classes used to manipulate risk categories

/** Used as filler marking items in risk matrices that are not set */
export class UnsetItem {
  isUnset: boolean;
  translations: any;
  constructor() {
    this.isUnset = true;
    this.translations = getInitialTranslations();
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

  constructor(potentialImpacts: IVeoRiskPotentialImpact[]) {
    this.ordinalValue = getNewOrdinalValue(potentialImpacts);
    this.htmlColor = defaultColor;
    this.translations = getInitialTranslations(potentialImpacts);
  }
}


