import { HttpStatus } from "@nestjs/common";

const httpStatusDescriptions: Map<HttpStatus, string> = new Map<HttpStatus, string>();

function formatStatusDescription(status: HttpStatus): string {
    return HttpStatus[status]
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Returns a human-readable description for a given HTTP status code.
 * 
 * If the description for the provided status code is not already cached,
 * it will be generated, formatted, and stored for future use.
 * 
 * @param status - The HTTP status code from the `HttpStatus` enum.
 * @returns The formatted description of the HTTP status, or 'Unknown Status' if not found.
 */
export function getHttpStatusDescription(status: HttpStatus): string {
    if (!httpStatusDescriptions.has(status)) {
        const description = formatStatusDescription(status);
        httpStatusDescriptions.set(status, description);
    }
    
    return httpStatusDescriptions.get(status) || 'Unknown Status';
}