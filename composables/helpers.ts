export function waitForData<T>(data: Ref<T>, timeout = 20000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let isSettled = false;
    let timer: ReturnType<typeof setTimeout> = undefined;
    let stopWatcher: () => void = undefined;

    const handleResolve = (reason: 'data-loaded' | 'timeout') => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      stopWatcher?.();

      if (reason === 'timeout') {
        reject(new Error(`Data loading timed out after ${timeout}ms`));
      } else {
        resolve();
      }
    };

    if (data.value) {
      handleResolve('data-loaded');
      return;
    }

    stopWatcher = watch(
      data,
      (newValue) => {
        if (newValue) {
          handleResolve('data-loaded');
        }
      },
      { immediate: true }
    );

    timer = setTimeout(() => {
      handleResolve('timeout');
    }, timeout);
  });
}

export function waitForBooleanToUpdate(bool: Ref<boolean>, expectedValue?: boolean) {
  return new Promise<void>((resolve) => {
    const stopWatcher = watch(
      bool,
      (newValue) => {
        if (expectedValue) {
          if (newValue === expectedValue) {
            stopWatcher();
            resolve();
            return;
          }
        }
        if (newValue) {
          stopWatcher();
          resolve();
          return;
        }
      },
      { immediate: true }
    );

    setTimeout(() => {
      stopWatcher();
      resolve();
    }, 20000);
  });
}
