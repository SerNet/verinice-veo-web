export function getRandomString(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

export function getRandomElementType(
  elementTypes: string[] = ['Process', 'Asset', 'Person', 'Incident', 'Document', 'Scenario', 'Control']
) {
  const idx = Math.floor(Math.random() * elementTypes.length);
  return elementTypes[idx];
}
