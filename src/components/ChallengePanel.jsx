function formatInput(input) {
  if (Array.isArray(input)) {
    return input.map((value) => JSON.stringify(value)).join(", ");
  }
  return JSON.stringify(input);
}

export default function ChallengePanel({ challenge, runtimeInfo }) {
  const { javaVersion, imports = [], harnessDescription } = runtimeInfo || {};

  return (
    <div className="p-4 bg-zinc-800 border-b border-zinc-700 space-y-4">
      <div>
        <h1 className="text-xl font-bold">{challenge.title}</h1>
        <p className="mt-2 text-zinc-300">{challenge.description}</p>
      </div>

      <div>
        <p className="text-xs uppercase text-zinc-500 tracking-wide">
          Ambiente
        </p>
        <p className="text-sm text-zinc-200 mt-1">
          Java runtime: <span className="font-mono">{javaVersion}</span>
        </p>
        {imports.length > 0 && (
          <div className="mt-2">
            <p className="text-xs uppercase text-zinc-500 tracking-wide">
              Imports automáticos
            </p>
            <pre className="mt-1 rounded bg-zinc-900/70 p-2 text-xs text-zinc-200 overflow-auto">
              {imports.join("\n")}
            </pre>
          </div>
        )}
        {harnessDescription && (
          <p className="mt-2 text-xs text-zinc-400">{harnessDescription}</p>
        )}
      </div>

      {challenge.tests?.length ? (
        <div>
          <p className="text-xs uppercase text-zinc-500 tracking-wide">
            Testes disponíveis
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {challenge.tests.map((test, index) => (
              <li
                key={index}
                className="rounded border border-zinc-700/60 bg-zinc-900/50 p-2"
              >
                <p className="text-zinc-300">
                  Teste {index + 1}:{" "}
                  <span className="font-mono text-zinc-100">
                    sum({formatInput(test.input)})
                  </span>
                </p>
                <p className="text-xs text-zinc-400">
                  Esperado:{" "}
                  <span className="font-mono">
                    {JSON.stringify(test.expected)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
