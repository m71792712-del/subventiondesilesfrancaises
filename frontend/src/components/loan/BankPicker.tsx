'use client';

import { useMemo } from 'react';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { useI18n } from '@/lib/i18n/provider';
import type { Bank } from '@/types/db';

interface Props {
  banks: Bank[];
  value: string;
  onChange: (id: string) => void;
  otherName: string;
  onOtherName: (name: string) => void;
  error?: string;
  otherError?: string;
}

/** Choix de la banque : simple liste déroulante (comme le motif), avec l'option « Autre banque ». */
export function BankPicker({ banks, value, onChange, otherName, onOtherName, error, otherError }: Props) {
  const { t, locale } = useI18n();
  const sorted = useMemo(() => [...banks].sort((a, b) => a.name.localeCompare(b.name, locale)), [banks, locale]);

  return (
    <div className="space-y-4">
      <SelectField label={t('req.bank')} required value={value} onChange={(e) => onChange(e.target.value)} error={error}>
        <option value="" disabled>{t('apply.bank.ph')}</option>
        {sorted.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        <option value="other">{t('apply.bank.other')}</option>
      </SelectField>

      {value === 'other' && (
        <TextField
          label={t('apply.bank.otherName')}
          placeholder={t('apply.bank.otherName')}
          value={otherName}
          onChange={(e) => onOtherName(e.target.value)}
          maxLength={100}
          required
          autoComplete="off"
          hint={t('apply.bank.otherHint')}
          error={otherError}
        />
      )}
      <p className="text-xs text-slate-500">{t('apply.bank.example')}</p>
    </div>
  );
}