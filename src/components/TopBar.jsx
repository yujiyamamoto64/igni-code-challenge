export default function TopBar({
  javaVersion,
  onNextChallenge,
  challengeTitle,
}) {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Desafio atual
        </p>
        <p className="text-lg text-white font-semibold">{challengeTitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-300 font-mono">
          Java runtime {javaVersion}
        </span>
        <button
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          onClick={onNextChallenge}
        >
          Próximo desafio
        </button>
      </div>
    </header>
  );
}
