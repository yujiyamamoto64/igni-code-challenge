import Editor from "./components/Editor";
import ChallengePanel from "./components/ChallengePanel";
import TestRunner from "./components/TestRunner";
import challenge from "./challenges/level1.json";

export default function App() {
  return (
    <div className="grid grid-cols-2 h-screen">
      <Editor initialCode={challenge.starterCode} />
      <div className="flex flex-col">
        <ChallengePanel challenge={challenge} />
        <TestRunner challenge={challenge} />
      </div>
    </div>
  );
}
