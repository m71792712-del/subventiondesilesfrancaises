'use client';

import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { useI18n } from '@/lib/i18n/provider';
import type { CardType } from '@/types/db';

interface Props {
  cardTypes: CardType[];
  value: string; // uuid, « other », ou chaîne vide pour « aucun »
  onChange: (id: string) => void;
  otherName: string;
  onOtherName: (name: string) => void;
  error?: string;
  otherError?: string;
}

/** Choix du type de carte : simple liste déroulante (facultatif : « Aucun » et « Autre carte » restent disponibles). */
export function CardPicker({ cardTypes, value, onChange, otherName, onOtherName, error, otherError }: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <SelectField label={`${t('apply.card')} (${t('common.optional')})`} value={value} onChange={(e) => onChange(e.target.value)} error={error}>
        <option value="">{t('apply.card.none')}</option>
        {cardTypes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        <option value="other">{t('apply.card.other')}</option>
      </SelectField>

      {value === 'other' && (
        <TextField
          label={t('apply.card.otherName')}
          placeholder={t('apply.card.otherName')}
          value={otherName}
          onChange={(e) => onOtherName(e.target.value)}
          maxLength={60}
          required
          autoComplete="off"
          error={otherError}
        />
      )}
    </div>
  );
}