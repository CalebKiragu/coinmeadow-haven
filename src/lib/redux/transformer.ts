import { createTransform } from "redux-persist";

function isBigInt(value: any): value is bigint {
  return typeof value === "bigint";
}

function deepSerialize(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepSerialize);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, deepSerialize(v)])
    );
  }
  return isBigInt(obj) ? obj.toString() : obj;
}

function deepDeserialize(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepDeserialize);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        typeof v === "string" && /^\d+n?$/.test(v)
          ? BigInt(v)
          : deepDeserialize(v),
      ])
    );
  }
  return obj;
}

export const fullTransform = createTransform(
  (inboundState) => deepSerialize(inboundState),
  (outboundState) => deepDeserialize(outboundState)
);
