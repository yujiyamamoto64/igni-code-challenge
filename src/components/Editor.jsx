import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import { detectMissingImports } from "../editor/autoImports";

const MATH_METHODS = [
  { label: "abs", documentation: "Valor absoluto de um numero." },
  { label: "max", documentation: "Retorna o maior entre dois valores." },
  { label: "min", documentation: "Retorna o menor entre dois valores." },
  { label: "pow", documentation: "Potencia: base elevado ao expoente." },
  { label: "sqrt", documentation: "Raiz quadrada." },
  { label: "floor", documentation: "Maior inteiro menor ou igual ao valor." },
  { label: "ceil", documentation: "Menor inteiro maior ou igual ao valor." },
  { label: "round", documentation: "Arredonda para o inteiro mais proximo." },
  { label: "random", documentation: "Numero pseudo-aleatorio entre 0 e 1." },
];

const createSnippet = (label, insertText, detail, documentation, sortText) => ({
  label,
  kind: monaco.languages.CompletionItemKind.Snippet,
  insertText,
  insertTextRules:
    monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  detail,
  documentation,
  sortText,
});

const createKeyword = (label, detail, documentation, sortText) => ({
  label,
  kind: monaco.languages.CompletionItemKind.Class,
  insertText: label,
  detail,
  documentation,
  sortText,
});

const SNIPPET_SUGGESTIONS = [
  createSnippet(
    "sout",
    "System.out.println(${1:valor});",
    "System.out.println",
    "Imprime o valor informado no console.",
    "1_sout"
  ),
  createSnippet(
    "fori",
    "for (int ${1:i} = 0; ${1:i} < ${2:limite}; ${1:i}++) {\n\t$0\n}",
    "Loop for",
    "Estrutura comum de iteracao.",
    "1_fori"
  ),
  createSnippet(
    "foreach",
    "for (${1:Tipo} ${2:item} : ${3:colecao}) {\n\t$0\n}",
    "For each",
    "Iteracao sobre colecoes.",
    "1_foreach"
  ),
  createSnippet(
    "if",
    "if (${1:condicao}) {\n\t$0\n}",
    "Bloco if",
    "Estrutura condicional basica.",
    "1_if"
  ),
  createSnippet(
    "main",
    "public static void main(String[] args) {\n\t$0\n}",
    "Metodo main",
    "Ponto de entrada tradicional do Java.",
    "1_main"
  ),
  createSnippet(
    "trycatch",
    "try {\n\t$0\n} catch (${1:Exception} ${2:e}) {\n\t${3:// trate a excecao}\n}",
    "Try/Catch",
    "Estrutura de tratamento de excecoes.",
    "1_trycatch"
  ),
  createSnippet(
    "list",
    "List<${1:Tipo}> ${2:nome} = new ArrayList<>();",
    "List + ArrayList",
    "Declara uma lista dinamica.",
    "2_list"
  ),
  createSnippet(
    "map",
    "Map<${1:Chave}, ${2:Valor}> ${3:nome} = new HashMap<>();",
    "Map + HashMap",
    "Declara um mapa chave/valor.",
    "2_map"
  ),
  createSnippet(
    "pq",
    "PriorityQueue<${1:Tipo}> ${2:pq} = new PriorityQueue<>(${3:Comparator.naturalOrder()});",
    "PriorityQueue",
    "Heap minima (passe Comparator.reverseOrder() para max-heap).",
    "2_pq"
  ),
  createSnippet(
    "deque",
    "Deque<${1:Tipo}> ${2:deque} = new ArrayDeque<>();",
    "Deque + ArrayDeque",
    "Fila dupla rapida (BFS 0-1, sliding window).",
    "2_deque"
  ),
  createSnippet(
    "fastio",
    "BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\nStringTokenizer st = new StringTokenizer(br.readLine());\nint ${1:n} = Integer.parseInt(st.nextToken());\n",
    "Entrada rapida",
    "Template de IO rapido (BufferedReader + StringTokenizer).",
    "2_fastio"
  ),
  createSnippet(
    "sb",
    "StringBuilder ${1:nome} = new StringBuilder();",
    "StringBuilder",
    "Acumulador eficiente de strings.",
    "2_sb"
  ),
];

