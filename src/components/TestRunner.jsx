import { useState } from "react";
import runJava from "../runtime/runJava";

export default function TestRunner({ challenge, code }) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  async function runTests() {
    setIsRunning(true);
    setError("");
    setResults([]);
    setSummary(null);

    try {
      const output = await runJava(code, challenge);
      setResults(output.results);
      setSummary(output.summary);
    } catch (err) {
      const message =
        err?.message || "Nao foi possivel executar os testes agora.";
      setError(message);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="p-4 bg-zinc-900 flex-1 overflow-y-auto">
      <button
        className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
        onClick={runTests}
        disabled={isRunning}
      >
        {isRunning ? "Executando..." : "RUN"}
      </button>

      {error && (
        <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {summary && (
        <p className="mt-4 text-sm text-zinc-300">
          Resultado: {summary.passed}/{summary.total} testes aprovados
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm">
          {results.map((result) => (
            <li
              key={result.id}
              className={`rounded border px-3 py-2 ${
                result.status === "pass"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : result.status === "error"
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-200"
                  : "border-red-500/30 bg-red-500/10 text-red-200"
              }`}
            >
              <strong>Teste {result.id}:</strong> {result.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
