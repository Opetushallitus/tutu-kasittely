'use client';

let authRedirectConfirmHandler: null | (() => Promise<boolean>) = null;

export const registerAuthRedirectConfirmHandler = (
  handler: (() => Promise<boolean>) | null,
) => {
  authRedirectConfirmHandler = handler;
};

export const requestAuthRedirectConfirm = async () => {
  if (!authRedirectConfirmHandler) {
    return true;
  }

  return authRedirectConfirmHandler();
};
