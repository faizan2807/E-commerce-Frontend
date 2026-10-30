
export const getProductImageUrl = (imageSrc?: string | string[]): string => {
    if (!imageSrc) {
        return "https://via.placeholder.com/300x300?text=No+Image";
    }

    const raw = Array.isArray(imageSrc) ? imageSrc[0] : imageSrc;
    if (!raw || typeof raw !== "string" || !raw.trim()) {
        return "https://via.placeholder.com/300x300?text=No+Image";
    }

    const trimmed = raw.trim();

    // Already a complete web URL or base64/blob
    if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("blob:") ||
        trimmed.startsWith("data:")
    ) {
        return trimmed;
    }

    // If it's a relative path like /assets/... in the frontend
    if (trimmed.startsWith("/assets/")) {
        return trimmed;
    }

    // Extract filename (handles legacy /../../publlic/images/filename.png or /images/filename.png)
    const filename = trimmed.split("/").pop();
    if (!filename) {
        return "https://via.placeholder.com/300x300?text=No+Image";
    }

    const backendBaseUrl =
        import.meta.env.VITE_BACKEND_URL || "https://e-commerce-backend-2-h21c.onrender.com";

    return `${backendBaseUrl}/images/${filename}`;
};
