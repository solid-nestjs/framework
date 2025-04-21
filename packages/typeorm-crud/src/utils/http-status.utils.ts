import { HttpStatus } from "@nestjs/common";

const httpStatusDescriptions: Map<HttpStatus, string> = new Map<HttpStatus, string>();

function formatStatusDescription(status: HttpStatus): string {
    return HttpStatus[status]
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

export function getHttpStatusDescription(status: HttpStatus): string {
    if (!httpStatusDescriptions.has(status)) {
        const description = formatStatusDescription(status);
        httpStatusDescriptions.set(status, description);
    }
    
    return httpStatusDescriptions.get(status) || 'Unknown Status';
}