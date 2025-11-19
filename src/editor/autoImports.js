const AUTO_IMPORTS = [
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

export function applyAutoImports(rawCode = "") {
  const normalized = rawCode.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const manualImports = [];
  const otherLines = [];

  lines.forEach((line) => {
    if (/^\s*import\s+/.test(line)) {
      const trimmed = line.trim().replace(/\s+/g, " ").replace(/\s*;\s*$/, ";");
      if (!AUTO_IMPORT_SET.has(trimmed)) {
        manualImports.push(trimmed);
      }
    } else {
      otherLines.push(line);
    }
  });

  const bodyText = otherLines.join("\n");
  const autoImportsToAdd = [];

  AUTO_IMPORTS.forEach(({ statement, always, pattern }) => {
    const shouldInclude = always || (pattern && pattern.test(bodyText));
    if (shouldInclude && !autoImportsToAdd.includes(statement)) {
      autoImportsToAdd.push(statement);
    }
  });

  const finalImports = [...manualImports];
  autoImportsToAdd.forEach((importLine) => {
    if (!finalImports.includes(importLine)) {
      finalImports.push(importLine);
    }
  });

  const trimmedBody = bodyText.replace(/^\s*\n/, "");
  const sections = [];
  if (finalImports.length > 0) {
    sections.push(finalImports.join("\n"));
  }
  sections.push(trimmedBody);

  return sections
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function listAutoImports(code) {
  const normalized = code.replace(/\r\n/g, "\n");
  const matches = normalized.match(/^\s*import\s+.+;/gm);
  if (!matches) return [];
  return matches.map((line) => line.trim());
}
