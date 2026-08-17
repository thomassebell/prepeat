// Turns the raw technical errors from Supabase and the network stack into
// plain language for the onboarding banners (backlog: "translate the common
// cases – offline, wrong code, expired code – to plain language"). Messages
// the app throws itself (household.ts, auth.ts) are already friendly and pass
// through unchanged.

import { t } from '@/lib/i18n';

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err != null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return '';
}

// ⚠️ ONLY THE THREE REWRITES BELOW AND THIS FALLBACK ARE TRANSLATED. Anything
// this function does not recognise is returned as the app wrote it – so a
// message thrown by household.ts or auth.ts still comes back in English until
// those screens are translated too. It matches the raw text against ENGLISH
// technical strings from Supabase and the network stack, which are not
// localised and must not be.
const GENERIC = () => t('errors.generic');

/**
 * Map a caught error to a sentence a non-technical person can act on. Known
 * technical strings (network drop, expired sign-in code, rate limit) are
 * rewritten; anything else – including the app's own already-plain messages –
 * is returned as-is, with a generic fallback for an empty error.
 */
export function friendlyError(err: unknown): string {
  const raw = messageOf(err);
  const text = raw.toLowerCase();

  // No connection – the most common real failure. React Native surfaces it a
  // few different ways depending on platform and where the request died.
  if (
    /network request failed|network connection was lost|connection appears to be offline|fetch failed|failed to fetch|network error|could not connect/.test(
      text,
    )
  ) {
    return t('errors.offline');
  }

  // A sign-in code that's wrong or past its window (Supabase OTP verify).
  if (/token has expired or is invalid|otp_expired|invalid token|token is invalid|expired or is invalid/.test(text)) {
    return t('errors.badCode');
  }

  // Supabase rate-limits code requests (once per 60s) and verify attempts.
  if (/for security purposes|once every|rate limit|too many requests/.test(text)) {
    return t('errors.rateLimited');
  }

  return raw.trim().length === 0 ? GENERIC() : raw;
}
