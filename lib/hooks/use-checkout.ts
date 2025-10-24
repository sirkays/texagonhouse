// import { clientApiCall } from "@/lib/api-client-browser"

// export async function createOrder(cartId: string, shippingData: any, paymentData: any) {
//   console.log("[v0] Creating order with data:", { cartId, shippingData })

//   const response = await clientApiCall("/api/store/checkout", {
//     method: "POST",
//     body: JSON.stringify({
//       cart_id: cartId,
//       shipping_address: shippingData,
//       payment_method: paymentData,
//     }),
//   })

//   return response
// }

// export async function processPayment(orderId: string, paymentData: any) {
//   console.log("[v0] Processing payment for order:", orderId)

//   const response = await clientApiCall("/api/store/payments", {
//     method: "POST",
//     body: JSON.stringify({
//       order_id: orderId,
//       ...paymentData,
//     }),
//   })

//   return response
// }

// lib/hooks/use-checkout.ts
"use client";

import {fetcher} from "@/lib/utils";

export async function createOrder(
  cartId: string,
  shippingData: any,
  paymentData: any
) {
  const orderData = {
    billing_address_id: shippingData.addressId || null,
    shipping_address_id: shippingData.addressId || null,
  };
  const order = await fetcher("/api/store/checkout", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  const payment = await processPayment(order.order_id, paymentData);
  return {...order, payment};
}

export async function processPayment(orderId: string, paymentData: any) {
  const payment = await fetcher(`/api/store/payments/card/${orderId}/start`, {
    method: "POST",
    body: JSON.stringify({
      provider: "stripe",
      currency: "NGN",
      ...paymentData,
    }),
  });
  await fetcher(`/api/store/payments/${payment.payment_id}/mark-captured`, {
    method: "POST",
    body: JSON.stringify({provider_ref: "txn_12345"}),
  });
  return payment;
}
