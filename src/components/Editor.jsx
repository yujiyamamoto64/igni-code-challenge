import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";

export default function Editor({
  code,
  onChange,
  imports = [],
  harnessDescription,
}) {
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
    const provider = monaco.languages.registerCompletionItemProvider("java", {
      triggerCharacters: [".", "("],
      provideCompletionItems(model, position) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: word.endColumn,
        };
        const suggestions = buildCompletionSuggestions(range);
        return { suggestions };
      },
    });

    return () => provider.dispose();
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentValue = editor.getValue();
    if (currentValue !== code) {
      preventLoopRef.current = true;
      editor.setValue(code);
    }
  }, [code]);

  return (
    <div className="flex flex-col h-full">
      {imports.length > 0 && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3">
          <p className="text-xs uppercase text-zinc-500 tracking-wide">
            Imports automáticos
          </p>
          <pre className="mt-1 text-sm text-zinc-200 font-mono">
            {imports.join("\n")}
          </pre>
          {harnessDescription && (
            <p className="mt-2 text-xs text-zinc-400">{harnessDescription}</p>
          )}
        </div>
      )}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}

function buildCompletionSuggestions(range) {
  const snippet = (label, insertText, detail, documentation) => ({
    label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText,
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail,
    documentation,
    range,
  });

  const keyword = (label, detail, documentation) => ({
    label,
    kind: monaco.languages.CompletionItemKind.Class,
    insertText: label,
    detail,
    documentation,
    range,
  });

  return [
    snippet(
      "sout",
      'System.out.println(${1:valor});',
      "System.out.println",
      "Imprime o valor informado no console."
    ),
    snippet(
      "fori",
      "for (int ${1:i} = 0; ${1:i} < ${2:limite}; ${1:i}++) {\n\t$0\n}",
      "Loop for",
      "Estrutura comum de iteração."
    ),
    snippet(
      "foreach",
      "for (${1:Tipo} ${2:item} : ${3:colecao}) {\n\t$0\n}",
      "For each",
      "Iteração sobre coleções."
    ),
    snippet(
      "if",
      "if (${1:condicao}) {\n\t$0\n}",
      "Bloco if",
      "Estrutura condicional básica."
    ),
    snippet(
      "main",
      "public static void main(String[] args) {\n\t$0\n}",
      "Método main",
      "Ponto de entrada tradicional do Java."
    ),
    snippet(
      "trycatch",
      "try {\n\t$0\n} catch (${1:Exception} ${2:e}) {\n\t${3:// trate a exceção}\n}",
      "Try/Catch",
      "Estrutura de tratamento de exceções."
    ),
    snippet(
      "list",
      "List<${1:Tipo}> ${2:nome} = new ArrayList<>();",
      "List + ArrayList",
      "Declara uma lista dinâmica."
    ),
    snippet(
      "map",
      "Map<${1:Chave}, ${2:Valor}> ${3:nome} = new HashMap<>();",
      "Map + HashMap",
      "Declara um mapa chave/valor."
    ),
    snippet(
      "sb",
      "StringBuilder ${1:nome} = new StringBuilder();",
      "StringBuilder",
      "Acumulador eficiente de strings."
    ),
    keyword(
      "ArrayList",
      "java.util.ArrayList",
      "Estrutura de lista dinâmica."
    ),
    keyword("List", "java.util.List", "Interface de listas ordenadas."),
    keyword(
      "HashMap",
      "java.util.HashMap",
      "Implementação de mapa baseada em tabela hash."
    ),
    keyword("Map", "java.util.Map", "Interface chave/valor."),
    keyword(
      "Optional",
      "java.util.Optional",
      "Wrapper para representar valores opcionais."
    ),
    keyword(
      "StringBuilder",
      "java.lang.StringBuilder",
      "Classe para manipular strings de forma eficiente."
    ),
  ];
}
