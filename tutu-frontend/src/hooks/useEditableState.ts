'use client';

import { useEffect, useMemo, useState } from 'react';
import { isDeepEqual } from 'remeda';

/**
 * Hook for managing editable local state with change tracking
 *
 * This hook solves the common pattern of:
 * - Fetching data from the server
 * - Allowing the user to edit it locally
 * - Tracking whether there are unsaved changes
 * - Saving changes back to the server
 *
 * @param serverData - The current data from the server
 * @param onSave - Callback to save changes back to the server
 * @returns Object containing local state, update function, save function, and change tracking
 */
export type EditableState<T> = {
  editedData?: T;
  hasChanges: boolean;
  updateLocal: (newData: Partial<T>) => void;
  updateImmediately: (newData: Partial<T>) => void;
  save: () => void;
};

export const useEditableState = <T extends Record<string, unknown>>(
  serverData: T | undefined,
  onSave: (data: T) => void,
): EditableState<T> => {
  const [editedData, setEditedData] = useState<T | undefined>(serverData);

  // Sync server data to local state when it changes
  useEffect(() => {
    if (serverData) {
      setEditedData(serverData);
    }
  }, [serverData]);

  // Track if there are unsaved changes using deep equality
  const hasChanges = useMemo(() => {
    if (!serverData || !editedData) return false;
    return !isDeepEqual(serverData, editedData);
  }, [serverData, editedData]);

  // Update local state only (doesn't save to server)
  const updateLocal = (part: Partial<T>) => {
    setEditedData((prev) => {
      if (!prev) return prev;
      return { ...prev, ...part };
    });
  };

  // Save immediately to server but keep local edits
  const updateImmediately = (part: Partial<T>) => {
    if (!serverData) return;
    const oldState = editedData;
    onSave({ ...serverData, ...part });
    updateLocal({ ...oldState, ...part });
  };

  // Save changes to server
  const save = () => {
    if (hasChanges && editedData) {
      onSave(editedData);
    }
  };

  return {
    editedData,
    hasChanges,
    updateLocal,
    updateImmediately,
    save,
  };
};
