import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";

export default function Editor({ code, onChange }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const preventLoopRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) {
      return;
    }

    const editor = monaco.editor.create(containerRef.current, {
      value: code,
      language: "java",
      theme: "vs-dark",
      fontSize: 16,
      automaticLayout: true,
      minimap: { enabled: false },
    });

    editorRef.current = editor;

    const subscription = editor.onDidChangeModelContent(() => {
      if (preventLoopRef.current) {
        preventLoopRef.current = false;
        return;
      }
      onChange(editor.getValue());
    });

    return () => {
      subscription.dispose();
      editor.dispose();
      editorRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentValue = editor.getValue();
    if (currentValue !== code) {
      preventLoopRef.current = true;
      editor.setValue(code);
    }
  }, [code]);

  return <div ref={containerRef} className="h-full w-full" />;
}
