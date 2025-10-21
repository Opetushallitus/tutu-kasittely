/**
 * Unwraps nested field wrapper structures for optimistic cache updates.
 *
 * Handles the conversion:
 * { field: { field: value } } → { field: value }
 *
 * This is needed because:
 * - Frontend sends wrapped structure for backend deserialization
 * - Backend responds with unwrapped structure
 * - Optimistic updates must match backend format
 *
 * @param data Object containing potentially wrapped fields
 * @returns Object with unwrapped fields
 */
export function unwrapFieldWrappers<T extends Record<string, unknown>>(
  data: T,
): T {
  const unwrapped = { ...data } as Record<string, unknown>;

  Object.keys(data).forEach((key) => {
    const value = data[key];

    // If value is an object with the same key nested inside (wrapper pattern)
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      key in value
    ) {
      // Unwrap: { field: { field: innerValue } } → { field: innerValue }
      unwrapped[key] = (value as Record<string, unknown>)[key];
    } else {
      // Keep as-is
      unwrapped[key] = value;
    }
  });

  return unwrapped as T;
}
