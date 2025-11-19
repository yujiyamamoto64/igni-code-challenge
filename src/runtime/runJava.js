const API_URL = "https://emkc.org/api/v2/piston/execute";
const JAVA_VERSION = "15.0.2";

export default async function runJava(code, challenge) {
  const runnerSource = buildRunnerSource(challenge);
  const payload = {
    language: "java",
    version: JAVA_VERSION,
    files: [
      { name: `${challenge.className}.java`, content: code },
      { name: "Main.java", content: runnerSource },
    ],
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
    throw new Error(stderr);
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

  const lines = [
    "import java.util.Objects;",
    "",
    "public class Main {",
    "  public static void main(String[] args) {",
    "    int passed = 0;",
    `    int total = ${tests.length};`,
  ];

  tests.forEach((test, index) => {
    const block = buildCaseBlock({ test, index, className, method });
    lines.push(...block);
  });

  lines.push(
    "    emitSummary(passed, total);",
    "  }",
    "",
    "  private static void emitResult(int id, String status, String message) {",
    '    System.out.println("{\\"type\\":\\"result\\",\\"id\\:" + id + ",\\"status\\":\\"" + status + "\\",\\"message\\":" + quote(message) + "}");',
    "  }",
    "",
    "  private static void emitSummary(int passed, int total) {",
    '    System.out.println("{\\"type\\":\\"summary\\",\\"passed\\:" + passed + ",\\"total\\:" + total + "}");',
    "  }",
    "",
    "  private static String quote(String value) {",
    "    if (value == null) {",
    '      return "\"\"";',
    "    }",
    "    String escaped = value",
    String.raw`      .replace("\\", "\\\\")`,
    String.raw`      .replace("\"", "\\\"")`,
    String.raw`      .replace("\n", "\\n")`,
    String.raw`      .replace("\r", "\\r");`,
    '    return "\"" + escaped + "\"";',
    "  }",
    "}"
  );

  return lines.join("\n");
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

  return [
    "    try {",
    `      ${method.returnType} ${resultVar} = ${className}.${method.name}(${args.join(
      ", "
    )});`,
    `      boolean ${passVar} = ${comparison};`,
    `      if (${passVar}) {`,
    "        passed++;",
    "      }",
    `      String message${index} = ${passVar} ? "Teste ${index + 1} passou" : "Esperado " + ${expectedStr} + ", mas foi " + ${resultStr};`,
    `      emitResult(${index + 1}, ${passVar} ? "pass" : "fail", message${index});`,
    "    } catch (Exception e) {",
    `      emitResult(${index + 1}, "error", "Excecao: " + e.getMessage());`,
    "    }",
    "",
  ];
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