const LIBRARY_KEYWORDS = [
  createKeyword(
    "ArrayList",
    "java.util.ArrayList",
    "Lista dinamica baseada em array.",
    "3_ArrayList"
  ),
  createKeyword(
    "LinkedList",
    "java.util.LinkedList",
    "Lista duplamente encadeada (List e Deque).",
    "3_LinkedList"
  ),
  createKeyword("List", "java.util.List", "Interface de listas ordenadas."),
  createKeyword("Map", "java.util.Map", "Interface chave/valor."),
  createKeyword(
    "HashMap",
    "java.util.HashMap",
    "Mapa hash O(1) esperado.",
    "3_HashMap"
  ),
  createKeyword(
    "LinkedHashMap",
    "java.util.LinkedHashMap",
    "Mapa que preserva ordem de insercao."
  ),
  createKeyword(
    "TreeMap",
    "java.util.TreeMap",
    "Mapa ordenado (O(log n) para busca)."
  ),
  createKeyword("Set", "java.util.Set", "Interface de conjuntos."),
  createKeyword(
    "HashSet",
    "java.util.HashSet",
    "Conjunto baseado em hash."
  ),
  createKeyword(
    "TreeSet",
    "java.util.TreeSet",
    "Conjunto ordenado (O(log n))."
  ),
  createKeyword(
    "PriorityQueue",
    "java.util.PriorityQueue",
    "Heap minima por padrao; muito usada em Dijkstra/Kruskal."
  ),
  createKeyword("Deque", "java.util.Deque", "Fila dupla (push/pop nas pontas)."),
  createKeyword(
    "ArrayDeque",
    "java.util.ArrayDeque",
    "Deque rapido; bom substituto para Stack/Queue."
  ),
  createKeyword("Queue", "java.util.Queue", "Interface de fila."),
  createKeyword("Stack", "java.util.Stack", "Pilha classica."),
  createKeyword(
    "Collections",
    "java.util.Collections",
    "Utilitarios sort, reverse, binarySearch."
  ),
  createKeyword(
    "Arrays",
    "java.util.Arrays",
    "Utilitarios para arrays (sort/fill/binarySearch)."
  ),
  createKeyword(
    "Optional",
    "java.util.Optional",
    "Wrapper para representar valores opcionais."
  ),
  createKeyword("BitSet", "java.util.BitSet", "Bitmap/bitmask eficiente."),
  createKeyword(
    "Stream",
    "java.util.stream.Stream",
    "Pipeline de streams (cuidado com performance)."
  ),
  createKeyword(
    "Collectors",
    "java.util.stream.Collectors",
    "Coletores para pipelines de stream."
  ),
  createKeyword(
    "Pattern",
    "java.util.regex.Pattern",
    "Compila expressoes regulares."
  ),
  createKeyword(
    "Matcher",
    "java.util.regex.Matcher",
    "Executa buscas usando um Pattern."
  ),
  createKeyword(
    "BufferedReader",
    "java.io.BufferedReader",
    "Leitura rapida linha a linha."
  ),
  createKeyword(
    "InputStreamReader",
    "java.io.InputStreamReader",
    "Reader para System.in."
  ),
  createKeyword(
    "PrintWriter",
    "java.io.PrintWriter",
    "Saida rapida com buffer e autoFlush opcional."
  ),
  createKeyword(
    "StringTokenizer",
    "java.util.StringTokenizer",
    "Parse simples separado por espaco."
  ),
  createKeyword(
    "Scanner",
    "java.util.Scanner",
    "Leitura simples (mais lenta que BufferedReader)."
  ),
  createKeyword(
    "BigInteger",
    "java.math.BigInteger",
    "Inteiros arbitrariamente grandes."
  ),
  createKeyword(
    "BigDecimal",
    "java.math.BigDecimal",
    "Decimais de alta precisao."
  ),
  createKeyword(
    "LocalDate",
    "java.time.LocalDate",
    "Datas sem componente de horario."
  ),
  createKeyword(
    "LocalTime",
    "java.time.LocalTime",
    "Horario sem componente de data."
  ),
  createKeyword(
    "LocalDateTime",
    "java.time.LocalDateTime",
    "Data e hora sem fuso."
  ),
  createKeyword(
    "Duration",
    "java.time.Duration",
    "Intervalos em segundos/nanos."
  ),
  createKeyword(
    "Period",
    "java.time.Period",
    "Intervalos em dias/meses/anos."
  ),
  createKeyword(
    "StringBuilder",
    "java.lang.StringBuilder",
    "Construtor mutavel de strings."
  ),
  createKeyword("Math", "java.lang.Math", "Funcoes matematicas utilitarias."),
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
  const withRange = (entry) => ({ ...entry, range });
  return [
    ...SNIPPET_SUGGESTIONS.map(withRange),
    ...LIBRARY_KEYWORDS.map(withRange),
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
