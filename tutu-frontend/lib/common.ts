class CustomError extends Error {
  constructor(message?: string) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class FetchError extends CustomError {
  response: Response;
  constructor(response: Response, message: string = 'Fetch error') {
    super(message);
    this.response = response;
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const isServer = typeof window === 'undefined';
