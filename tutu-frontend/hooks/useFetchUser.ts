'use client';
import { useEffect, useState } from 'react';

import { doApiFetch } from '@/lib/tutu-backend/api';
import { User } from '@/lib/types/user';

export type UserResponse = {
  user: User;
};

export function useFetchUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    async function fetchUser() {
      const { user }: UserResponse = await doApiFetch(
        'user',
        undefined,
        'no-store',
      );
      setUser(user);
    }
    fetchUser();
  }, []);
  return user;
}
