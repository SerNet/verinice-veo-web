import Vue from "vue";
import { DirectiveOptions } from "vue/types/options";
import ResizeObserver from "resize-observer-polyfill";

type HTMLElementWithObserver = HTMLElement & { _ro?: ResizeObserver };

const directive: DirectiveOptions = {
  inserted: (el: HTMLElementWithObserver, binding, vnode) => {
    const callback = binding.value!;
    const ro = (el._ro = new ResizeObserver((entries, observer) => {
      let h = 0;
      for (const entry of entries) {
        const { height } = entry.contentRect;
        h = Math.max(h, height);
      }
      callback(h);
    }));

    ro.observe(document.body);
  },
  unbind: (el: HTMLElementWithObserver, binding, vnode) => {
    if (el) {
      const ro = el._ro;
      if (ro) {
        ro.unobserve(document.body);
      }
    }
  }
};

export default directive;
