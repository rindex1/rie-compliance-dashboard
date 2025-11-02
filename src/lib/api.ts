/**
 * Helper function to make authenticated API calls
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  token: string | null
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers,
  });
}


