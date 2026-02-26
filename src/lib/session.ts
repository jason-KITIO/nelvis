import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload?.userId) return null;
  
  return { userId: payload.userId as string };
}
