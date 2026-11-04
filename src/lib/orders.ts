// Order statuses, shared by the customer pages and the team dashboard.
import type { OrderStatus } from "./types";

export const ORDER_STATUSES: { id: OrderStatus; label: string; customer: string; className: string }[] = [
  { id: "new", label: "New", customer: "We've received your order and will confirm the price and delivery time by email.", className: "bg-sky-100 text-sky-800" },
  { id: "confirmed", label: "Confirmed", customer: "Your order is confirmed and will go to print soon.", className: "bg-violet-100 text-violet-800" },
  { id: "printing", label: "Printing", customer: "Your book is being printed and bound.", className: "bg-amber-100 text-amber-800" },
  { id: "shipped", label: "Shipped", customer: "Your book is on its way.", className: "bg-emerald-100 text-emerald-800" },
  { id: "delivered", label: "Delivered", customer: "Your book has been delivered. Enjoy!", className: "bg-emerald-200 text-emerald-900" },
  { id: "cancelled", label: "Cancelled", customer: "This order was cancelled.", className: "bg-stone-200 text-stone-700" },
];

export const statusInfo = (s: OrderStatus) => ORDER_STATUSES.find((x) => x.id === s) ?? ORDER_STATUSES[0];

/** Orders still being worked on. Their photos must stay in storage. */
export const OPEN_STATUSES: OrderStatus[] = ["new", "confirmed", "printing", "shipped"];

export const MAX_ORDER_QUANTITY = 20;

export const orderNumber = (n: number) => `KS-${n}`;
