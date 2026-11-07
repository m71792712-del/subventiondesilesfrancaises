import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/db';

/** Utilisateur vérifié auprès de Supabase Auth. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id,first_name,last_name,phone,email,role,demo_color,demo_city,demo_digit,created_at')
    .eq('id', user.id)
    .maybeSingle();
  return (data as Profile | null) ?? null;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}


/** Champ « Numéro » : 28 caractères max (lettres et chiffres, en majuscules), affichés par groupes de 4 : « XXXX XXXX … ». */
export const CODE_LENGTH = 28;
export function formatCode(input: string): string {
  const compact = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, CODE_LENGTH);
  return compact.replace(/(.{4})(?=.)/g, '$1 ');
}