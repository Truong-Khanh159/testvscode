export async function getCsrfToken() {
  const response = await fetch("/api/csrf", { cache: "no-store" });
  const body = await response.json();
  return String(body.token);
}

export async function csrfFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await getCsrfToken();
  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      "x-csrf-token": token
    }
  });
}
