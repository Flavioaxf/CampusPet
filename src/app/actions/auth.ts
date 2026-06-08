'use server';

import { cookies } from 'next/headers';
import { authService } from '@/services/AuthService';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  try {
    const token = await authService.login(email, password);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    return { error: message };
  }
}
