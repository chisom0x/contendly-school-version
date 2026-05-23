export const ACCESS_TOKEN_STORAGE_KEY = 'contendly_access_token';
export const ACCESS_CODE_STORAGE_KEY = 'contendly_access_code';
export const LEARNER_NAME_STORAGE_KEY = 'contendly_learner_name';
export const LEARNER_ID_STORAGE_KEY = 'contendly_learner_id';
export const SESSION_EXPIRES_AT_STORAGE_KEY = 'contendly_session_expires_at';
export const DEFAULT_OPERATIVE_NAME = 'ALPHA-7';
export const SESSION_DURATION_MINUTES = 30;
const SESSION_DURATION_MS = SESSION_DURATION_MINUTES * 60_000;

type JwtPayload = {
  fullName?: string;
  accessCode?: string;
};

type LearnerSessionProfile = {
  id?: string;
  fullName?: string;
  accessCode?: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.contendly.io/';
  return baseUrl.replace(/\/+$/, '');
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadSegment = token.split('.')[1];

    if (!payloadSegment) {
      return null;
    }

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function persistLearnerSession(
  accessCode: string,
  accessToken: string,
  profile?: LearnerSessionProfile
) {
  if (!isBrowser()) {
    return;
  }

  const payload = decodeJwtPayload(accessToken);
  const fullName =
    profile?.fullName && profile.fullName.trim().length > 0
      ? profile.fullName.trim()
      : payload?.fullName && payload.fullName.trim().length > 0
        ? payload.fullName.trim()
        : DEFAULT_OPERATIVE_NAME;
  const codeFromToken =
    profile?.accessCode && profile.accessCode.trim().length > 0
      ? profile.accessCode.trim()
      : payload?.accessCode && payload.accessCode.trim().length > 0
        ? payload.accessCode.trim()
        : accessCode;

  sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  sessionStorage.setItem(ACCESS_CODE_STORAGE_KEY, codeFromToken);
  sessionStorage.setItem(LEARNER_NAME_STORAGE_KEY, fullName);
  sessionStorage.setItem(SESSION_EXPIRES_AT_STORAGE_KEY, String(Date.now() + SESSION_DURATION_MS));

  if (profile?.id && profile.id.trim().length > 0) {
    sessionStorage.setItem(LEARNER_ID_STORAGE_KEY, profile.id.trim());
  }
}

export function hasLearnerSession(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const expiresAtRaw = sessionStorage.getItem(SESSION_EXPIRES_AT_STORAGE_KEY);

  if (!accessToken || !expiresAtRaw) {
    return false;
  }

  const expiresAt = Number.parseInt(expiresAtRaw, 10);

  if (!Number.isFinite(expiresAt)) {
    clearLearnerSession();
    return false;
  }

  if (Date.now() >= expiresAt) {
    clearLearnerSession();
    return false;
  }

  return true;
}

export function getSessionExpiryTimestamp(): number | null {
  if (!isBrowser()) {
    return null;
  }

  const expiresAtRaw = sessionStorage.getItem(SESSION_EXPIRES_AT_STORAGE_KEY);

  if (!expiresAtRaw) {
    return null;
  }

  const expiresAt = Number.parseInt(expiresAtRaw, 10);
  return Number.isFinite(expiresAt) ? expiresAt : null;
}

export function getSessionRemainingMs(): number {
  const expiresAt = getSessionExpiryTimestamp();

  if (expiresAt === null) {
    return 0;
  }

  return Math.max(expiresAt - Date.now(), 0);
}

export function clearLearnerSession() {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
  sessionStorage.removeItem(LEARNER_NAME_STORAGE_KEY);
  sessionStorage.removeItem(LEARNER_ID_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_EXPIRES_AT_STORAGE_KEY);
}

export function getOperativeName(): string {
  if (!isBrowser()) {
    return DEFAULT_OPERATIVE_NAME;
  }

  const storedName = sessionStorage.getItem(LEARNER_NAME_STORAGE_KEY);
  return (storedName || DEFAULT_OPERATIVE_NAME).toUpperCase();
}

export function getLearnerId(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const learnerId = sessionStorage.getItem(LEARNER_ID_STORAGE_KEY);
  return learnerId && learnerId.trim().length > 0 ? learnerId : null;
}
