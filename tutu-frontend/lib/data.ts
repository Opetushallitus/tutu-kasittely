import { ASIOINTIKIELI_URL } from '@/lib/configuration';
import { makeRequest } from './http-client';

export async function fetchAsiointikieli() {
  const res = await makeRequest(ASIOINTIKIELI_URL, {
    next: { revalidate: 60 * 60 },
  });
  return res.data;
}
