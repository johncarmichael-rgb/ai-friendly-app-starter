/**
 * Consumer/free email provider domains.
 * These domains can never be claimed as a company email domain — a company domain
 * routes future signups into that tenant, so allowing e.g. gmail.com would let one
 * company capture every Gmail user.
 *
 * IMPORTANT: This file is duplicated in apis/api-mono/api/src/constants/CONSUMER_EMAIL_DOMAINS.ts
 * Any changes here must be reflected there as well. The backend copy is authoritative.
 */
export const CONSUMER_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  'gmail.com',
  'googlemail.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'mail.com',
  'zoho.com',
  'mail.ru',
  'qq.com',
  '163.com',
  '126.com',
  'web.de',
  't-online.de',
  'comcast.net',
  'verizon.net',
  'att.net',
  'btinternet.com',
  'sky.com',
  'virginmedia.com',
  'orange.fr',
  'wanadoo.fr',
  'free.fr',
  'libero.it',
  'naver.com',
  'daum.net',
  'rediffmail.com',
]);

/**
 * Provider families that use many country-specific TLDs (hotmail.co.uk, yahoo.fr, ...).
 * Matched by prefix against the first label of the domain.
 */
export const CONSUMER_EMAIL_DOMAIN_FAMILIES: readonly string[] = [
  'hotmail.',
  'outlook.',
  'live.',
  'yahoo.',
  'ymail.',
  'gmx.',
  'yandex.',
];

/** Basic hostname shape: at least two labels, no leading/trailing hyphens, letters-only TLD. */
export const DOMAIN_FORMAT_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * True when the given domain belongs to a consumer/free email provider.
 * Expects a bare domain (e.g. "Gmail.com" or "hotmail.co.uk"); case-insensitive.
 */
export function isConsumerEmailDomain(domain: string): boolean {
  const normalized = domain.trim().toLowerCase();
  if (CONSUMER_EMAIL_DOMAINS.has(normalized)) {
    return true;
  }
  return CONSUMER_EMAIL_DOMAIN_FAMILIES.some((family) => normalized.startsWith(family));
}
