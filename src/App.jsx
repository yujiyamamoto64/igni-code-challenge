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
    <div className="flex flex-col h-screen">
      <TopBar
        javaVersion={JAVA_VERSION}
        onNextChallenge={goToNextChallenge}
        challengeTitle={challenge.title}
      />
      <div className="grid grid-cols-2 flex-1">
        <Editor code={code} onChange={setCode} />
        <div className="flex flex-col">
          <ChallengePanel
            challenge={challenge}
            harnessDescription={HARNESS_DESCRIPTION}
          />
          <TestRunner challenge={challenge} code={code} />
        </div>
      </div>
    </div>
  );
}
