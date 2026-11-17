'use client';

import { useMemo } from 'react';
import { SelectField } from '@/components/ui/SelectField';

import { useI18n } from '@/lib/i18n/provider';
import type { Bank } from '@/types/db';

interface Props {
  banks: Bank[];
  value: string;
  onChange: (id: string) => void;


  error?: string;

}

/** Choix de la banque : uniquement les banques de la liste et celle ajouté par l'admin */
export function BankPicker({ banks, value, onChange, error, }: Props) {
  const { t, locale } = useI18n();
  const sorted = useMemo(() => [...banks].sort((a, b) => a.name.localeCompare(b.name, locale)), [banks, locale]);

  return (
    <div className="space-y-4">
      <SelectField label={t('req.bank')} required value={value} onChange={(e) => onChange(e.target.value)} error={error}>
        <option value="" disabled>{t('apply.bank.ph')}</option>
        {sorted.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}

      </SelectField>

      
      
      <p className="text-xs text-slate-500">{t('apply.bank.example')}</p>
    </div>
  );
}