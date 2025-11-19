export default function ChallengePanel({ challenge }) {
  return (
    <div className="p-4 bg-zinc-800 border-b border-zinc-700">
      <h1 className="text-xl font-bold">{challenge.title}</h1>
      <p className="mt-2 text-zinc-300">{challenge.description}</p>
    </div>
  );
}
