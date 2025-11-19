import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import { detectMissingImports } from "../editor/autoImports";

const MATH_METHODS = [
  { label: "abs", documentation: "Valor absoluto de um número." },
  { label: "max", documentation: "Retorna o maior entre dois valores." },
  { label: "min", documentation: "Retorna o menor entre dois valores." },
  { label: "pow", documentation: "Potência: base elevado ao expoente." },
  { label: "sqrt", documentation: "Raiz quadrada." },
  { label: "floor", documentation: "Maior inteiro menor ou igual ao valor." },
  { label: "ceil", documentation: "Menor inteiro maior ou igual ao valor." },
  { label: "round", documentation: "Arredonda para o inteiro mais próximo." },
  { label: "random", documentation: "Número pseudo-aleatório entre 0 e 1." },
];

export default function Editor({ code, onChange }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const preventLoopRef = useRef(false);
  const lastSelectionRef = useRef(null);

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

      const model = editor.getModel();
      if (model) {
        const missing = detectMissingImports(model.getValue());
        if (missing.length > 0) {
          insertImports(editor, missing);
          return;
        }
      }

      lastSelectionRef.current = editor.getSelection();
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
        const mathContext = getMathContext(model, position);
        if (mathContext) {
          return { suggestions: buildMathSuggestions(mathContext.range) };
        }

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: word.endColumn,
        };
        const suggestions = buildGeneralSuggestions(range);
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
      const currentSelection =
        lastSelectionRef.current || editor.getSelection();
      editor.setValue(code);
      if (currentSelection) {
        const model = editor.getModel();
        if (model) {
          const adjusted = adjustSelectionToModel(currentSelection, model);
          editor.setSelection(adjusted);
        }
      }
      editor.focus();
    }
  }, [code]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function getMathContext(model, position) {
  const lineContent = model.getLineContent(position.lineNumber);
  const textUntilPosition = lineContent.slice(0, position.column - 1);
  const match = textUntilPosition.match(/Math\s*\.\s*([A-Za-z0-9_]*)$/);
  if (!match) return null;

  const partial = match[1] || "";
  const startColumn = position.column - partial.length;
  return {
    range: {
      startLineNumber: position.lineNumber,
      startColumn,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    },
  };
}

function buildMathSuggestions(range) {
  return MATH_METHODS.map(({ label, documentation }) => ({
    label,
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `${label}($0)`,
    detail: `Math.${label}`,
    documentation,
    range,
  }));
}

function buildGeneralSuggestions(range) {
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
    keyword("Math", "java.lang.Math", "Funções matemáticas utilitárias."),
  ];
}

function insertImports(editor, imports) {
  const model = editor.getModel();
  if (!model || imports.length === 0) {
    return;
  }

  const insertLine = findImportInsertLine(model);
  const textToInsert = `${imports.join("\n")}\n\n`;
  editor.executeEdits("auto-imports", [
    {
      range: new monaco.Range(insertLine, 1, insertLine, 1),
      text: textToInsert,
      forceMoveMarkers: true,
    },
  ]);
}

function findImportInsertLine(model) {
  const lineCount = model.getLineCount();
  let lineNumber = 1;
  for (; lineNumber <= lineCount; lineNumber++) {
    const content = model.getLineContent(lineNumber).trim();
    if (content === "" || content.startsWith("import ")) {
      continue;
    }
    break;
  }
  return lineNumber;
}

function adjustSelectionToModel(selection, model) {
  const clampPosition = (position) => {
    const lineNumber = Math.min(
      Math.max(position.lineNumber, 1),
      model.getLineCount()
    );
    const lineMaxColumn = model.getLineMaxColumn(lineNumber);
    const column = Math.min(Math.max(position.column, 1), lineMaxColumn);
    return { lineNumber, column };
  };

  const start = clampPosition(selection.getStartPosition());
  const end = clampPosition(selection.getEndPosition());
  return new monaco.Selection(
    start.lineNumber,
    start.column,
    end.lineNumber,
    end.column
  );
}
