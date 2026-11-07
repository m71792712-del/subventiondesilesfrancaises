'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { COUNTRIES } from '@/lib/constants/countries';
import { useI18n } from '@/lib/i18n/provider';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

interface Props {
  name: string;
  defaultValue?: string | null;
  error?: string;
  required?: boolean;
}

const OTHER = '__other__';

/** Champ « Pays » : liste déroulante (comme les banques), avec une option « Autre » pour écrire directement le nom. */
export function CountryField({ name, defaultValue, error, required }: Props) {
  const { t } = useI18n();
  const initial = (defaultValue ?? '').trim();
  const isKnown = (COUNTRIES as readonly string[]).includes(initial);

  const [choice, setChoice] = useState<string>(isKnown ? initial : initial ? OTHER : '');
  const [custom, setCustom] = useState<string>(isKnown ? '' : initial);
  const value = choice === OTHER ? custom : choice;

  return (
    <div className="space-y-4">
      <SelectField
        label={t('auth.demoCity')}
        required={required}
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
        error={choice === OTHER ? undefined : error}
      >
        <option value="" disabled={required}>{t('auth.country.ph')}</option>
        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        <option value={OTHER}>{t('auth.country.other')}</option>
      </SelectField>

      {choice === OTHER && (
        <TextField
          icon={MapPin}
          label={t('auth.country.otherName')}
          placeholder={t('auth.country.otherName')}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          maxLength={60}
          required
          autoComplete="off"
          error={error}
        />
      )}

      {/* Valeur réellement envoyée au serveur : le pays choisi, ou le nom écrit. */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}