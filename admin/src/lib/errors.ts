/** Codes d'erreur du backend (docs/CONTRACT.md §5) -> messages français. Le message technique brut n'est jamais affiché. */
const MESSAGES: Record<string, string> = {
  not_authenticated: 'Votre session a expiré. Reconnectez-vous.',
  forbidden: 'Action réservée à l’administrateur (ou double authentification requise).',
  not_found: 'Élément introuvable.',
  invalid_status: 'Statut invalide.',
  invalid_comment: 'Le commentaire doit contenir entre 3 et 500 caractères.',
  status_unchanged: 'La demande a déjà ce statut.',
  invalid_action: 'Action invalide.',
  invalid_type: 'Type invalide (banque ou fintech).',
  already_reviewed: 'Cette suggestion a déjà été traitée.',
  bank_exists: 'Cette banque existe déjà : utilisez « Fusionner ».',
  invalid_bank: 'Banque invalide.',
  invalid_setting: 'Valeur de réglage invalide.',
  mfa_enrollment_required: 'La double authentification doit d’abord être activée.',
    user_not_found: 'Utilisateur introuvable (il a peut-être déjà été supprimé).',
  cannot_delete_self: 'Vous ne pouvez pas supprimer votre propre compte.',
  cannot_delete_admin: 'Le compte administrateur ne peut pas être supprimé.',
  invalid_user: 'Utilisateur invalide.',
};

/** Code d'erreur du backend contenu dans le message (le plus précis : « user_not_found » l'emporte sur « not_found »). */
export function backendCode(message: string | undefined | null): string | null {
  if (!message) return null;
  return Object.keys(MESSAGES).filter((c) => message.includes(c)).sort((a, b) => b.length - a.length)[0] ?? null;
}

export function backendMessage(message: string | undefined | null): string {
  const code = backendCode(message);
  return code ? MESSAGES[code]! : 'Une erreur est survenue. Réessayez.';
}