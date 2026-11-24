const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const { body, signal, ...rest } = options;
  const headers = { ...rest.headers };

  // Set Content-Type header ONLY when there is a body
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    signal,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function fetchBooks(params = {}, signal) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return request(qs ? `/api/books?${qs}` : "/api/books", { signal });
}

export function fetchStats(signal) {
  return request("/api/stats", { signal });
}

export function createBook(bookData) {
  return request("/api/books", {
    method: "POST",
    body: bookData
  });
}

export function updateBook(id, bookData) {
  return request(`/api/books/${id}`, {
    method: "PUT",
    body: bookData
  });
}

export function patchBook(id, partialData) {
  return request(`/api/books/${id}`, {
    method: "PATCH",
    body: partialData
  });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, {
    method: "DELETE"
  });
}