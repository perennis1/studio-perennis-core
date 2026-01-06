// src/components/admin/extensions/ExtendedImage.ts
import Image from "@tiptap/extension-image";

const ExtendedImage = Image.extend({
  // make sure the node can be selected as a NodeSelection
  selectable: true,
  draggable: true,

  addNodeView() {
  return ({ node, editor, getPos }: { node: any; editor: any; getPos: () => number }) => {  // ✅ Explicit types

      const dom = document.createElement("span");
      const img = document.createElement("img");

      Object.entries(node.attrs || {}).forEach(([key, value]) => {
        if (value != null) img.setAttribute(key, String(value));
      });

      dom.appendChild(img);

      dom.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const pos = typeof getPos === "function" ? getPos() : null;
        if (pos == null) return;

        // force a NodeSelection at this node’s position
        editor.chain().focus().setNodeSelection(pos).run();
      });
return {
  dom,
  update(updatedNode: any) {
    if (updatedNode.type.name !== node.type.name) return false;
    Object.entries(updatedNode.attrs || {}).forEach(([key, value]) => {
      if (value != null) img.setAttribute(key, String(value));
    });
    return true;
  },
};

     
    };
  },
});

export default ExtendedImage;
