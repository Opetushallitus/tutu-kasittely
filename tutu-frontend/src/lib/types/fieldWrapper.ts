/**
 * Generic wrapper for field values to create nested object structure for backend deserialization.
 *
 * The backend expects fields wrapped in a NESTED object structure to distinguish between:
 * - undefined (field not in update)
 * - null (field explicitly cleared)
 * - value (field has value)
 *
 * Returns: { fieldName: { fieldName: value } }
 *
 * @example
 * wrapField('virallinenTutkinto', true)
 * // Returns: { virallinenTutkinto: { virallinenTutkinto: true } }
 *
 * wrapField('virallinenTutkinto', null)
 * // Returns: { virallinenTutkinto: { virallinenTutkinto: null } }
 */
export function wrapField<T>(
  fieldName: string,
  value: T,
): Record<string, Record<string, T>> {
  return {
    [fieldName]: { [fieldName]: value },
  };
}
