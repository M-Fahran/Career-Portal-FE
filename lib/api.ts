const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getApiErrorMessage = async (res: Response): Promise<string> => {
  const payload: unknown = await res.json().catch(() => null);

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message;
  }

  return `Gagal memanggil API: ${res.status}`;
};

const refreshUserAccessToken = async (): Promise<string> => {
  const res = await fetch(`${BASE_URL}/auth/user/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new ApiError(await getApiErrorMessage(res), res.status);
  }

  const payload: unknown = await res.json();
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('data' in payload) ||
    typeof payload.data !== 'object' ||
    payload.data === null ||
    !('accessToken' in payload.data) ||
    typeof payload.data.accessToken !== 'string'
  ) {
    throw new ApiError('Respons refresh token tidak valid.', 500);
  }

  const accessToken = payload.data.accessToken;
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem('accessToken', accessToken);
  }

  return accessToken;
};

const refreshCandidateAccessToken = async (): Promise<string> => {
  const res = await fetch(`${BASE_URL}/auth/candidate/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new ApiError(await getApiErrorMessage(res), res.status);
  }

  const payload: unknown = await res.json();
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('data' in payload) ||
    typeof payload.data !== 'object' ||
    payload.data === null ||
    !('accessToken' in payload.data) ||
    typeof payload.data.accessToken !== 'string'
  ) {
    throw new ApiError('Respons refresh token tidak valid.', 500);
  }

  const accessToken = payload.data.accessToken;
  window.sessionStorage.setItem('accessToken', accessToken);
  return accessToken;
};

export async function apiGetCandidate<T = unknown>(path: string): Promise<T> {
  const sendRequest = (token?: string) =>
    fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

  const accessToken = window.sessionStorage.getItem('accessToken') ?? undefined;
  let res = await sendRequest(accessToken);
  if (res.status === 401 && accessToken) {
    res = await sendRequest(await refreshCandidateAccessToken());
  }
  if (!res.ok) {
    throw new ApiError(await getApiErrorMessage(res), res.status);
  }
  return res.json() as Promise<T>;
}

const candidateMutation = async <T>(path: string, init: RequestInit): Promise<T> => {
  const accessToken = window.sessionStorage.getItem('accessToken') ?? undefined;
  const sendRequest = (token?: string) => {
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    });
  };

  let res = await sendRequest(accessToken);
  if (res.status === 401 && accessToken) {
    res = await sendRequest(await refreshCandidateAccessToken());
  }
  if (!res.ok) {
    throw new ApiError(await getApiErrorMessage(res), res.status);
  }
  return res.json() as Promise<T>;
};

export async function apiPostCandidate<T>(path: string, data: unknown): Promise<T> {
  return candidateMutation<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function apiPutCandidate<T>(path: string, data: unknown): Promise<T> {
  return candidateMutation<T>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function apiUploadCandidate<T>(path: string, file: File, field = 'resume'): Promise<T> {
  const body = new FormData();
  body.append(field, file);
  return candidateMutation<T>(path, { method: 'POST', body });
}

export async function apiPutUploadCandidate<T>(path: string, body: FormData): Promise<T> {
  return candidateMutation<T>(path, { method: 'PUT', body });
}

export async function apiDeleteCandidate<T = unknown>(path: string): Promise<T> {
  return candidateMutation<T>(path, { method: 'DELETE' });
}

export async function apiGetCandidateBlob(path: string): Promise<Blob> {
  const accessToken = window.sessionStorage.getItem('accessToken') ?? undefined;
  const sendRequest = (token?: string) =>
    fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

  let res = await sendRequest(accessToken);
  if (res.status === 401 && accessToken) {
    res = await sendRequest(await refreshCandidateAccessToken());
  }
  if (!res.ok) {
    throw new ApiError(await getApiErrorMessage(res), res.status);
  }
  return res.blob();
}

export async function apiGet<T = unknown>(
  path: string,
  accessToken?: string,
): Promise<T> {
  const sendRequest = (token?: string) =>
    fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

  let res = await sendRequest(accessToken);
  if (res.status === 401 && accessToken) {
    const refreshedToken = await refreshUserAccessToken();
    res = await sendRequest(refreshedToken);
  }

  if (!res.ok) {
    throw new ApiError(await getApiErrorMessage(res), res.status);
  }

  return res.json() as Promise<T>;
}

export async function apiGetBlob(path: string): Promise<Blob> {
  const accessToken =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('accessToken') ?? undefined
      : undefined;
  const sendRequest = (token?: string) =>
    fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

  let res = await sendRequest(accessToken);
  if (res.status === 401 && accessToken) {
    res = await sendRequest(await refreshUserAccessToken());
  }

  if (!res.ok) {
    throw new ApiError(await getApiErrorMessage(res), res.status);
  }

  return res.blob();
}

const authenticatedMutation = async <T>(
  path: string,
  init: RequestInit,
): Promise<T> => {
  const accessToken =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('accessToken') ?? undefined
      : undefined;

  const sendRequest = (token?: string) => {
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', 'Bearer ' + token);
    }
    return fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    });
  };

  let res = await sendRequest(accessToken);
  if (res.status === 401 && accessToken) {
    res = await sendRequest(await refreshUserAccessToken());
  }

  if (!res.ok) {
    throw new ApiError(await getApiErrorMessage(res), res.status);
  }

  return res.json() as Promise<T>;
};

export async function apiPut<T>(
  path: string,
  data: unknown,
): Promise<T> {
  return authenticatedMutation<T>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function apiPostAuthenticated<T>(
  path: string,
  data: unknown,
): Promise<T> {
  return authenticatedMutation<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  return authenticatedMutation<T>(path, { method: 'DELETE' });
}

export async function apiPost<T>(
  path: string,
  data: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    const payload: unknown = await res.json();

    if (!res.ok) {
      const message =
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string'
          ? payload.message
          : `Gagal memanggil API: ${res.status}`;

      throw new Error(message);
    }

    return payload as T;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Permintaan ke server terlalu lama. Pastikan backend dan database berjalan, lalu coba lagi.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}