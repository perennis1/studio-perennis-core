// src/components/admin/RichTextEditor.tsx
"use client";
import { NodeSelection } from "prosemirror-state";

import { useEffect ,useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ExtendedImage from "./extensions/ExtendedImage";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

// NEW:
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";


import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";


import { Mark, Node, mergeAttributes } from "@tiptap/core";

type Props = {
  content: string;
  onChange: (html: string) => void;
};

/* ========== FONT SIZE (A- / A / A+) ========== */

const FontSize = Mark.create({
  name: "fontSize",

  addAttributes() {
    return {
      size: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ style: "font-size" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { size, style, ...rest } = HTMLAttributes as {
      size?: string | null;
      style?: string;
    };

    if (!size) {
      return ["span", mergeAttributes(rest, style ? { style } : {}), 0];
    }

    const sizeStyle = `font-size: ${size};`;
    const combined = [style, sizeStyle].filter(Boolean).join(" ");

    return ["span", mergeAttributes(rest, { style: combined }), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (size?: string | null) =>
        ({ commands }) => {
          if (!size) return commands.unsetMark(this.name);
          return commands.setMark(this.name, { size });
        },
      unsetFontSize:
        () =>
        ({ commands }) => commands.unsetMark(this.name),
    };
  },
});

/* ========== FONT FAMILY (serious + comic) ========== */

type FontKey =
  | "default"
  | "serif"
  | "mono"
  | "merriweather"
  | "playfair"
  | "baskerville"
  | "comic"
  | "hand";

const fontMap: Record<FontKey, string> = {
  default: "",
  serif: "ui-serif, Georgia, serif",
  mono: "ui-monospace, SFMono-Regular, monospace",

  merriweather: "'Merriweather', serif",
  playfair: "'Playfair Display', serif",
  baskerville: "'Libre Baskerville', serif",

  comic: "'Comic Neue', cursive",
  hand: "'Patrick Hand', cursive",
};

const FontFamily = Mark.create({
  name: "fontFamily",

  addAttributes() {
    return {
      family: {
        default: null as FontKey | null,
        parseHTML: (element: HTMLElement) => {
          const style = element.style.fontFamily?.toLowerCase() || "";

          for (const key in fontMap) {
            const sample = fontMap[key as FontKey]
              .split(",")[0]
              .toLowerCase();
            if (sample && style.includes(sample)) {
              return key as FontKey;
            }
          }
          return null;
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { family, style, ...rest } = HTMLAttributes as {
      family?: FontKey | null;
      style?: string;
    };

    const fontStyle = family ? `font-family: ${fontMap[family]};` : "";
    const combined = [style, fontStyle].filter(Boolean).join(" ");

    return [
      "span",
      mergeAttributes(rest, combined ? { style: combined } : {}),
      0,
    ];
  },

 addCommands() {
  return {
    setFontFamily:
      (family: string | null) =>  // ✅ string | null
      ({ commands }) => {
        if (!family || family === "default") {
          return commands.unsetMark(this.name);
        }
        return commands.setMark(this.name, { family: family as FontKey });
      },
    unsetFontFamily:
      () =>
      ({ commands }) => commands.unsetMark(this.name),
  };
},

});

/* ========== TEXT CASE (aa / Aa / AA) ========== */

type CaseVariant = "lowercase" | "uppercase" | "capitalize";

const TextCase = Mark.create({
  name: "textCase",

  addAttributes() {
    return {
      variant: {
        default: null as CaseVariant | null,
        parseHTML: (element: HTMLElement) => {
          const style = element.style.textTransform?.toLowerCase() || "";
          if (style.includes("uppercase")) return "uppercase";
          if (style.includes("lowercase")) return "lowercase";
          if (style.includes("capitalize")) return "capitalize";
          return null;
        },
      },
    };
  },

  parseHTML() {
    return [{ style: "text-transform" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { variant, style, ...rest } = HTMLAttributes as {
      variant?: CaseVariant | null;
      style?: string;
    };

    if (!variant) {
      return ["span", mergeAttributes(rest, style ? { style } : {}), 0];
    }

    const caseStyle = `text-transform: ${variant};`;
    const combined = [style, caseStyle].filter(Boolean).join(" ");

    return ["span", mergeAttributes(rest, { style: combined }), 0];
  },

addCommands() {
  return {
    setTextCase:
      (variant: string | null) =>
      ({ commands }: { commands: any }) => {
        if (!variant) return commands.unsetMark(this.name);
        return commands.setMark(this.name, { variant: variant as CaseVariant });
      },
    unsetTextCase:
      () =>
      ({ commands }: { commands: any }) => commands.unsetMark(this.name),  // ✅ Fixed
  } as any;
},



});

/* ========== LETTER SPACING ========== */

const LetterSpacing = Mark.create({
  name: "letterSpacing",

  addAttributes() {
    return {
      spacing: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ style: "letter-spacing" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { spacing, style, ...rest } = HTMLAttributes as {
      spacing?: string | null;
      style?: string;
    };

    if (!spacing) {
      return ["span", mergeAttributes(rest, style ? { style } : {}), 0];
    }

    const ls = `letter-spacing: ${spacing};`;
    const combined = [style, ls].filter(Boolean).join(" ");

    return ["span", mergeAttributes(rest, { style: combined }), 0];
  },

addCommands() {
  return {
    setLetterSpacing:
      (spacing?: string | null) =>
      ({ commands }: { commands: any }) => {
        if (!spacing) return commands.unsetMark(this.name);
        return commands.setMark(this.name, { spacing });
      },
    unsetLetterSpacing:
      () =>
      ({ commands }: { commands: any }) => commands.unsetMark(this.name),
  } as any;  // ✅ Add this line
},

});

/* ========== WORD SPACING ========== */

const WordSpacing = Mark.create({
  name: "wordSpacing",

  addAttributes() {
    return {
      spacing: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ style: "word-spacing" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { spacing, style, ...rest } = HTMLAttributes as {
      spacing?: string | null;
      style?: string;
    };

    if (!spacing) {
      return ["span", mergeAttributes(rest, style ? { style } : {}), 0];
    }

    const ws = `word-spacing: ${spacing};`;
    const combined = [style, ws].filter(Boolean).join(" ");

    return ["span", mergeAttributes(rest, { style: combined }), 0];
  },

  addCommands() {
  return {
    setWordSpacing:
      (spacing?: string | null) =>
      ({ commands }: { commands: any }) => {
        if (!spacing) return commands.unsetMark(this.name);
        return commands.setMark(this.name, { spacing });
      },
    unsetWordSpacing:
      () =>
      ({ commands }: { commands: any }) => commands.unsetMark(this.name),
  } as any;  // ✅ Add this
},

});

/* ========== SIDE NOTE (margin note) ========== */

const SideNote = Node.create({
  name: "sideNote",

  group: "block",
  content: "paragraph+",
  defining: true,

  parseHTML() {
    return [{ tag: 'aside[data-type="side-note"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, {
        "data-type": "side-note",
        class: "side-note",
      }),
      0,
    ];
  },

 addCommands() {
  return {
    toggleSideNote:
      () =>
      ({ commands }: { commands: any }) => {
        return commands.toggleWrap(this.name);
      },
  } as any;  // ✅ REQUIRED
},

});

/* ========== CALLOUT BLOCK (pull quote / note box) ========== */

const Callout = Node.create({
  name: "callout",

  group: "block",
  content: "paragraph+",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "callout",
        class: "callout-block",
      }),
      0,
    ];
  },

  addCommands() {
  return {
    toggleCallout:
      () =>
      ({ commands }: { commands: any }) => {  // ✅ Explicit typing
        return commands.toggleWrap(this.name);
      },
  } as any;  // ✅ Bypass RawCommands
},

});

/* ========== EDITOR COMPONENT ========== */

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    

    extensions: [
      StarterKit.configure({
        link: false,
        codeBlock: {
          HTMLAttributes: { class: "code-block" },
        },
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      // NEW: text color support
    TextStyle.configure(),
    Color.configure({
      types: ["textStyle"],
    }),
        ExtendedImage.configure({
    inline: false,
    allowBase64: true,
  }),

      Highlight,
      Placeholder.configure({
        placeholder: "Write your reflection…",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "rich-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,

      FontSize,
      FontFamily,
      TextCase,
      LetterSpacing,
      WordSpacing,
      SideNote,
      Callout,
    ],
    content: content || "",
    editorProps: {
     attributes: {
    class:
      "min-h-[260px] w-full rounded-xl bg-[#020617] border border-slate-700 px-4 py-3 text-sm focus:outline-none rich-editor-body",
  },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    
  });

const [imageSelected, setImageSelected] = useState(false);

useEffect(() => {
  if (!editor) return;

  const update = () => {
    const { selection } = editor.state;

    if (selection instanceof NodeSelection &&
        selection.node.type.name === "image") {
      setImageSelected(true);
      return;
    }

    const { $from } = selection;
    const node = $from.nodeAfter || $from.nodeBefore;
    setImageSelected(!!node && node.type.name === "image");
  };

  // run once
  update();

  editor.on("selectionUpdate", update);

  return () => {
    editor.off("selectionUpdate", update);
  };
}, [editor]);




const [currentColor, setCurrentColor] = useState("#e5e7eb"); // slate-200-ish

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content && content !== current) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const isImageSelected = () => {
  if (!editor) return false;
  const { selection } = editor.state;
    if (selection instanceof NodeSelection) {
    return selection.node.type.name === "image";
  }

  // also allow the cursor to be inside the image node (fallback)
  const { $from } = selection;
  const node = $from.nodeAfter || $from.nodeBefore;
  return !!node && node.type.name === "image";
  
};


  const base =
    "px-2 py-1 rounded text-xs border border-slate-700/70 hover:border-slate-400/80 hover:bg-slate-800/80 transition";
  const active =
    "bg-slate-200 text-slate-900 border-slate-300 hover:bg-slate-100";

  const btn = (isActive: boolean) =>
    `${base} ${isActive ? active : "text-slate-200 bg-slate-900/60"}`;

  const e = editor as any;

  
const insertImageFromFile = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!data.url) {
        alert("Upload failed.");
        return;
      }

      editor
        .chain()
        .focus()
        .setImage({ src: data.url, alt: file.name })
        .run();
    } catch (err) {
      console.error(err);
      alert("Image upload failed.");
    }
  };

  input.click();
};

const replaceImageFromFile = async () => {
  if (!isImageSelected()) {
    // fall back to insert
    return insertImageFromFile();
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!data.url) {
        alert("Upload failed.");
        return;
      }

      editor
        .chain()
        .focus()
        .updateAttributes("image", { src: data.url, alt: file.name })
        .run();
    } catch (err) {
      console.error(err);
      alert("Image replace failed.");
    }
  };

  input.click();
};

