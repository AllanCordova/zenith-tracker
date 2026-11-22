"use client";

import { useEffect } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";

type Props = {
  publicKey: string;
  amount: number;
  onSubmit: (formData: { token: string }) => Promise<void>;
};

export function MercadoPagoCardPayment({ publicKey, amount, onSubmit }: Props) {
  useEffect(() => {
    initMercadoPago(publicKey, { locale: "pt-BR" });
  }, [publicKey]);

  return (
    <CardPayment
      locale="pt-BR"
      initialization={{ amount }}
      onSubmit={onSubmit}
    />
  );
}
