export const ACCESS_TOKEN_STORAGE_KEY = 'contendly_access_token';
export const ACCESS_CODE_STORAGE_KEY = 'contendly_access_code';
export const LEARNER_NAME_STORAGE_KEY = 'contendly_learner_name';
export const LEARNER_ID_STORAGE_KEY = 'contendly_learner_id';
export const DEFAULT_OPERATIVE_NAME = 'ALPHA-7';

type JwtPayload = {
  fullName?: string;
  accessCode?: string;
};

type LearnerSessionProfile = {
  id?: string;
  fullName?: string;
  accessCode?: string;
};

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

  if (profile?.id && profile.id.trim().length > 0) {
    sessionStorage.setItem(LEARNER_ID_STORAGE_KEY, profile.id.trim());
  }
}

export function hasLearnerSession(): boolean {
  return Boolean(sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));
}

export function clearLearnerSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
  sessionStorage.removeItem(LEARNER_NAME_STORAGE_KEY);
  sessionStorage.removeItem(LEARNER_ID_STORAGE_KEY);
}

export function getOperativeName(): string {
  const storedName = sessionStorage.getItem(LEARNER_NAME_STORAGE_KEY);
  return (storedName || DEFAULT_OPERATIVE_NAME).toUpperCase();
}

export function getLearnerId(): string | null {
  const learnerId = sessionStorage.getItem(LEARNER_ID_STORAGE_KEY);
  return learnerId && learnerId.trim().length > 0 ? learnerId : null;
}
