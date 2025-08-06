import { useEffect, useRef, useCallback } from 'react';

import { debounceTime, Subject, distinctUntilChanged, filter, map } from 'rxjs';

export const useDebounced = (
  debounceCallback = () => {},
  { delay = 1500 } = {},
) => {
  const subject = useRef(new Subject()).current;
  const valueObservable = useRef(
    subject.pipe(
      map(({ value }) => value),
      distinctUntilChanged(),
    ),
  ).current;
  const debounceObservable = useRef(
    subject.pipe(
      debounceTime(delay),
      filter((params) => params.debounce !== false),
      map((params) => params.value),
      distinctUntilChanged(),
    ),
  ).current;

  const setValue = useCallback(
    (value, { debounce } = {}) => subject.next({ value, debounce }),
    [subject],
  );

  useEffect(() => {
    const subscription = debounceObservable.subscribe((val) =>
      debounceCallback(val),
    );
    return () => subscription.unsubscribe();
  }, [debounceObservable, debounceCallback]);

  return [valueObservable, setValue];
};
