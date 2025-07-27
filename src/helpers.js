export function isNumber(value) {
  if (!value || typeof value !== "string") return false;
  return Number.isInteger(Number(value));
}

export function isNumberInRange(value, min, max) {
  return isNumber(value) && min <= value && value < max;
}
