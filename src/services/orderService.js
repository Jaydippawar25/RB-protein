import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  queryCollection,
  getDocument,
  updateDocument,
} from "../firebase/firestore";

/**
 * orders/{orderId}:
 * { id, userId, items:[{productId,name,price,qty,variant}], subtotal, shipping,
 *   tax, total, address, paymentMethod, paymentStatus: 'pending'|'paid'|'failed',
 *   status: 'placed'|'confirmed'|'packed'|'shipped'|'out_for_delivery'|'delivered'|'cancelled',
 *   trackingEvents:[{status,timestamp,note}], createdAt, updatedAt }
 */

export async function placeOrder({
  userId,
  items,
  address,
  paymentMethod,
  subtotal,
  shipping,
  tax,
}) {
  const total = subtotal + shipping + tax;
  const orderRef = doc(db, "orders", `${userId}_${Date.now()}`);

  await runTransaction(db, async (tx) => {
    // Decrement stock atomically per product
    for (const item of items) {
      const productRef = doc(db, "products", item.productId);
      const snap = await tx.get(productRef);
      if (!snap.exists())
        throw new Error(`Product ${item.productId} not found`);
      const currentStock = snap.data().stock ?? 0;
      if (currentStock < item.qty)
        throw new Error(`Insufficient stock for ${item.name}`);
      tx.update(productRef, { stock: currentStock - item.qty });
    }

    tx.set(orderRef, {
      userId,
      items,
      subtotal,
      shipping,
      tax,
      total,
      address,
      paymentMethod,
      paymentStatus: "pending",
      status: "placed",
      trackingEvents: [
        {
          status: "placed",
          timestamp: new Date().toISOString(),
          note: "Order placed",
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return orderRef.id;
}

export const getOrder = (id) => getDocument("orders", id);

export const listUserOrders = (userId) =>
  queryCollection("orders", {
    filters: [{ field: "userId", op: "==", value: userId }],
    sort: { field: "createdAt", dir: "desc" },
  });

export const listAllOrders = (statusFilter) =>
  queryCollection("orders", {
    filters: statusFilter
      ? [{ field: "status", op: "==", value: statusFilter }]
      : [],
    sort: { field: "createdAt", dir: "desc" },
    pageSize: 50,
  });

export async function updateOrderStatus(orderId, status, note = "") {
  const order = await getDocument("orders", orderId);
  const trackingEvents = [
    ...(order?.trackingEvents || []),
    { status, timestamp: new Date().toISOString(), note },
  ];
  await updateDocument("orders", orderId, { status, trackingEvents });
}
