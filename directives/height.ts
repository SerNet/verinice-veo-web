import Vue from "vue";
import { DirectiveOptions } from "vue/types/options";
import ResizeObserver from "resize-observer-polyfill";

const directive: DirectiveOptions = {
  inserted: (el, binding, vnode) => {
    const callback = binding.value!;
    const ro = (el["_ro"] = new ResizeObserver((entries, observer) => {
      let h = 0;
      for (const entry of entries) {
        const { height } = entry.contentRect;
        h = Math.max(h, height);
      }
      callback(h);
    }));

    ro.observe(document.body);
  },
  unbind: (el, binding, vnode) => {
    if (el) {
      const ro: ResizeObserver = el["_ro"];
      if (ro) {
        ro.unobserve(document.body);
      }
    }
  }
};

export default directive;