const deleteSelectedImage = () => {
  if (!isImageSelected()) return;
  const { state, dispatch } = editor.view;
  const tr = state.tr.deleteSelection();
  dispatch(tr);
};

  return (
    <div className="space-y-2 rich-editor-container">
      {/* TOOLBAR */}
      <div className="rich-editor-toolbar sticky top-32 z-30 flex flex-wrap gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2">
        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={btn(editor.isActive("heading", { level: 1 }))}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={btn(editor.isActive("heading", { level: 2 }))}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={btn(editor.isActive("heading", { level: 3 }))}
          >
            H3
          </button>
        </div>

        {/* Basic text styles */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btn(editor.isActive("bold"))}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btn(editor.isActive("italic"))}
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btn(editor.isActive("strike"))}
          >
            Strike
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={btn(editor.isActive("highlight"))}
          >
            Highlight
          </button>

        </div>
 {/* NEW: text color controls */}
  <div className="ml-2 flex items-center gap-1">
    <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
      Color
    </span>

    {/* Color picker */}
    <input
      type="color"
      value={currentColor}
      onChange={(e) => {
        const value = e.target.value;
        setCurrentColor(value);
        editor.chain().focus().setColor(value).run();
      }}
      className="h-6 w-6 cursor-pointer rounded border border-slate-600 bg-slate-900 p-0"
    />

    {/* Quick swatches */}
    <button
      type="button"
      onClick={() => {
        const value = "#e5e7eb"; // light
        setCurrentColor(value);
        editor.chain().focus().setColor(value).run();
      }}
      className="h-4 w-4 rounded-full border border-slate-500"
      style={{ backgroundColor: "#e5e7eb" }}
      title="Light"
    />

    <button
      type="button"
      onClick={() => {
        const value = "#f97316"; // orange-500
        setCurrentColor(value);
        editor.chain().focus().setColor(value).run();
      }}
      className="h-4 w-4 rounded-full border border-slate-500"
      style={{ backgroundColor: "#f97316" }}
      title="Accent"
    />

    <button
      type="button"
      onClick={() => {
        const value = "#22c55e"; // green-500
        setCurrentColor(value);
        editor.chain().focus().setColor(value).run();
      }}
      className="h-4 w-4 rounded-full border border-slate-500"
      style={{ backgroundColor: "#22c55e" }}
      title="Note"
    />

    {/* Clear color */}
    <button
      type="button"
      onClick={() => {
        editor.chain().focus().unsetColor().run();
      }}
      className={base + " text-[10px] px-2"}
    >
      Clear
    </button>
  </div>
        {/* TEXT SIZE (A- / A / A+) */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => e.chain().focus().setFontSize("0.9rem").run()}
            className={btn(editor.isActive("fontSize", { size: "0.9rem" }))}
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().unsetFontSize().run()}
            className={btn(!editor.isActive("fontSize"))}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().setFontSize("1.2rem").run()}
            className={btn(editor.isActive("fontSize", { size: "1.2rem" }))}
          >
            A+
          </button>
        </div>

        {/* TEXT CASE (aa / Aa / AA) */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => e.chain().focus().setTextCase("lowercase").run()}
            className={btn(
              editor.isActive("textCase", { variant: "lowercase" })
            )}
          >
            aa
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().setTextCase("capitalize").run()}
            className={btn(
              editor.isActive("textCase", { variant: "capitalize" })
            )}
          >
            Aa
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().setTextCase("uppercase").run()}
            className={btn(
              editor.isActive("textCase", { variant: "uppercase" })
            )}
          >
            AA
          </button>
        </div>

        {/* FONT FAMILY */}
        <div className="flex flex-wrap items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => e.chain().focus().unsetFontFamily().run()}
            className={btn(!editor.isActive("fontFamily"))}
          >
            Default
          </button>
          <button
            type="button"
            onClick={() =>
              e.chain().focus().setFontFamily("merriweather").run()
            }
            className={btn(
              editor.isActive("fontFamily", { family: "merriweather" })
            )}
          >
            Merriweather
          </button>
          <button
            type="button"
            onClick={() =>
              e.chain().focus().setFontFamily("playfair").run()
            }
            className={btn(
              editor.isActive("fontFamily", { family: "playfair" })
            )}
          >
            Playfair
          </button>
          <button
            type="button"
            onClick={() =>
              e.chain().focus().setFontFamily("baskerville").run()
            }
            className={btn(
              editor.isActive("fontFamily", { family: "baskerville" })
            )}
          >
            Baskerville
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().setFontFamily("comic").run()}
            className={btn(
              editor.isActive("fontFamily", { family: "comic" })
            )}
          >
            Comic
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().setFontFamily("hand").run()}
            className={btn(editor.isActive("fontFamily", { family: "hand" }))}
          >
            Hand
          </button>
        </div>

        {/* BLOCKS: quote + code */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={btn(editor.isActive("blockquote"))}
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={btn(editor.isActive("code"))}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={btn(editor.isActive("codeBlock"))}
          >
            Code block
          </button>
        </div>

        {/* LISTS */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btn(editor.isActive("bulletList"))}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btn(editor.isActive("orderedList"))}
          >
            1. List
          </button>
        </div>

        {/* ALIGNMENT */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={btn(editor.isActive({ textAlign: "left" }))}
          >
            L
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={btn(editor.isActive({ textAlign: "center" }))}
          >
            C
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={btn(editor.isActive({ textAlign: "right" }))}
          >
            R
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().setTextAlign("justify").run()
            }
            className={btn(editor.isActive({ textAlign: "justify" }))}
          >
            J
          </button>
        </div>

        {/* LETTER SPACING */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => e.chain().focus().setLetterSpacing("0.05em").run()}
            className={btn(
              editor.isActive("letterSpacing", { spacing: "0.05em" })
            )}
          >
            LS+
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().unsetLetterSpacing().run()}
            className={btn(!editor.isActive("letterSpacing"))}
          >
            LS
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().setLetterSpacing("-0.02em").run()}
            className={btn(
              editor.isActive("letterSpacing", { spacing: "-0.02em" })
            )}
          >
            LS-
          </button>
        </div>

        {/* WORD SPACING */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => e.chain().focus().setWordSpacing("0.1em").run()}
            className={btn(
              editor.isActive("wordSpacing", { spacing: "0.1em" })
            )}
          >
            WS+
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().unsetWordSpacing().run()}
            className={btn(!editor.isActive("wordSpacing"))}
          >
            WS
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().setWordSpacing("-0.05em").run()}
            className={btn(
              editor.isActive("wordSpacing", { spacing: "-0.05em" })
            )}
          >
            WS-
          </button>
        </div>

        {/* SIDE NOTE + CALLOUT */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() => e.chain().focus().toggleSideNote().run()}
            className={btn(editor.isActive("sideNote"))}
          >
            Note
          </button>
          <button
            type="button"
            onClick={() => e.chain().focus().toggleCallout().run()}
            className={btn(editor.isActive("callout"))}
          >
            Callout
          </button>
        </div>

        {/* TABLE */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className={base + " text-slate-200 bg-slate-900/60"}
          >
            Tbl
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className={base + " text-slate-200 bg-slate-900/60"}
          >
            Row+
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className={base + " text-slate-200 bg-slate-900/60"}
          >
            Col+
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className={base + " text-red-300 bg-slate-900/60"}
          >
            DelTbl
          </button>
        </div>

        {/* IMAGE */}
        <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
 <button
  type="button"
  onClick={insertImageFromFile}
  className={base + " text-slate-200 bg-slate-900/60"}
>
  Insert image
</button>

<button
  type="button"
  onClick={replaceImageFromFile}
  disabled={!imageSelected}
  className={
    base +
    " text-slate-200 bg-slate-900/60 disabled:opacity-40 disabled:cursor-not-allowed"
  }
>
  Replace
</button>

<button
  type="button"
  onClick={deleteSelectedImage}
  disabled={!imageSelected}
  className={
    base +
    " text-red-200 bg-red-900/40 border-red-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
  }
>
  Delete
</button>

</div>

      </div>

      {/* EDITOR BODY */}
      <div className="rich-editor-body mt-2"> <EditorContent editor={editor} />
      </div>
     
    </div>
  );
}



