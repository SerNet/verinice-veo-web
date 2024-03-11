import { format } from 'date-fns';
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';

export type TUnit = {
  id: string;
  name: string;
  description: string;
  metaData: string;
  link: string;
  profilesUrl: string;
  isFavorite: boolean;
  domains: Array<{
    name: string;
    abbreviation: string;
    color: string;
  }>;
  raw: IVeoUnit;
};

const COLORS: Record<string, string> = { ITGS: 'green', 'DS-GVO': 'primary', NIS2: 'purple', DEFAULT: 'black' };

export function mapUnitValues({ unit, favoriteUnitId }: { unit: IVeoUnit; favoriteUnitId: string | null }) {
  return {
    id: unit.id,
    name: unit.name,
    description: unit?.description,
    link: `/${unit.id}/domains/${unit.domains?.[0].id}`,
    profilesUrl: `/${unit.id}/domains/${unit.domains?.[0].id}/profiles`,
    isFavorite: unit.id === favoriteUnitId ? true : false,
    metaData: `by: ${unit.createdBy} | at: ${format(unit.createdAt, 'dd.MM.yyyy')}`,
    domains: unit.domains.map((d) => ({
      name: d.name,
      abbreviation: d.abbreviation,
      color: d.abbreviation && COLORS.hasOwnProperty(d.abbreviation) ? COLORS[d.abbreviation] : COLORS['DEFAULT']
    })),
    raw: toRaw(unit)
  };
}
