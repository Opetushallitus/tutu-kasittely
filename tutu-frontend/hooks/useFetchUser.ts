'use client';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types/common';
import { doApiFetch } from '@/lib/tutu-backend/api';

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
