/** Used to make a vuetify stepper scroll to the current step smoothly.
 * Hint: Assign all stepper items to the `stepperItems` array using the `setStepperRef` function.
 */
export function useSideScroll(step: Ref<number>) {
  const stepperItems = ref<(HTMLElement | null)[]>([]);
  watch(step, (newStep: number) => {
    const index = newStep - 1;
    if (index < 0 || index >= stepperItems.value.length) return;
    const el = stepperItems.value?.[newStep - 1];
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });

  function setStepperRef(el: Element | ComponentPublicInstance | null, index: number) {
    if (el && '$el' in el) {
      stepperItems.value[index] = (el as any).$el;
    } else if (el instanceof HTMLElement) {
      stepperItems.value[index] = el;
    }
  }

  return {
    stepperItems,
    setStepperRef
  };
}
