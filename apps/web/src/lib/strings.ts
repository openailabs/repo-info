export function arrayToString(arr: string[] | string | undefined): string {
  if (typeof arr === "string" || arr === undefined) {
    return arr!;
  }
  return arr[0]!;
}
