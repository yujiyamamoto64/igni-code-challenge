import { useEffect, useState } from "react";
import Editor from "./components/Editor";
import ChallengePanel from "./components/ChallengePanel";
import TestRunner from "./components/TestRunner";
import challenges from "./challenges";
import TopBar from "./components/TopBar";
import { JAVA_VERSION, HARNESS_DESCRIPTION } from "./runtime/runtimeMetadata";

export default function App() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const challenge = challenges[challengeIndex];
  const [code, setCode] = useState(challenge.starterCode);

  useEffect(() => {
    setCode(challenge.starterCode);
  }, [challenge]);

  function goToNextChallenge() {
    setChallengeIndex((prev) => (prev + 1) % challenges.length);
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <TopBar
        javaVersion={JAVA_VERSION}
        onNextChallenge={goToNextChallenge}
        challengeTitle={challenge.title}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          <ChallengePanel
            challenge={challenge}
            harnessDescription={HARNESS_DESCRIPTION}
          />

          <div className="rounded border border-zinc-800 bg-zinc-900 shadow-lg">
            <div className="h-[460px]">
              <Editor code={code} onChange={setCode} />
            </div>
          </div>

          <TestRunner challenge={challenge} code={code} />
        </div>
      </main>
    </div>
  );
}
