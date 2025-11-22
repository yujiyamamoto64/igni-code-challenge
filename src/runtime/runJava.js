import { JAVA_VERSION } from "./runtimeMetadata";

const API_URL = "https://emkc.org/api/v2/piston/execute";

export default async function runJava(code, challenge) {
  guardAgainstCustomMain(code);

  const runnerSource = buildRunnerSource(challenge);
  const sanitizedUserCode = sanitizeUserCode(code, challenge.className);
  const solutionWithHarness = injectHarnessEntryPoint(sanitizedUserCode);
  const normalizedSolution = solutionWithHarness.trim();
  const needsObjectsImport = !/import\s+java\.util\.Objects\s*;/.test(
    normalizedSolution
  );
  const combinedSource = [
    needsObjectsImport ? "import java.util.Objects;" : "",
    "",
    normalizedSolution,
    "",
    runnerSource,
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    language: "java",
    version: JAVA_VERSION,
    files: [{ name: "Main.java", content: combinedSource }],
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Falha ao se comunicar com o executor remoto.");
  }

  const data = await response.json();
  const runData = data.run || {};
  const stderr = (runData.stderr || "").trim();
  if (stderr) {
    const compileErrors = parseCompilerErrors(stderr, code);
    const primary =
      compileErrors.length > 0
        ? compileErrors[0].hint || compileErrors[0].message
        : stderr;
    const error = new Error(primary);
    error.compileErrors = compileErrors;
    throw error;
  }

  const stdout = runData.stdout || "";
  return parseRunnerOutput(stdout);
}

function buildRunnerSource(challenge) {
  const { className, method, tests } = challenge;

  if (!className || !method || !Array.isArray(tests)) {
    throw new Error("Desafio sem metadados suficientes para execucao.");
  }

  if (method.returnType === "void") {
    throw new Error("Execucao de metodos void ainda nao suportada.");
  }

  if (!method.parameters || method.parameters.length === 0) {
    throw new Error("Parametros do desafio nao encontrados.");
  }

  const caseBlocks = tests
    .map((test, index) =>
      buildCaseBlock({ test, index, className, method })
    )
    .join("\n");

  return String.raw`
class SolutionTestHarness {
  public static void run() {
    int passed = 0;
    int total = ${tests.length};
${caseBlocks}
    emitSummary(passed, total);
  }

  private static void emitResult(int id, String status, String message) {
    System.out.println("{\"type\":\"result\",\"id\":" + id + ",\"status\":\"" + status + "\",\"message\":" + quote(message) + "}");
  }

  private static void emitSummary(int passed, int total) {
    System.out.println("{\"type\":\"summary\",\"passed\":" + passed + ",\"total\":" + total + "}");
  }

  private static String quote(String value) {
    if (value == null) {
      return "\"\"";
    }
    String escaped = value
      .replace("\\", "\\\\")
      .replace("\"", "\\\"")
      .replace("\n", "\\n")
      .replace("\r", "\\r");
    return "\"" + escaped + "\"";
  }
}
`.trim();
}

function buildCaseBlock({ test, index, className, method }) {
  const inputs = Array.isArray(test.input) ? test.input : [];
  const args = inputs.map((value, argIndex) => {
    const param = method.parameters[argIndex];
    const paramType = param && param.type;
    if (!paramType) {
      throw new Error("Parametro sem tipo definido.");
    }
    return formatLiteral(paramType, value);
  });

  const expected = formatLiteral(method.returnType, test.expected);
  const resultVar = `result${index}`;
  const passVar = `pass${index}`;
  const expectedStr = toStringExpression(method.returnType, expected);
  const resultStr = toStringExpression(method.returnType, resultVar);
  const comparison = buildComparison(method.returnType, resultVar, expected);

  return String.raw`
    try {
      ${method.returnType} ${resultVar} = ${className}.${method.name}(${args.join(
        ", "
      )});
      boolean ${passVar} = ${comparison};
      if (${passVar}) {
        passed++;
      }
      String message${index} = ${passVar}
          ? "Teste ${index + 1} passou"
          : "Esperado " + ${expectedStr} + ", mas foi " + ${resultStr};
      emitResult(${index + 1}, ${passVar} ? "pass" : "fail", message${index});
    } catch (Exception e) {
      emitResult(${index + 1}, "error", "Excecao: " + e.getMessage());
    }
`;
}

