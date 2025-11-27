import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';

export type Messages = {
  success: string;
  error: { title?: string; text: string };
  loading?: string;
};

export function redirectToUnits() {
  const router = useRouter();
  router.push({
    name: 'units'
  });
}

export function redirectToUnit({ unitId, domainId }: { unitId: string; domainId: string }) {
  const router = useRouter();
  if (!domainId || !unitId) return;
  router.push({
    name: 'unit-domains-domain',
    params: {
      unit: unitId,
      domain: domainId
    }
  });
}

type ApplyProfileParams = { profileId: string; unitId: string; domainId: string };

export function useApplyProfile() {
  const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
  const { mutateAsync: applyProfileToUnit, isLoading } = useMutation(domainQueryDefinitions.mutations.applyProfile);

  async function applyProfile({ profileId, unitId, domainId }: ApplyProfileParams, messages: Messages) {
    try {
      await applyProfileToUnit({ domainId, unitId, profileId });
      displaySuccessMessage(messages?.success);
      if (typeof unitId === 'string' && typeof domainId === 'string') {
        redirectToUnit({ unitId, domainId });
      }
    } catch (error) {
      console.error(error);
      displayErrorMessage({ text: messages.error.text });
    }
  }
  return { applyProfile, isLoading };
}
