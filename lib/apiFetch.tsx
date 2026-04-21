// lib/apiFetch.ts
import { redirect } from "next/navigation";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

function clearAuth() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
}

async function refreshAccessToken(): Promise<string | null> {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return null;

    const res = await fetch(`${BASE_URL}${API_VERSION}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newToken = data?.access;
    if (newToken) localStorage.setItem("access_token", newToken);
    return newToken ?? null;
}

export async function apiFetch(
    path: string,
    options: RequestInit = {},
    onUnauthenticated?: () => void
): Promise<Response> {
    const token = localStorage.getItem("access_token");

    const makeRequest = (t: string | null) =>
        fetch(`${BASE_URL}${API_VERSION}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(t ? { Authorization: `Bearer ${t}` } : {}),
                ...options.headers,
            },
        });

    let res = await makeRequest(token);

    // Token expired — try refresh once
    if (res.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
            // Retry original request with fresh token
            res = await makeRequest(newToken);
        }

        // Refresh also failed — log out
        if (res.status === 401) {
            clearAuth();
            onUnauthenticated?.();
            window.location.href = "/login"; // hard redirect, clears all state
        }
    }

    return res;
}