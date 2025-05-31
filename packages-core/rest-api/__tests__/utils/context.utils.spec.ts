import { ExecutionContext } from '@nestjs/common';
import { ContextUtils } from '../../src/utils/context.utils';

describe('ContextUtils', () => {
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;
  let mockHttpContext: any;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/test',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token123',
      },
      params: { id: '1' },
      query: { filter: 'active' },
      body: { data: 'test' },
      user: { id: 'user123', role: 'admin' },
    };

    mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({}),
      getNext: jest.fn().mockReturnValue(jest.fn()),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as jest.Mocked<ExecutionContext>;
  });

  describe('getRequest', () => {
    it('should extract request from HTTP execution context', () => {
      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(mockHttpContext.getRequest).toHaveBeenCalled();
      expect(result).toBe(mockRequest);
    });

    it('should return the complete request object', () => {
      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result).toEqual(mockRequest);
      expect(result.method).toBe('GET');
      expect(result.url).toBe('/test');
      expect(result.headers).toEqual({
        'content-type': 'application/json',
        authorization: 'Bearer token123',
      });
    });

    it('should preserve request parameters', () => {
      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.params).toEqual({ id: '1' });
      expect(result.query).toEqual({ filter: 'active' });
      expect(result.body).toEqual({ data: 'test' });
    });

    it('should preserve user information', () => {
      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.user).toEqual({ id: 'user123', role: 'admin' });
    });

    it('should handle request without user', () => {
      const requestWithoutUser = { ...mockRequest };
      delete requestWithoutUser.user;

      mockHttpContext.getRequest.mockReturnValue(requestWithoutUser);

      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.user).toBeUndefined();
    });

    it('should handle empty request headers', () => {
      const requestWithoutHeaders = { ...mockRequest, headers: {} };
      mockHttpContext.getRequest.mockReturnValue(requestWithoutHeaders);

      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.headers).toEqual({});
    });

    it('should handle POST request with body', () => {
      const postRequest = {
        ...mockRequest,
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      mockHttpContext.getRequest.mockReturnValue(postRequest);

      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.method).toBe('POST');
      expect(result.body).toEqual({
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach(method => {
        const requestWithMethod = { ...mockRequest, method };
        mockHttpContext.getRequest.mockReturnValue(requestWithMethod);

        const result = ContextUtils.getRequest(mockExecutionContext);

        expect(result.method).toBe(method);
      });
    });

    it('should handle complex query parameters', () => {
      const requestWithComplexQuery = {
        ...mockRequest,
        query: {
          filter: 'active',
          sort: 'createdAt',
          order: 'DESC',
          page: '1',
          limit: '10',
          search: 'test user',
        },
      };
      mockHttpContext.getRequest.mockReturnValue(requestWithComplexQuery);

      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.query).toEqual({
        filter: 'active',
        sort: 'createdAt',
        order: 'DESC',
        page: '1',
        limit: '10',
        search: 'test user',
      });
    });

    it('should handle route parameters', () => {
      const requestWithParams = {
        ...mockRequest,
        params: {
          id: '123',
          userId: '456',
          category: 'electronics',
        },
      };
      mockHttpContext.getRequest.mockReturnValue(requestWithParams);

      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.params).toEqual({
        id: '123',
        userId: '456',
        category: 'electronics',
      });
    });
  });

  describe('error handling', () => {
    it('should handle execution context switching errors gracefully', () => {
      mockExecutionContext.switchToHttp.mockImplementation(() => {
        throw new Error('Context switching error');
      });

      expect(() => ContextUtils.getRequest(mockExecutionContext)).toThrow(
        'Context switching error',
      );
    });

    it('should handle HTTP context getRequest errors gracefully', () => {
      mockHttpContext.getRequest.mockImplementation(() => {
        throw new Error('Request extraction error');
      });

      expect(() => ContextUtils.getRequest(mockExecutionContext)).toThrow(
        'Request extraction error',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should work with authenticated requests', () => {
      const authenticatedRequest = {
        ...mockRequest,
        user: {
          id: 'auth-user-123',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user', 'admin'],
        },
        headers: {
          ...mockRequest.headers,
          authorization: 'Bearer jwt-token-here',
        },
      };
      mockHttpContext.getRequest.mockReturnValue(authenticatedRequest);

      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.user.id).toBe('auth-user-123');
      expect(result.user.roles).toEqual(['user', 'admin']);
      expect(result.headers.authorization).toBe('Bearer jwt-token-here');
    });

    it('should work with file upload requests', () => {
      const fileUploadRequest = {
        ...mockRequest,
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
          'content-length': '1024',
        },
        files: [
          { fieldname: 'avatar', originalname: 'profile.jpg', size: 1024 },
        ],
      };
      mockHttpContext.getRequest.mockReturnValue(fileUploadRequest);

      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.headers['content-type']).toBe('multipart/form-data');
      expect(result.files).toBeDefined();
      expect(result.files[0].originalname).toBe('profile.jpg');
    });
  });
});
