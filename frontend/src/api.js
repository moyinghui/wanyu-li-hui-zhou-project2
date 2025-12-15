// Use relative path in production, absolute in development
const API_BASE = import.meta.env.PROD ? "" : "http://localhost:5050";

export async function apiFetch(path, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            ...options,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || `Request failed with status ${res.status}`);
        }
        return data;
    } catch (error) {
        // Handle network errors (fetch failed, CORS, server not running, etc.)
        if (error instanceof TypeError) {
            // This usually means fetch failed (network error, CORS, server down, etc.)
            const isNetworkError = 
                error.message.includes("fetch") || 
                error.message.includes("Failed to fetch") ||
                error.message.includes("NetworkError") ||
                error.message.includes("Network request failed");
            
            if (isNetworkError) {
                throw new Error("Cannot connect to server. Please ensure the backend server is running and accessible.");
            }
        }
        // Re-throw the error (could be our Error object or other errors)
        throw error;
    }
}
