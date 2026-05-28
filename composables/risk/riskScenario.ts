export function getScenarioName(scenario?: { name?: string; displayName?: string; abbreviation?: string }) {
  if (scenario?.name) {
    return scenario.name;
  }

  const displayName = (scenario?.displayName || '').trim();
  const abbreviation = (scenario?.abbreviation || '').trim();
  const abbreviationCode = abbreviation.split(' ')[1];

  if (!abbreviation) {
    return displayName;
  }

  return displayName
    .replace(`${abbreviation} `, '')
    .replace(`${abbreviationCode} `, '')
    .replace(abbreviationCode, '')
    .trim();
}
