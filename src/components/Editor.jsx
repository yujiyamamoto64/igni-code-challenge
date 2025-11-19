import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";

export default function Editor({ initialCode }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = monaco.editor.create(
        document.getElementById("editor-container"),
        {
          value: initialCode,
          language: "java",
          theme: "vs-dark",
          fontSize: 16,
        }
      );
    }
  }, []);

  return <div id="editor-container" className="h-full w-full" />;
}
