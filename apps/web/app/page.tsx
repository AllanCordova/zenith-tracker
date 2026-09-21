import Link from "next/link";
import { ProductShell } from "@/components/product-shell";

export default function Home() {
  return (
    <ProductShell>
      <h1 className="zt-titulo">Zenith Tracker</h1>
      <p className="zt-apoio mt-token-sm">Crie conta ou entre na área do seu papel.</p>
      <div className="mt-token-lg flex flex-col gap-token-sm">
        <Link href="/cadastro" className="zt-btn mt-0 inline-block text-center">
          Cadastro
        </Link>
        <Link href="/login" className="zt-btn mt-0 inline-block text-center">
          Entrar
        </Link>
      </div>
    </ProductShell>
  );
}
