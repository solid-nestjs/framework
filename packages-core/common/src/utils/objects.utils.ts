/**
 * Removes properties with `null` or `undefined` values from each object in the provided array.
 *
 * @param array - An array of objects to process.
 * @returns A new array of objects with all `null` or `undefined` properties removed.
 */
export function removeNullish(array) {
  return array.map(obj =>
    Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => value != null),
    ),
  );
}
