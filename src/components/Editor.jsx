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
  const fontSizeRef = useRef(16);

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
      wordBasedSuggestions: false,
    });
    fontSizeRef.current = editor.getOption(monaco.editor.EditorOption.fontSize);

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

    const handleWheel = (event) => {
      const editorInstance = editorRef.current;
      if (!editorInstance || !containerRef.current) return;
      if (!containerRef.current.contains(event.target)) return;

      const delta = event.deltaY;
      if (delta === 0) return;

      if (event.ctrlKey) {
        const currentSize =
          fontSizeRef.current ||
          editorInstance.getOption(monaco.editor.EditorOption.fontSize) ||
          16;
        const direction = delta < 0 ? 1 : -1;
        const nextSize = clamp(currentSize + direction, 10, 28);
        if (nextSize !== currentSize) {
          fontSizeRef.current = nextSize;
          editorInstance.updateOptions({ fontSize: nextSize });
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const scrollTop = editorInstance.getScrollTop();
      const maxScroll =
        editorInstance.getScrollHeight() -
        editorInstance.getLayoutInfo().height;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop >= maxScroll - 1;
      const scrollingUp = delta < 0;
      const scrollingDown = delta > 0;

      if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
        // Deixa o default agir no container pai; evita que o Monaco capture e bloqueie.
        event.stopPropagation();
      }
    };

    const domNode = containerRef.current;
    domNode.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      domNode.removeEventListener("wheel", handleWheel);
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

        const propertyContext = getPropertyContext(model, position);
        if (propertyContext) {
          const { baseVariable, isArrayElement, partial } = propertyContext;
          const typeInfo = inferTypeInfo(model, baseVariable);
          const range = {
            startLineNumber: position.lineNumber,
            startColumn: position.column - partial.length,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          };

          if (!typeInfo) {
            return { suggestions: [] };
          }

          if (isArrayElement) {
            const elementKind = typeInfo.elementKind;
            if (!elementKind || elementKind === "primitiveNumber") {
              return { suggestions: [] };
            }
            return { suggestions: buildElementSuggestions(elementKind, range) };
          }

          return { suggestions: buildSuggestionsForKind(typeInfo.kind, range) };
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

function getPropertyContext(model, position) {
  const textUntilPosition = model.getValueInRange(
    new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column)
  );
  const match = textUntilPosition.match(
    /([A-Za-z_][A-Za-z0-9_]*\s*(?:\[[^\]]*\])?)\s*\.\s*([A-Za-z0-9_]*)$/
  );
  if (!match) return null;

  const expression = match[1].trim();
  const partial = match[2] || "";
  const indexMatch = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[/);
  const baseVariable = indexMatch ? indexMatch[1] : expression;
  const isArrayElement = Boolean(indexMatch);

  return { baseVariable, isArrayElement, partial };
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

function buildMethodSuggestions(methods, detail, range) {
  return methods.map((method) => {
    const insertText =
      method.insertText ?? `${method.label}${method.noParens ? "" : "($0)"}`;
    const isSnippet = insertText.includes("$");
    const item = {
      label: method.label,
      kind: method.kind ?? monaco.languages.CompletionItemKind.Method,
      insertText,
      detail,
      documentation: method.documentation,
      range,
    };
    if (isSnippet) {
      item.insertTextRules =
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    return item;
  });
}

function buildSuggestionsForKind(kind, range) {
  switch (kind) {
    case "list":
      return buildMethodSuggestions(LIST_METHODS, "java.util.List", range);
    case "map":
      return buildMethodSuggestions(MAP_METHODS, "java.util.Map", range);
    case "set":
      return buildMethodSuggestions(SET_METHODS, "java.util.Set", range);
    case "queue":
      return buildMethodSuggestions(QUEUE_METHODS, "java.util.Queue", range);
    case "deque":
      return buildMethodSuggestions(DEQUE_METHODS, "java.util.Deque", range);
    case "stack":
      return buildMethodSuggestions(STACK_METHODS, "java.util.Stack", range);
    case "priorityQueue":
      return buildMethodSuggestions(
        PRIORITY_QUEUE_METHODS,
        "java.util.PriorityQueue",
        range
      );
    case "array":
      return buildMethodSuggestions(ARRAY_METHODS, "Array", range);
    case "string":
      return buildMethodSuggestions(STRING_METHODS, "java.lang.String", range);
    case "stringBuilder":
      return buildMethodSuggestions(
        STRING_BUILDER_METHODS,
        "java.lang.StringBuilder",
        range
      );
    case "optional":
      return buildMethodSuggestions(
        OPTIONAL_METHODS,
        "java.util.Optional",
        range
      );
    case "numberObject":
    case "primitiveNumber":
      return buildMethodSuggestions(NUMBER_METHODS, "java.lang.Number", range);
    case "booleanObject":
    case "primitiveBoolean":
      return buildMethodSuggestions(
        BOOLEAN_METHODS,
        "java.lang.Boolean",
        range
      );
    case "charObject":
    case "primitiveChar":
      return buildMethodSuggestions(
        CHAR_METHODS,
        "java.lang.Character",
        range
      );
    default:
      return [];
  }
}

function buildElementSuggestions(elementKind, range) {
  switch (elementKind) {
    case "string":
      return buildMethodSuggestions(STRING_METHODS, "java.lang.String", range);
    case "stringBuilder":
      return buildMethodSuggestions(
        STRING_BUILDER_METHODS,
        "java.lang.StringBuilder",
        range
      );
    case "numberObject":
    case "primitiveNumber":
      return buildMethodSuggestions(NUMBER_METHODS, "java.lang.Number", range);
    case "booleanObject":
    case "primitiveBoolean":
      return buildMethodSuggestions(
        BOOLEAN_METHODS,
        "java.lang.Boolean",
        range
      );
    case "charObject":
    case "primitiveChar":
      return buildMethodSuggestions(
        CHAR_METHODS,
        "java.lang.Character",
        range
      );
    default:
      return [];
  }
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

function inferTypeInfo(model, variableName) {
  const text = model.getValue();
  const escaped = escapeRegExp(variableName);

  // Arrays (Type[] name or Type name[])
  const arrayTypePattern = new RegExp(
    `\\b([A-Za-z_][A-Za-z0-9_<>?,\\s]*)\\s*\\[\\s*\\]\\s+${escaped}\\b`
  );
  const arrayTypePatternAlt = new RegExp(
    `\\b([A-Za-z_][A-Za-z0-9_<>?,\\s]*)\\s+${escaped}\\s*\\[\\s*\\]`
  );
  const arrayNewPattern = new RegExp(
    `${escaped}\\s*=\\s*new\\s+([A-Za-z_][A-Za-z0-9_<>?,\\s]*)\\s*\\[`
  );
  const arrayMatch =
    text.match(arrayTypePattern) ||
    text.match(arrayTypePatternAlt) ||
    text.match(arrayNewPattern);
  if (arrayMatch) {
    const elementType = normalizeTypeName(arrayMatch[1]);
    return { kind: "array", elementKind: mapBaseTypeToKind(elementType) };
  }

  // Generic types (List<String> list)
  const genericDecl = new RegExp(
    `\\b([A-Za-z_][A-Za-z0-9_]*)\\s*<[^;>]*>\\s+${escaped}\\b`
  );
  const genericMatch = text.match(genericDecl);
  if (genericMatch) {
    const baseType = normalizeTypeName(genericMatch[1]);
    const kind = mapBaseTypeToKind(baseType);
    if (kind) return { kind };
  }

  // Simple declarations (Type var;)
  const simpleDecl = new RegExp(
    `\\b([A-Za-z_][A-Za-z0-9_]*)\\s+${escaped}\\b`
  );
  const simpleMatch = text.match(simpleDecl);
  if (simpleMatch) {
    const baseType = normalizeTypeName(simpleMatch[1]);
    const kind = mapBaseTypeToKind(baseType);
    if (kind) return { kind };
  }

  // Assignment with new (var = new Type())
  const newAssign = new RegExp(
    `${escaped}\\s*=\\s*new\\s+([A-Za-z_][A-Za-z0-9_]*)`
  );
  const newAssignMatch = text.match(newAssign);
  if (newAssignMatch) {
    const baseType = normalizeTypeName(newAssignMatch[1]);
    const kind = mapBaseTypeToKind(baseType);
    if (kind) return { kind };
  }

  return null;
}

function mapBaseTypeToKind(typeName) {
  const base = typeName.replace(/\s+/g, "").split(".").pop();
  if (["List", "ArrayList", "LinkedList"].includes(base)) return "list";
  if (["Map", "HashMap", "TreeMap", "LinkedHashMap"].includes(base)) return "map";
  if (["Set", "HashSet", "TreeSet"].includes(base)) return "set";
  if (["Queue"].includes(base)) return "queue";
  if (["Deque", "ArrayDeque"].includes(base)) return "deque";
  if (["Stack"].includes(base)) return "stack";
  if (["PriorityQueue"].includes(base)) return "priorityQueue";
  if (["Optional"].includes(base)) return "optional";
  if (base === "String") return "string";
  if (base === "StringBuilder") return "stringBuilder";
  if (["Integer", "Long", "Double", "Float", "Short", "Byte"].includes(base))
    return "numberObject";
  if (base === "Boolean") return "booleanObject";
  if (["Character", "Char"].includes(base)) return "charObject";
  if (["int", "long", "double", "float", "short", "byte"].includes(base))
    return "primitiveNumber";
  if (base === "boolean") return "primitiveBoolean";
  if (base === "char") return "primitiveChar";
  return null;
}

function normalizeTypeName(typeName) {
  return typeName.replace(/<.*?>/g, "").replace(/\s+/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const LIST_METHODS = [
  { label: "add", documentation: "Adiciona um elemento." },
  {
    label: "addAll",
    documentation: "Adiciona todos os elementos de outra colecao.",
  },
  { label: "get", documentation: "Retorna o elemento no indice informado." },
  { label: "set", documentation: "Substitui o elemento no indice." },
  { label: "remove", documentation: "Remove por indice ou objeto." },
  {
    label: "removeIf",
    documentation: "Remove elementos que atendem ao predicado.",
  },
  { label: "size", documentation: "Quantidade de elementos na lista." },
  { label: "isEmpty", documentation: "Indica se a lista esta vazia." },
  { label: "clear", documentation: "Remove todos os elementos." },
  { label: "contains", documentation: "Verifica se um elemento esta presente." },
  { label: "indexOf", documentation: "Primeira posicao de um elemento." },
  { label: "lastIndexOf", documentation: "Ultima posicao de um elemento." },
  { label: "subList", documentation: "Retorna uma visao parcial da lista." },
  { label: "sort", documentation: "Ordena a lista com Comparator." },
  { label: "toArray", documentation: "Converte para array." },
  { label: "iterator", documentation: "Retorna um Iterator." },
  { label: "listIterator", documentation: "Retorna um ListIterator." },
  { label: "stream", documentation: "Retorna um Stream." },
];

const MAP_METHODS = [
  { label: "put", documentation: "Adiciona ou substitui valor pela chave." },
  { label: "putIfAbsent", documentation: "Adiciona apenas se chave ausente." },
  { label: "get", documentation: "Obtém valor pela chave." },
  { label: "getOrDefault", documentation: "Valor ou padrao se chave ausente." },
  { label: "containsKey", documentation: "Verifica existencia da chave." },
  { label: "containsValue", documentation: "Verifica existencia do valor." },
  { label: "remove", documentation: "Remove par pela chave." },
  { label: "computeIfAbsent", documentation: "Calcula valor se chave ausente." },
  { label: "computeIfPresent", documentation: "Recalcula valor se presente." },
  { label: "merge", documentation: "Combina valor existente com novo." },
  { label: "size", documentation: "Quantidade de pares." },
  { label: "isEmpty", documentation: "Indica se o mapa esta vazio." },
  { label: "clear", documentation: "Remove todos os pares." },
  { label: "keySet", documentation: "Retorna conjunto de chaves." },
  { label: "values", documentation: "Retorna colecao de valores." },
  { label: "entrySet", documentation: "Retorna conjunto de entradas." },
];

const SET_METHODS = [
  { label: "add", documentation: "Adiciona elemento ao conjunto." },
  { label: "addAll", documentation: "Adiciona todos de outra colecao." },
  { label: "contains", documentation: "Verifica se contem elemento." },
  { label: "remove", documentation: "Remove elemento se existir." },
  { label: "removeIf", documentation: "Remove se predicado for verdadeiro." },
  { label: "size", documentation: "Quantidade de elementos." },
  { label: "isEmpty", documentation: "Indica se o conjunto esta vazio." },
  { label: "clear", documentation: "Remove todos os elementos." },
  { label: "iterator", documentation: "Iterador sobre os elementos." },
  { label: "stream", documentation: "Cria um Stream." },
];

const QUEUE_METHODS = [
  { label: "offer", documentation: "Enfileira se houver capacidade." },
  { label: "add", documentation: "Enfileira ou lança excecao se cheio." },
  { label: "poll", documentation: "Desenfileira ou null se vazio." },
  { label: "remove", documentation: "Desenfileira ou lança excecao." },
  { label: "peek", documentation: "Olha proximo sem remover; null se vazio." },
  { label: "element", documentation: "Olha proximo ou lança excecao." },
  { label: "size", documentation: "Quantidade de elementos." },
  { label: "isEmpty", documentation: "Indica se esta vazio." },
  { label: "clear", documentation: "Remove todos os elementos." },
];

const DEQUE_METHODS = [
  { label: "addFirst", documentation: "Adiciona no inicio." },
  { label: "addLast", documentation: "Adiciona no fim." },
  { label: "offerFirst", documentation: "Enfileira no inicio se possivel." },
  { label: "offerLast", documentation: "Enfileira no fim se possivel." },
  { label: "pollFirst", documentation: "Remove do inicio ou null." },
  { label: "pollLast", documentation: "Remove do fim ou null." },
  { label: "peekFirst", documentation: "Olha inicio ou null." },
  { label: "peekLast", documentation: "Olha fim ou null." },
  { label: "push", documentation: "Empilha no topo (inicio)." },
  { label: "pop", documentation: "Desempilha do topo (inicio)." },
  { label: "size", documentation: "Quantidade de elementos." },
  { label: "isEmpty", documentation: "Indica se esta vazio." },
  { label: "clear", documentation: "Remove todos os elementos." },
];

const STACK_METHODS = [
  { label: "push", documentation: "Empilha elemento." },
  { label: "pop", documentation: "Remove e retorna topo." },
  { label: "peek", documentation: "Consulta topo sem remover." },
  { label: "empty", documentation: "Indica se pilha vazia." },
  { label: "search", documentation: "Posicao de elemento na pilha." },
  { label: "size", documentation: "Quantidade de elementos." },
];

const PRIORITY_QUEUE_METHODS = [
  { label: "offer", documentation: "Insere no heap." },
  { label: "add", documentation: "Insere no heap." },
  { label: "poll", documentation: "Remove menor/maior elemento." },
  { label: "peek", documentation: "Consulta topo do heap." },
  { label: "remove", documentation: "Remove elemento especifico." },
  { label: "size", documentation: "Quantidade de elementos." },
  { label: "isEmpty", documentation: "Indica se esta vazio." },
  { label: "clear", documentation: "Remove todos os elementos." },
  { label: "comparator", documentation: "Retorna Comparator usado." },
];

const ARRAY_METHODS = [
  {
    label: "length",
    documentation: "Tamanho do array.",
    insertText: "length",
    noParens: true,
    kind: monaco.languages.CompletionItemKind.Property,
  },
  { label: "clone", documentation: "Copia rasa do array." },
];

const STRING_METHODS = [
  { label: "length", documentation: "Tamanho da string." },
  { label: "charAt", documentation: "Caractere na posicao informada." },
  { label: "substring", documentation: "Subcadeia entre indices." },
  { label: "indexOf", documentation: "Primeira ocorrencia do termo." },
  { label: "lastIndexOf", documentation: "Ultima ocorrencia do termo." },
  { label: "contains", documentation: "Verifica se contem trecho." },
  { label: "startsWith", documentation: "Verifica prefixo." },
  { label: "endsWith", documentation: "Verifica sufixo." },
  { label: "toLowerCase", documentation: "Converte para minusculas." },
  { label: "toUpperCase", documentation: "Converte para maiusculas." },
  { label: "trim", documentation: "Remove espacos nas pontas." },
  { label: "split", documentation: "Divide pela regex/delimitador." },
  { label: "replace", documentation: "Substitui primeiro termo." },
  { label: "replaceAll", documentation: "Substitui todas as ocorrencias." },
  { label: "isEmpty", documentation: "Indica se string e vazia." },
  { label: "equals", documentation: "Compara conteudo." },
  { label: "equalsIgnoreCase", documentation: "Compara ignorando caixa." },
  { label: "toCharArray", documentation: "Converte para array de chars." },
];

const STRING_BUILDER_METHODS = [
  { label: "append", documentation: "Concatena valor ao final." },
  { label: "insert", documentation: "Insere valor em indice." },
  { label: "delete", documentation: "Remove intervalo." },
  { label: "deleteCharAt", documentation: "Remove caractere na posicao." },
  { label: "setCharAt", documentation: "Altera caractere na posicao." },
  { label: "reverse", documentation: "Inverte conteudo." },
  { label: "toString", documentation: "Converte para String." },
  { label: "length", documentation: "Tamanho atual." },
  { label: "charAt", documentation: "Caractere na posicao." },
  { label: "setLength", documentation: "Ajusta tamanho." },
  { label: "substring", documentation: "Subcadeia entre indices." },
];

const NUMBER_METHODS = [
  { label: "intValue", documentation: "Valor como int." },
  { label: "longValue", documentation: "Valor como long." },
  { label: "doubleValue", documentation: "Valor como double." },
  { label: "floatValue", documentation: "Valor como float." },
  { label: "shortValue", documentation: "Valor como short." },
  { label: "byteValue", documentation: "Valor como byte." },
  { label: "compareTo", documentation: "Compara com outro valor." },
  { label: "toString", documentation: "Converte para String." },
  { label: "hashCode", documentation: "Hash do valor." },
  { label: "equals", documentation: "Compara igualdade." },
];

const BOOLEAN_METHODS = [
  { label: "booleanValue", documentation: "Valor booleano." },
  { label: "compareTo", documentation: "Compara com outro boolean." },
  { label: "toString", documentation: "Converte para String." },
  { label: "hashCode", documentation: "Hash do valor." },
  { label: "equals", documentation: "Compara igualdade." },
];

const CHAR_METHODS = [
  { label: "charValue", documentation: "Valor char." },
  { label: "compareTo", documentation: "Compara com outro char." },
  { label: "toString", documentation: "Converte para String." },
  { label: "hashCode", documentation: "Hash do valor." },
  { label: "equals", documentation: "Compara igualdade." },
];

const OPTIONAL_METHODS = [
  { label: "isPresent", documentation: "Indica se ha valor." },
  { label: "isEmpty", documentation: "Indica se ausente." },
  { label: "get", documentation: "Retorna valor ou lança excecao." },
  { label: "orElse", documentation: "Valor ou padrao." },
  { label: "orElseGet", documentation: "Valor ou supplier." },
  { label: "orElseThrow", documentation: "Valor ou excecao." },
  { label: "ifPresent", documentation: "Executa se presente." },
  { label: "map", documentation: "Transforma valor." },
  { label: "flatMap", documentation: "Transforma para outro Optional." },
  { label: "filter", documentation: "Filtra por predicado." },
];

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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
