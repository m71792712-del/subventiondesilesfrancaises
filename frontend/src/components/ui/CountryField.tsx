'use client';

import { useId } from 'react';
import { MapPin } from 'lucide-react';
import { COUNTRIES } from '@/lib/constants/countries';
import { useI18n } from '@/lib/i18n/provider';
import { TextField } from './TextField';

interface Props {
  name: string;
  defaultValue?: string | null;
  error?: string;
  required?: boolean;
}

/** Champ « Pays » : liste de suggestions, mais on peut aussi écrire directement le nom. */
export function CountryField({ name, defaultValue, error, required }: Props) {
  const { t } = useI18n();
  const listId = useId();
  return (
    <>
      <TextField
        name={name}
        icon={MapPin}
        label={t('auth.demoCity')}
        placeholder={t('ph.city')}
        autoComplete="off"
        list={listId}
        required={required}
        maxLength={60}
        defaultValue={defaultValue ?? ''}
        error={error}
      />
      <datalist id={listId}>
        {COUNTRIES.map((c) => <option key={c} value={c} />)}
      </datalist>
    </>
  );
}