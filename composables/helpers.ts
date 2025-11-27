export function waitForData(data: Ref<any>) {
  return new Promise<void>((resolve) => {
    if (data.value) {
      resolve();
      return;
    }

    const stopWatcher = watch(
      data,
      (newValue) => {
        if (newValue) {
          stopWatcher();
          resolve();
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
