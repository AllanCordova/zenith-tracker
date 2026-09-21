import Link from "next/link";

export function Footer() {
  return (
    <footer className="zt-footer">
      <div className="zt-footer-inner">
        <div>
          <p className="zt-header-marca">Zenith Tracker</p>
          <p className="zt-apoio mt-token-xs">
            Acompanhamento nutricional do treino híbrido.
          </p>
        </div>
        <nav className="zt-footer-nav" aria-label="Rodapé">
          <Link href="/cadastro">Cadastro</Link>
          <Link href="/login">Entrar</Link>
        </nav>
      </div>
    </footer>
  );
}
