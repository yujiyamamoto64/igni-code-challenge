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
    statement: "import java.util.LinkedList;",
    pattern: /\bLinkedList\b/,
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
    statement: "import java.util.LinkedHashMap;",
    pattern: /\bLinkedHashMap\b/,
  },
  {
    statement: "import java.util.TreeMap;",
    pattern: /\bTreeMap\b/,
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
    statement: "import java.util.TreeSet;",
    pattern: /\bTreeSet\b/,
  },
  {
    statement: "import java.util.Queue;",
    pattern: /\bQueue\b/,
  },
  {
    statement: "import java.util.Deque;",
    pattern: /\bDeque\b/,
  },
  {
    statement: "import java.util.ArrayDeque;",
    pattern: /\bArrayDeque\b/,
  },
  {
    statement: "import java.util.Stack;",
    pattern: /\bStack\b/,
  },
  {
    statement: "import java.util.PriorityQueue;",
    pattern: /\bPriorityQueue\b/,
  },
  {
    statement: "import java.util.Collections;",
    pattern: /\bCollections\b/,
  },
  {
    statement: "import java.util.Arrays;",
    pattern: /\bArrays\b/,
  },
  {
    statement: "import java.util.Optional;",
    pattern: /\bOptional\b/,
  },
  {
    statement: "import java.util.BitSet;",
    pattern: /\bBitSet\b/,
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
    statement: "import java.util.regex.Pattern;",
    pattern: /\bPattern\b/,
  },
  {
    statement: "import java.util.regex.Matcher;",
    pattern: /\bMatcher\b/,
  },
  {
    statement: "import java.io.BufferedReader;",
    pattern: /\bBufferedReader\b/,
  },
  {
    statement: "import java.io.InputStreamReader;",
    pattern: /\bInputStreamReader\b/,
  },
  {
    statement: "import java.io.PrintWriter;",
    pattern: /\bPrintWriter\b/,
  },
  {
    statement: "import java.util.StringTokenizer;",
    pattern: /\bStringTokenizer\b/,
  },
  {
    statement: "import java.util.Scanner;",
    pattern: /\bScanner\b/,
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
  {
    statement: "import java.time.LocalDate;",
    pattern: /\bLocalDate\b/,
  },
  {
    statement: "import java.time.LocalTime;",
    pattern: /\bLocalTime\b/,
  },
  {
    statement: "import java.time.LocalDateTime;",
    pattern: /\bLocalDateTime\b/,
  },
  {
    statement: "import java.time.Duration;",
    pattern: /\bDuration\b/,
  },
  {
    statement: "import java.time.Period;",
    pattern: /\bPeriod\b/,
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
