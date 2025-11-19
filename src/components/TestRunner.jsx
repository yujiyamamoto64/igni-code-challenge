import runJava from "../runtime/runJava";

export default function TestRunner({ challenge }) {
  async function runTests() {
    const output = await runJava(challenge);
    alert(output);
  }

  return (
    <div className="p-4 bg-zinc-900 flex-1">
      <button
        className="bg-blue-600 px-4 py-2 rounded"
        onClick={runTests}
      >
        RUN
      </button>
    </div>
  );
}
