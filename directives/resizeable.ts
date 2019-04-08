import Vue from "vue";
import { DirectiveOptions } from "vue/types/options";
import interact from "interactjs";

const directive: DirectiveOptions = {
  inserted: (el, binding, vnode) => {
    const right = !!binding.modifiers.right;
    const minWidth = binding.value;
    if (!vnode.componentInstance) return;
    const componentInstance = vnode.componentInstance!;

    interact(el)
      .resizable({
        edges: {
          left: right,
          right: !right
        },
        inertia: true
      })
      .on("resizemove", (event: any) => {
        const w = event.rect.width;
        componentInstance.$emit("resize", { width: w >= minWidth ? w : minWidth });
      });
  },
  unbind: (el, binding, vnode) => {}
};

export default directive;
