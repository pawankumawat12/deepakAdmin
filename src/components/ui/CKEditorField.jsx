import { useEffect, useRef, useState } from "react";

const CKEDITOR_SRC = "https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js";

function loadEditorScript() {
  if (window.CKEDITOR) return Promise.resolve(window.CKEDITOR);

  const existingScript = document.querySelector(`script[src="${CKEDITOR_SRC}"]`);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.CKEDITOR), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CKEDITOR_SRC;
    script.async = true;
    script.onload = () => resolve(window.CKEDITOR);
    script.onerror = () => reject(new Error("CKEditor could not be loaded"));
    document.head.appendChild(script);
  });
}

export default function CKEditorField({ value, onChange, label = "Email body" }) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [error, setError] = useState("");

  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;

    loadEditorScript()
      .then((CKEDITOR) => {
        if (cancelled || !textareaRef.current || editorRef.current) return;
        const editor = CKEDITOR.replace(textareaRef.current, {
          height: 360,
          removePlugins: "exportpdf,uploadimage,uploadwidget,notificationaggregator",
        
  toolbar: [
    ["Source"],
    ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord"],
    ["Undo", "Redo"],
    ["Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript"],
    ["RemoveFormat"],
    ["NumberedList", "BulletedList", "Outdent", "Indent"],
    ["JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock"],
    ["Link", "Unlink", "Anchor"],
    ["Blockquote"],
    ["Table"],
    ["HorizontalRule", "SpecialChar"],
    ["Format", "Styles"],
  ],
        });
        editorRef.current = editor;
        editor.on("instanceReady", () => editor.setData(value || ""));
        editor.on("change", () => onChangeRef.current(editor.getData()));
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      });

    return () => {
      cancelled = true;
      if (editorRef.current) {
        editorRef.current.destroy(true);
        editorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.status === "ready" && editor.getData() !== (value || "")) {
      editor.setData(value || "");
    }
  }, [value]);

  return (
    <div className="ckeditor-field full">
      <label htmlFor="email-template-body">{label}</label>
      <textarea id="email-template-body" ref={textareaRef} defaultValue={value || ""} />
      {error && <small className="error">{error}. Check your network connection and reload.</small>}
    </div>
  );
}
