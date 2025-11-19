import { loadCheerpJ } from "./loadCheerpJ";

export default async function runJava(challenge) {
  await loadCheerpJ();
  return "Executado (placeholder).";
}
