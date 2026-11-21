import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { EmptyState, PageHeader, Pagination } from '@/components/ui';
import type { UserRow } from '@/lib/types';
import { escapeLike, formatDate, one, PAGE_SIZE, parsePage } from '@/lib/utils';
import { deleteUserAction } from '@/lib/actions';
import { backendMessage } from '@/lib/errors';

export const metadata = { title: 'Utilisateurs' };

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = escapeLike(one(sp.q) ?? '');

  const supabase = await createClient();
  let query = supabase
    .from('profiles')
    .select('id,first_name,last_name,email,phone,role,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data, count } = await query;
  const users = (data ?? []) as UserRow[];

  return (
    <>
      <PageHeader title="Utilisateurs" subtitle="Cliquez sur un nom pour voir toutes les informations saisies et ses demandes" />
      {one(sp.deleted) === '1' && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">Utilisateur supprimé.</p>}
      {one(sp.error) && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-800">{backendMessage(one(sp.error))}</p>}
      <form method="get" className="card mb-5 flex flex-wrap items-end gap-3 !p-4">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="q" className="label">Rechercher (nom, prénom ou e-mail)</label>
          <input id="q" name="q" defaultValue={q} maxLength={60} className="input" />
        </div>
        <button className="btn btn-primary">Rechercher</button>
      </form>

      {users.length === 0 ? (
        <EmptyState text="Aucun utilisateur trouvé." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-sky-100 bg-white shadow-soft">
          <table className="w-full">
            <thead className="border-b border-slate-100"><tr><th className="th">Nom</th><th className="th">E-mail</th><th className="th">Téléphone</th><th className="th">Rôle</th><th className="th">Inscription</th><th className="th"><span className="sr-only">Action</span></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="td font-medium"><Link className="text-ocean-600 hover:underline" href={`/users/${u.id}`}>{u.first_name} {u.last_name}</Link></td>
                  <td className="td">{u.email}</td>
                  <td className="td whitespace-nowrap">{u.phone || '—'}</td>
                  <td className="td">{u.role === 'admin' ? <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-800">Admin</span> : 'Utilisateur'}</td>
                  <td className="td whitespace-nowrap">{formatDate(u.created_at, false)}</td>
                  <td className="td whitespace-nowrap text-right">
                    {u.role === 'admin' ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <form action={deleteUserAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="q" value={q} />
                        <input type="hidden" name="page" value={page} />
                        <button className="btn btn-danger btn-sm">Supprimer</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} total={count ?? 0} pageSize={PAGE_SIZE} basePath="/users" params={{ q }} />
    </>
  );
}
