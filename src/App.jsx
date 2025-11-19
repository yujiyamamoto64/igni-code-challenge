import { useState } from "react";
import Editor from "./components/Editor";
import ChallengePanel from "./components/ChallengePanel";
import TestRunner from "./components/TestRunner";
import challenge from "./challenges/level1.json";
import {
  JAVA_VERSION,
  REQUIRED_IMPORTS,
  HARNESS_DESCRIPTION,
} from "./runtime/runtimeMetadata";

export default function App() {
  const [code, setCode] = useState(challenge.starterCode);

  return (
    <div className="grid grid-cols-2 h-screen">
      <Editor code={code} onChange={setCode} />
      <div className="flex flex-col">
        <ChallengePanel
          challenge={challenge}
          runtimeInfo={{
            javaVersion: JAVA_VERSION,
            imports: REQUIRED_IMPORTS,
            harnessDescription: HARNESS_DESCRIPTION,
          }}
        />
        <TestRunner challenge={challenge} code={code} />
      </div>
    </div>
  );
}
