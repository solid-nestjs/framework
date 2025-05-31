import { HttpStatus } from '@nestjs/common';
import { getHttpStatusDescription } from '../../src/utils/http-status.utils';

describe('HttpStatusUtils', () => {
  describe('getHttpStatusDescription', () => {
    it('should return correct description for standard HTTP status codes', () => {
      const testCases = [
        { status: HttpStatus.OK, expected: 'Ok' },
        { status: HttpStatus.CREATED, expected: 'Created' },
        { status: HttpStatus.BAD_REQUEST, expected: 'Bad Request' },
        { status: HttpStatus.UNAUTHORIZED, expected: 'Unauthorized' },
        { status: HttpStatus.FORBIDDEN, expected: 'Forbidden' },
        { status: HttpStatus.NOT_FOUND, expected: 'Not Found' },
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          expected: 'Internal Server Error',
        },
        { status: HttpStatus.BAD_GATEWAY, expected: 'Bad Gateway' },
        {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          expected: 'Service Unavailable',
        },
      ];

      testCases.forEach(({ status, expected }) => {
        expect(getHttpStatusDescription(status)).toBe(expected);
      });
    });

    it('should cache descriptions after first call', () => {
      // First call
      const description1 = getHttpStatusDescription(HttpStatus.OK);

      // Second call should return the same result (cached)
      const description2 = getHttpStatusDescription(HttpStatus.OK);

      expect(description1).toBe(description2);
      expect(description1).toBe('Ok');
    });

    it('should handle multiple different status codes', () => {
      const status1 = getHttpStatusDescription(HttpStatus.CREATED);
      const status2 = getHttpStatusDescription(HttpStatus.NOT_FOUND);
      const status3 = getHttpStatusDescription(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      expect(status1).toBe('Created');
      expect(status2).toBe('Not Found');
      expect(status3).toBe('Internal Server Error');
    });
    it('should return "Unknown Status" for invalid status codes', () => {
      // Cast to HttpStatus to test edge case - this should handle the case gracefully
      const invalidStatus = 999 as HttpStatus;

      // Since HttpStatus[999] is undefined, the function should handle this case
      expect(() => getHttpStatusDescription(invalidStatus)).not.toThrow();
      expect(getHttpStatusDescription(invalidStatus)).toBe('Unknown Status');
    });

    it('should format underscores and capitalize properly', () => {
      expect(getHttpStatusDescription(HttpStatus.UNPROCESSABLE_ENTITY)).toBe(
        'Unprocessable Entity',
      );
      expect(getHttpStatusDescription(HttpStatus.TOO_MANY_REQUESTS)).toBe(
        'Too Many Requests',
      );
      expect(getHttpStatusDescription(HttpStatus.GATEWAY_TIMEOUT)).toBe(
        'Gateway Timeout',
      );
    });
  });
});
