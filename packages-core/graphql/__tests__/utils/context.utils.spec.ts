import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ContextUtils } from '../../src/utils/context.utils';

// Mock @nestjs/graphql
jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('ContextUtils', () => {
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;
  let mockHttpContext: any;
  let mockGqlContext: any;

  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      url: '/graphql',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token123',
      },
      params: { id: '1' },
      query: { filter: 'active' },
      body: {
        query: 'query { users { id name } }',
        variables: { id: '1' },
      },
      user: { id: 'user123', role: 'admin' },
    };

    mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({}),
      getNext: jest.fn().mockReturnValue(jest.fn()),
    };

    mockGqlContext = {
      getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      getArgs: jest.fn(),
      getRoot: jest.fn(),
      getInfo: jest.fn(),
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
      contextType: 'http',
    } as any;

    // Reset mocks
    (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRequest', () => {
    it('should extract request from HTTP execution context', () => {
      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(mockHttpContext.getRequest).toHaveBeenCalled();
      expect(result).toBe(mockRequest);
    });

    it('should extract request from GraphQL execution context', () => {
      const gqlExecutionContext = {
        ...mockExecutionContext,
        contextType: 'graphql',
      };

      const result = ContextUtils.getRequest(gqlExecutionContext);

      expect(GqlExecutionContext.create).toHaveBeenCalledWith(
        gqlExecutionContext,
      );
      expect(mockGqlContext.getContext).toHaveBeenCalled();
      expect(result).toBe(mockRequest);
    });

    it('should return the complete request object from HTTP context', () => {
      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result).toEqual(mockRequest);
      expect(result.method).toBe('POST');
      expect(result.url).toBe('/graphql');
      expect(result.headers).toEqual({
        'content-type': 'application/json',
        authorization: 'Bearer token123',
      });
    });

    it('should return the complete request object from GraphQL context', () => {
      const gqlExecutionContext = {
        ...mockExecutionContext,
        contextType: 'graphql',
      };

      const result = ContextUtils.getRequest(gqlExecutionContext);

      expect(result).toEqual(mockRequest);
      expect(result.method).toBe('POST');
      expect(result.url).toBe('/graphql');
      expect(result.body.query).toBe('query { users { id name } }');
    });

    it('should preserve request parameters in HTTP context', () => {
      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.params).toEqual({ id: '1' });
      expect(result.query).toEqual({ filter: 'active' });
      expect(result.body).toEqual({
        query: 'query { users { id name } }',
        variables: { id: '1' },
      });
    });

    it('should preserve request parameters in GraphQL context', () => {
      const gqlExecutionContext = {
        ...mockExecutionContext,
        contextType: 'graphql',
      };

      const result = ContextUtils.getRequest(gqlExecutionContext);

      expect(result.params).toEqual({ id: '1' });
      expect(result.query).toEqual({ filter: 'active' });
      expect(result.body.variables).toEqual({ id: '1' });
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

    it('should handle GraphQL request without user', () => {
      const requestWithoutUser = { ...mockRequest };
      delete requestWithoutUser.user;

      mockGqlContext.getContext.mockReturnValue({ req: requestWithoutUser });
      const gqlExecutionContext = {
        ...mockExecutionContext,
        contextType: 'graphql',
      };

      const result = ContextUtils.getRequest(gqlExecutionContext);

      expect(result.user).toBeUndefined();
    });

    it('should handle empty request headers', () => {
      const requestWithoutHeaders = { ...mockRequest, headers: {} };
      mockHttpContext.getRequest.mockReturnValue(requestWithoutHeaders);

      const result = ContextUtils.getRequest(mockExecutionContext);

      expect(result.headers).toEqual({});
    });

    it('should handle GraphQL mutation request', () => {
      const mutationRequest = {
        ...mockRequest,
        body: {
          query: 'mutation { createUser(input: { name: "John" }) { id name } }',
          variables: { input: { name: 'John' } },
        },
      };

      const gqlExecutionContext = {
        ...mockExecutionContext,
        contextType: 'graphql',
      };
      mockGqlContext.getContext.mockReturnValue({ req: mutationRequest });

      const result = ContextUtils.getRequest(gqlExecutionContext);

      expect(result.body.query).toContain('mutation');
      expect(result.body.variables.input).toEqual({ name: 'John' });
    });

    it('should handle context with null or undefined req', () => {
      mockGqlContext.getContext.mockReturnValue({ req: null });
      const gqlExecutionContext = {
        ...mockExecutionContext,
        contextType: 'graphql',
      };

      const result = ContextUtils.getRequest(gqlExecutionContext);

      expect(result).toBeNull();
    });

    it('should handle malformed GraphQL context', () => {
      mockGqlContext.getContext.mockReturnValue({});
      const gqlExecutionContext = {
        ...mockExecutionContext,
        contextType: 'graphql',
      };

      const result = ContextUtils.getRequest(gqlExecutionContext);

      expect(result).toBeUndefined();
    });

    it('should handle context type that is neither http nor graphql', () => {
      const wsExecutionContext = { ...mockExecutionContext, contextType: 'ws' };

      const result = ContextUtils.getRequest(wsExecutionContext);

      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(result).toBe(mockRequest);
    });
  });
});
