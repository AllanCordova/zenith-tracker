// Prova da trava: falha de propósito. Apagar este arquivo depois que o
// check `api` bloquear o merge no ruleset da main.
describe('trava do CI', () => {
  it('falha de propósito para o ruleset da main recusar o merge', () => {
    expect(true).toBe(false);
  });
});
