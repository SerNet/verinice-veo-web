/**
 * @description: Uses global messages and falls back on local messages .
 */
export function useVeoI18n() {
  const { t: globalT } = useI18n({ useScope: 'global' });
  const { t: localT } = useI18n();
  return {
    t: (key: string) => globalT(key, localT(key))
  };
}
