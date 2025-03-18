import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp)); // Convert bigint to number
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", // e.g., Monday
    year: "numeric", // e.g., 2025
    month: "long", // e.g., March
    day: "numeric", // e.g., 11
    hour: "2-digit", // e.g., 08 PM
    minute: "2-digit", // e.g., 30
    second: "2-digit", // e.g., 15
    timeZoneName: "short", // e.g., GMT
  }).format(date);
}

// Output: "Monday, March 11, 2025, 08:00:00 PM GMT"