function sanitizeUserCode(code, className) {
  if (!code || !className) {
    return code || "";
  }

  const classRegex = new RegExp(`public\\s+class\\s+${className}\\b`);
  if (classRegex.test(code)) {
    return code.replace(classRegex, `class ${className}`);
  }

  return code;
}

function injectHarnessEntryPoint(code) {
  const trimmedCode = code.trim();
  const closingBraceIndex = trimmedCode.lastIndexOf("}");
  if (closingBraceIndex === -1) {
    throw new Error("Nao foi possivel interpretar a classe Solution.");
  }

  const before = trimmedCode.slice(0, closingBraceIndex);
  const after = trimmedCode.slice(closingBraceIndex);
  const harnessMain = `
  public static void main(String[] args) {
    SolutionTestHarness.run();
  }
`;

  return `${before}\n${harnessMain}\n${after}`;
}

function guardAgainstCustomMain(code) {
  if (/public\s+static\s+void\s+main\s*\(/i.test(code)) {
    throw new Error(
      "Remova o método main. O avaliador já cria um main automaticamente para rodar os testes."
    );
  }
}

function formatLiteral(type, value) {
  if (value === null || value === undefined) {
    return "null";
  }

  const normalized = type.toLowerCase();

  switch (normalized) {
    case "byte":
    case "short":
    case "int":
      return Number(value).toString();
    case "long":
      return `${Number(value)}L`;
    case "float":
      return `${value}f`;
    case "double":
      return `${value}d`;
    case "boolean":
      return value ? "true" : "false";
    case "char": {
      const strValue = String(value);
      const firstChar = strValue.length > 0 ? strValue[0] : " ";
      return `'${escapeJavaChar(firstChar)}'`;
    }
    case "string":
      return `"${escapeJavaString(String(value))}"`;
    default:
      throw new Error(`Tipo ${type} nao suportado no runner.`);
  }
}

function escapeJavaString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

function escapeJavaChar(value) {
  if (value === "\\") {
    return "\\\\";
  }
  if (value === "'") {
    return "\\'";
  }
  if (value === "\n") {
    return "\\n";
  }
  if (value === "\r") {
    return "\\r";
  }
  return value;
}

function toStringExpression(type, expression) {
  const normalized = type.toLowerCase();
  if (
    ["byte", "short", "int", "long", "float", "double", "boolean", "char"].includes(
      normalized
    )
  ) {
    return `String.valueOf(${expression})`;
  }
  return `${expression} == null ? "null" : ${expression}.toString()`;
}

function buildComparison(type, left, right) {
  const normalized = type.toLowerCase();
  if (normalized === "double") {
    return `Double.compare(${left}, ${right}) == 0`;
  }
  if (normalized === "float") {
    return `Float.compare(${left}, ${right}) == 0`;
  }
  if (["byte", "short", "int", "long", "char", "boolean"].includes(normalized)) {
    return `${left} == ${right}`;
  }
  return `Objects.equals(${left}, ${right})`;
}

function parseCompilerErrors(stderr, originalUserCode) {
  const errors = [];
  const codeLines = (originalUserCode || "").split(/\r?\n/);
  const regex = /^(?<file>[^:\n]+):(?<line>\d+):\s+error:\s+(?<message>.+)$/;

  const lines = stderr.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(regex);
    if (!match || !match.groups) continue;

    const lineNumber = Number(match.groups.line);
    const message = match.groups.message.trim();
    const code = codeLines[lineNumber - 1] || "";
    const hint = buildHint(message, code);

    errors.push({ line: lineNumber, message, code, hint });
  }

  return errors;
}

function buildHint(message, code) {
  if (!code) return null;

  const missingGeneric =
    message.includes("'(' or '[' expected") &&
    code.includes(">") &&
    !code.includes("<");
  if (missingGeneric) {
    return "Falta '<' depois do tipo generico (ex.: ArrayList<>()).";
  }

  return null;
}

function parseRunnerOutput(stdout) {
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  const results = [];
  let summary = null;

  lines.forEach((line) => {
    try {
      const payload = JSON.parse(line);
      if (payload.type === "result") {
        results.push({
          id: payload.id,
          status: payload.status,
          message: payload.message,
        });
      } else if (payload.type === "summary") {
        summary = { passed: payload.passed, total: payload.total };
      }
    } catch (error) {
      results.push({
        id: results.length + 1,
        status: "error",
        message: `Saida nao reconhecida: ${line}`,
      });
    }
  });

  return { results, summary };
}
