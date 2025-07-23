import { STATIC_SHORTCUTS_CONFIG } from './shortcutConfig';
import { CATEGORY_STATIC_SHORTCUT, type Shortcut } from './types';

export function useStaticShortcuts() {
  const router = useRouter();
  const { t } = useI18n();
  const data = computed(
    () =>
      [
        {
          id: 'nav-units',
          name: t('shortcuts.navigation.units.name'),
          description: t('shortcuts.navigation.units.description'),
          keys: STATIC_SHORTCUTS_CONFIG.navigation.units,
          category: CATEGORY_STATIC_SHORTCUT,
          action: () => router.push('/units')
        }
      ] as Shortcut[]
  );

  return {
    data
  };
}
