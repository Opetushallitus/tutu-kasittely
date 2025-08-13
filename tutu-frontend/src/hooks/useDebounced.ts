import { useEffect, useRef, useCallback } from 'react';

import {
  debounceTime,
  Subject,
  Observable,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs';

/* ----- */
/* Types */

/* Internal */
interface WrappedValue<A> {
  debounce: boolean | undefined;
  value: A;
}

/* Types in */
export type DebounceCallback<A> = (value: A) => void;
export interface DebounceOptions {
  delay?: number;
}

/* Types out */
export { Observable } from 'rxjs';
export type DebounceSetValue<A> = (
  value: A,
  options?: DebounceSetValueOptions,
) => void;
export interface DebounceSetValueOptions {
  debounce?: boolean | undefined;
}

/* ---- */
/* Hook */

export function useDebounced<A>(
  debounceCallback: DebounceCallback<A> = () => {},
  { delay = 1500 }: DebounceOptions = {},
): [Observable<A>, DebounceSetValue<A>] {
  const subject = useRef(new Subject<WrappedValue<A>>()).current;
  const valueObservable: Observable<A> = useRef(
    subject.pipe(
      map((params) => params.value),
      distinctUntilChanged(),
    ),
  ).current;
  const debounceObservable: Observable<A> = useRef(
    subject.pipe(
      debounceTime(delay),
      filter((params) => params.debounce !== false),
      map((params) => params.value),
      distinctUntilChanged(),
    ),
  ).current;

  const setValue: DebounceSetValue<A> = useCallback(
    (value, { debounce } = {}) => {
      const wrappedValue: WrappedValue<A> = { value, debounce };
      subject.next(wrappedValue);
    },
    [subject],
  );

  useEffect(() => {
    const subscription = debounceObservable.subscribe((val) =>
      debounceCallback(val),
    );
    return () => subscription.unsubscribe();
  }, [debounceObservable, debounceCallback]);

  return [valueObservable, setValue];
}
