/**
 * Resolves a product image into a displayable browser URL.
 * Handles:
 * - Full URLs: http://localhost:5000/images/foo.png
 * - Relative paths or legacy filesystem paths: /../../publlic/images/foo.png -> http://localhost:5000/images/foo.png
 * - Image arrays or single strings
 * - Missing / broken images with fallback placeholder
 */
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

    return `http://localhost:5000/images/${filename}`;
};
