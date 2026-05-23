import axios from 'axios';
import { getApiBaseUrl } from '@/lib/auth';

interface LoginResponse {
  accessToken: string;
}

export interface LearnerMeResponse {
  id: string;
  fullName: string;
  accessCode: string;
  createdAt: string;
}

export type AuthErrorCode =
  | 'AUTH_INVALID_CODE'
  | 'AUTH_NETWORK_ERROR'
  | 'AUTH_TOKEN_MISSING'
  | 'AUTH_REQUEST_FAILED';

export async function loginLearner(accessCode: string): Promise<string> {
  try {
    const response = await axios.post<LoginResponse>(
      `${getApiBaseUrl()}/learners/login`,
      { accessCode },
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const data = response.data;

    if (!data.accessToken || typeof data.accessToken !== 'string') {
      throw new Error('AUTH_TOKEN_MISSING');
    }

    return data.accessToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('AUTH_INVALID_CODE');
      }

      if (!error.response) {
        throw new Error('AUTH_NETWORK_ERROR');
      }

      throw new Error('AUTH_REQUEST_FAILED');
    }

    if (error instanceof Error && error.message === 'AUTH_TOKEN_MISSING') {
      throw error;
    }

    throw new Error('AUTH_REQUEST_FAILED');
  }
}

export async function getLearnerMe(accessToken: string): Promise<LearnerMeResponse> {
  try {
    const response = await axios.get<LearnerMeResponse>(`${getApiBaseUrl()}/learners/me`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      timeout: 15000
    });

    const data = response.data;
    const hasValidPayload =
      typeof data?.id === 'string' &&
      typeof data?.fullName === 'string' &&
      typeof data?.accessCode === 'string' &&
      typeof data?.createdAt === 'string';

    if (!hasValidPayload) {
      throw new Error('AUTH_REQUEST_FAILED');
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('AUTH_NETWORK_ERROR');
      }

      throw new Error('AUTH_REQUEST_FAILED');
    }

    if (error instanceof Error && error.message === 'AUTH_REQUEST_FAILED') {
      throw error;
    }

    throw new Error('AUTH_REQUEST_FAILED');
  }
}
