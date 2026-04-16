import { HttpError } from '~/requests/crud';
import type { TVeoUnitImportPayload } from '~/composables/requests/useUnits';

export type TUnitImportValidationResult = {
  errors: string[];
  warnings: string[];
};

export function validateUnitImportPayload(
  payload: TVeoUnitImportPayload | undefined,
  t: (key: string) => string
): TUnitImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!payload) {
    return { errors, warnings };
  }

  if (!payload.unit) {
    errors.push(t('validation.missingUnit'));
  }

  if (!payload.domains?.length) {
    errors.push(t('validation.missingDomains'));
  }

  if (!payload.risks?.length) {
    errors.push(t('validation.missingRisks'));
  }

  if (!payload.unit?.name?.trim()) {
    warnings.push(t('validation.missingName'));
  }

  if (!payload.elements?.length) {
    warnings.push(t('validation.missingElements'));
  }

  return { errors, warnings };
}

export function extractUnitImportErrorMessages(error: unknown): string[] {
  const values = new Set<string>();

  const visit = (value: unknown) => {
    if (!value) return;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) values.add(trimmed);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (value instanceof HttpError) {
      if (value.data !== undefined) {
        visit(value.data);
      }
      if (value.message) {
        visit(value.message);
      }
      return;
    }

    if (value instanceof Error) {
      if (value.message) {
        visit(value.message);
      }
      return;
    }

    if (typeof value === 'object') {
      const entries = value as Record<string, unknown>;
      ['message', 'messages', 'errors', 'warnings', 'detail', 'details', 'violations'].forEach((key) =>
        visit(entries[key])
      );
      Object.values(entries).forEach(visit);
    }
  };

  visit(error);
  return [...values];
}
