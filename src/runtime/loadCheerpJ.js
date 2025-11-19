export async function loadCheerpJ() {
  if (!window.cheerpjInit) {
    throw new Error("CheerpJ carregando...");
  }
  await cheerpjInit();
}
