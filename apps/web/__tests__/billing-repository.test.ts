import { AxiosHeaders } from "axios";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { http } from "../lib/http";
import { chargeOrder, getCurrentSubscription } from "../repositories/billing";

function axiosOk(status: number, data: unknown) {
  return {
    status,
    data,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

beforeEach(() => {
  vi.spyOn(http, "post").mockResolvedValue(
    axiosOk(201, {
      data: {
        id: "payment-1",
        orderId: "order-1",
        gatewayPaymentId: "gw-1",
        status: "pending",
        receivedAt: "2026-11-22T00:00:00.000Z",
      },
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("chargeOrder chama POST /billing/orders/:id/charge com token", async () => {
  await chargeOrder({ orderId: "order-1", token: "card-token" });

  expect(http.post).toHaveBeenCalledWith("/billing/orders/order-1/charge", {
    token: "card-token",
  });
});

test("chargeOrder com 4xx/5xx lança Error e não engole a falha", async () => {
  vi.mocked(http.post).mockResolvedValue(
    axiosOk(502, {
      statusCode: 502,
      message: "Gateway Timeout",
      error: "Bad Gateway",
    }),
  );

  await expect(
    chargeOrder({ orderId: "order-1", token: "card-token" }),
  ).rejects.toThrow("Gateway Timeout");
});

test("getCurrentSubscription chama GET /billing/subscription/current", async () => {
  vi.spyOn(http, "get").mockResolvedValue(
    axiosOk(200, {
      data: {
        id: "sub-1",
        trainerId: "user-2",
        orderId: "order-1",
        planCode: "YEARLY",
        status: "ACTIVE",
        activatedAt: "2026-11-22T00:00:00.000Z",
      },
    }),
  );

  const subscription = await getCurrentSubscription();

  expect(http.get).toHaveBeenCalledWith("/billing/subscription/current");
  expect(subscription?.status).toBe("ACTIVE");
});
