import { useEffect, useRef, useState } from "react";

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
];
const HIGHLIGHTS = ["#fff3a3", "#ffd6d3", "#ffe0b3", "#c8f2d0", "#cfe4ff", "#ead7fb"];

// Notes written before formatting existed are plain text; turn them into HTML.
export function toHtml(body: string) {
  if (/<(div|p|br|b|i|u|ul|ol|li|span|font|strong|em)[\s>/]/i.test(body)) return body;
  return body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

export function textOf(html: string) {
  const el = document.createElement("div");
  el.innerHTML = toHtml(html).replace(/<(br|\/div|\/p|\/li)>/gi, " $&");
  return (el.textContent ?? "").trim();
}

interface Props {
  noteId: number;
  html: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ noteId, html, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<"color" | "highlight" | null>(null);
  const [, force] = useState(0);

  // Load content only when switching notes, so typing doesn't reset the caret.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = toHtml(html);
    setMenu(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  useEffect(() => {
    const refresh = () => force((n) => n + 1);
    document.addEventListener("selectionchange", refresh);
    return () => document.removeEventListener("selectionchange", refresh);
  }, []);

  function run(cmd: string, value?: string) {
    ref.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, value);
    if (ref.current) onChange(ref.current.innerHTML);
    setMenu(null);
  }

  const active = (cmd: string) => {
    try {
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  };

  const btn = (label: React.ReactNode, cmd: string, title: string, value?: string) => (
    <button
      type="button"
      className={"tool" + (active(cmd) ? " on" : "")}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        run(cmd, value);
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="format-bar">
        {btn(<b>B</b>, "bold", "Bold")}
        {btn(<i>I</i>, "italic", "Italic")}
        {btn(<u>U</u>, "underline", "Underline")}
        {btn(<s>S</s>, "strikeThrough", "Strikethrough")}
        <span className="sep" />
        {btn("•", "insertUnorderedList", "Bullet list")}
        {btn("1.", "insertOrderedList", "Numbered list")}
        <span className="sep" />
        <div className="pop-wrap">
          <button
            type="button"
            className="tool"
            title="Text color"
            onMouseDown={(e) => {
              e.preventDefault();
              setMenu(menu === "color" ? null : "color");
            }}
          >
            <span className="color-a">A</span>
          </button>
          {menu === "color" && (
            <div className="popover">
              <button
                type="button"
                className="swatch none"
                title="Default color"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("removeFormat");
                }}
              >
                ✕
              </button>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="swatch"
                  style={{ background: c }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    run("foreColor", c);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="pop-wrap">
          <button
            type="button"
            className="tool"
            title="Highlight"
            onMouseDown={(e) => {
              e.preventDefault();
              setMenu(menu === "highlight" ? null : "highlight");
            }}
          >
            <span className="hl">ab</span>
          </button>
          {menu === "highlight" && (
            <div className="popover">
              {HIGHLIGHTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="swatch"
                  style={{ background: c }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    run("hiliteColor", c);
                  }}
                />
              ))}
              <button
                type="button"
                className="swatch none"
                title="No highlight"
                onMouseDown={(e) => {
                  e.preventDefault();
                  run("hiliteColor", "transparent");
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <span className="sep" />
        {btn("⇤", "removeFormat", "Clear formatting")}
      </div>
      <div
        ref={ref}
        className="body-input rich"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Start writing…"
        onInput={() => ref.current && onChange(ref.current.innerHTML)}
        onPaste={(e) => {
          e.preventDefault();
          document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
        }}
      />
    </>
  );
}
