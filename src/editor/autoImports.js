export const AUTO_IMPORTS = [
  {
    statement: "import java.util.Objects;",
    always: true,
  },
  {
    statement: "import java.util.List;",
    pattern: /\bList\b/,
  },
  {
    statement: "import java.util.ArrayList;",
    pattern: /\bArrayList\b/,
  },
  {
    statement: "import java.util.Map;",
    pattern: /\bMap\b/,
  },
  {
    statement: "import java.util.HashMap;",
    pattern: /\bHashMap\b/,
  },
  {
    statement: "import java.util.Set;",
    pattern: /\bHashSet\b|\bSet\b/,
  },
  {
    statement: "import java.util.HashSet;",
    pattern: /\bHashSet\b/,
  },
  {
    statement: "import java.util.Optional;",
    pattern: /\bOptional\b/,
  },
  {
    statement: "import java.util.stream.Collectors;",
    pattern: /\bCollectors\b/,
  },
  {
    statement: "import java.util.stream.Stream;",
    pattern: /\bStream\b/,
  },
  {
    statement: "import java.math.BigDecimal;",
    pattern: /\bBigDecimal\b/,
  },
  {
    statement: "import java.math.BigInteger;",
    pattern: /\bBigInteger\b/,
  },
  {
    statement: "import java.lang.Math;",
    pattern: /\bMath\s*\./,
  },
];

const AUTO_IMPORT_SET = new Set(AUTO_IMPORTS.map((entry) => entry.statement));

export function detectMissingImports(rawCode = "") {
  const normalized = rawCode.replace(/\r\n/g, "\n");
  const existingImports = new Set();
  const importMatches = normalized.match(/^\s*import\s+.+?;\s*$/gm);
  if (importMatches) {
    importMatches.forEach((line) => {
      existingImports.add(line.trim());
    });
  }

  const missingImports = [];

  AUTO_IMPORTS.forEach(({ statement, always, pattern }) => {
    const shouldInclude = always || (pattern && pattern.test(normalized));
    if (shouldInclude && !existingImports.has(statement)) {
      missingImports.push(statement);
      existingImports.add(statement);
    }
  });

  return missingImports;
}
