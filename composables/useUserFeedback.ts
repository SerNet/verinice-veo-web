import defaultMessages from '~/locales/base/composables/user-feedback.json';

export type UserFeedbackMessages = Ref<{
  loading: string;
  success: string;
  error: { title: string; text?: string };
}>;

type UserFeedbackParams = {
  isLoading: Ref<boolean>;
  isSuccess: Ref<boolean>;
  isError: Ref<boolean>;
  hasSuccessMessage?: Ref<boolean>;
  hasErrorMessage?: Ref<boolean>;
  messages?: UserFeedbackMessages;
  callback?: () => void;
};

export function useUserFeedback({
  isLoading,
  isSuccess,
  isError,
  hasSuccessMessage,
  hasErrorMessage,
  messages,
  callback
}: UserFeedbackParams) {
  const { setLoading, clearLoading } = useGlobalLoadingState();
  const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

  const feedbackMessages = messages ?? useDefaultMessages();
  const _hasSuccessMessage = computed(() => hasSuccessMessage?.value ?? true);
  const _hasErrorMessage = computed(() => hasErrorMessage?.value ?? true);

  let loaderId: symbol | undefined;
  const stopWatcher = watch(isLoading, () => {
    if (isLoading.value) {
      loaderId = setLoading(feedbackMessages.value.loading);
      return;
    }

    if (_hasSuccessMessage.value && isSuccess.value) {
      displaySuccessMessage(feedbackMessages.value.success);
      callback?.();
    }

    if (_hasErrorMessage.value && isError.value) {
      displayErrorMessage({ title: feedbackMessages.value.error.title, text: feedbackMessages.value.error.text });
    }

    clearLoading(loaderId);
    loaderId = undefined;
  });

  onScopeDispose(() => {
    if (loaderId) clearLoading(loaderId);
    stopWatcher();
  });
}

function useDefaultMessages() {
  const { locale } = useI18n();

  return computed(() => ({
    loading: defaultMessages?.[locale.value]?.loading?.text ?? 'Loading...',
    success: defaultMessages?.[locale.value]?.success?.text ?? 'Success',
    error: {
      title: defaultMessages?.[locale.value]?.error?.title ?? 'Error',
      text: defaultMessages?.[locale.value]?.error?.text ?? 'An error occurred'
    }
  }));
}
