/**
 * API Client for FastAPI Enterprise
 * This utility provides helper functions to call the FastAPI Enterprise API
 * from both client-side and server-side code
 */

/**
 * Get the API base URL based on the environment
 * - On server-side: uses internal URL (enterprise-api:8000 in Docker)
 * - On client-side: uses public URL (localhost:8000)
 */
export function getApiBaseUrl(isServer: boolean = typeof window === 'undefined'): string {
  if (isServer) {
    // Server-side requests (from Next.js server, server components, API routes)
    // Use internal Docker network name or process.env.API_INTERNAL_BASE_URL
    const internalUrl = process.env.API_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    return internalUrl || 'http://enterprise-api:8000';
  }

  // Client-side requests (from browser)
  // Use public URL or environment variable
  const publicUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  return publicUrl;
}

/**
 * Generic fetch wrapper for API calls
 */
export async function fetchFromApi<T>(
  endpoint: string,
  options: RequestInit = {},
  isServer?: boolean
): Promise<T> {
  const baseUrl = getApiBaseUrl(isServer);
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * GET request to API
 */
export async function apiGet<T>(endpoint: string, isServer?: boolean): Promise<T> {
  return fetchFromApi<T>(endpoint, { method: 'GET' }, isServer);
}

/**
 * POST request to API
 */
export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  isServer?: boolean
): Promise<T> {
  return fetchFromApi<T>(
    endpoint,
    {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    },
    isServer
  );
}

/**
 * PUT request to API
 */
export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
  isServer?: boolean
): Promise<T> {
  return fetchFromApi<T>(
    endpoint,
    {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    },
    isServer
  );
}

/**
 * DELETE request to API
 */
export async function apiDelete<T>(endpoint: string, isServer?: boolean): Promise<T> {
  return fetchFromApi<T>(endpoint, { method: 'DELETE' }, isServer);
}

/**
 * PATCH request to API
 */
export async function apiPatch<T>(
  endpoint: string,
  data?: unknown,
  isServer?: boolean
): Promise<T> {
  return fetchFromApi<T>(
    endpoint,
    {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    },
    isServer
  );
}
