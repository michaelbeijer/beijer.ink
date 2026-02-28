import api from './client';

export async function login(password: string): Promise<string> {
  const { data } = await api.post<{ token: string }>('/auth/login', { password });
  return data.token;
}

export async function verifyToken(): Promise<boolean> {
  try {
    await api.get('/auth/verify');
    return true;
  } catch {
    return false;
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/auth/password', { currentPassword, newPassword });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, newPassword });
}
