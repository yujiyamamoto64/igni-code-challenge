import { useState } from "react";
import Editor from "./components/Editor";
import ChallengePanel from "./components/ChallengePanel";
import TestRunner from "./components/TestRunner";
import challenge from "./challenges/level1.json";

export default function App() {
  const [code, setCode] = useState(challenge.starterCode);

  return (
    <div className="grid grid-cols-2 h-screen">
      <Editor code={code} onChange={setCode} />
      <div className="flex flex-col">
        <ChallengePanel challenge={challenge} />
        <TestRunner challenge={challenge} code={code} />
      </div>
    </div>
  );
}
