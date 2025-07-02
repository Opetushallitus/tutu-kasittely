export class FetchError extends Error {
  response: Response;
  origin: string;
  constructor(
    response: Response,
    origin: string,
    message: string = 'Fetch error',
  ) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FetchError.prototype);
    this.response = response;
    this.origin = origin;
  }
}

const UNAUTHORIZED_MESSAGE =
  'Ei riittäviä käyttöoikeuksia.\n\n Otillräckliga användarrättigheter. \n\n No access rights.';

export class PermissionError extends Error {
  constructor(message: string = UNAUTHORIZED_MESSAGE) {
    super(message);
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const isServer = typeof window === 'undefined';
