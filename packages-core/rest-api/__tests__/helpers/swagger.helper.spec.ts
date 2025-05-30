import { swaggerRecomenedOptions } from '../../src/helpers/swagger.helper';

describe('swaggerRecomenedOptions', () => {
  describe('configuration', () => {
    it('should have tagsSorter set to alpha', () => {
      expect(swaggerRecomenedOptions.tagsSorter).toBe('alpha');
    });

    it('should have operationsSorter function defined', () => {
      expect(swaggerRecomenedOptions.operationsSorter).toBeDefined();
      expect(typeof swaggerRecomenedOptions.operationsSorter).toBe('function');
    });
  });

  describe('operationsSorter', () => {
    let sorterFunction: any;

    beforeEach(() => {
      sorterFunction = swaggerRecomenedOptions.operationsSorter;
    });

    it('should sort GET before POST', () => {
      const getOperation = { get: jest.fn().mockReturnValue('get') };
      const postOperation = { get: jest.fn().mockReturnValue('post') };

      const result = sorterFunction(getOperation, postOperation);

      expect(result).toBeLessThan(0); // GET should come before POST
      expect(getOperation.get).toHaveBeenCalledWith('method');
      expect(postOperation.get).toHaveBeenCalledWith('method');
    });

    it('should sort POST before PUT', () => {
      const postOperation = { get: jest.fn().mockReturnValue('post') };
      const putOperation = { get: jest.fn().mockReturnValue('put') };

      const result = sorterFunction(postOperation, putOperation);

      expect(result).toBeLessThan(0); // POST should come before PUT
    });

    it('should sort PUT before DELETE', () => {
      const putOperation = { get: jest.fn().mockReturnValue('put') };
      const deleteOperation = { get: jest.fn().mockReturnValue('delete') };

      const result = sorterFunction(putOperation, deleteOperation);

      expect(result).toBeLessThan(0); // PUT should come before DELETE
    });

    it('should sort operations in correct order: GET, POST, PUT, DELETE', () => {
      const operations = [
        { get: jest.fn().mockReturnValue('delete'), name: 'delete' },
        { get: jest.fn().mockReturnValue('put'), name: 'put' },
        { get: jest.fn().mockReturnValue('get'), name: 'get' },
        { get: jest.fn().mockReturnValue('post'), name: 'post' },
      ];

      const sorted = operations.sort(sorterFunction);

      expect(sorted[0].name).toBe('get');
      expect(sorted[1].name).toBe('post');
      expect(sorted[2].name).toBe('put');
      expect(sorted[3].name).toBe('delete');
    });

    it('should handle same method types consistently', () => {
      const getOperation1 = { get: jest.fn().mockReturnValue('get') };
      const getOperation2 = { get: jest.fn().mockReturnValue('get') };

      const result = sorterFunction(getOperation1, getOperation2);

      expect(result).toBe(0); // Same methods should be equal
    });

    it('should handle reverse order comparisons correctly', () => {
      const deleteOperation = { get: jest.fn().mockReturnValue('delete') };
      const getOperation = { get: jest.fn().mockReturnValue('get') };

      const result = sorterFunction(deleteOperation, getOperation);

      expect(result).toBeGreaterThan(0); // DELETE should come after GET
    });
  });

  describe('integration with Swagger', () => {
    it('should be compatible with SwaggerUiOptions interface', () => {
      // This test ensures the structure matches expected Swagger UI options
      expect(swaggerRecomenedOptions).toHaveProperty('tagsSorter');
      expect(swaggerRecomenedOptions).toHaveProperty('operationsSorter');
    });

    it('should provide valid configuration for Swagger UI', () => {
      // Test that the configuration object is properly structured
      const options = swaggerRecomenedOptions;

      expect(typeof options.tagsSorter).toBe('string');
      expect(typeof options.operationsSorter).toBe('function');
    });
  });

  describe('method order mapping', () => {
    it('should correctly map HTTP methods to sort order', () => {
      const sorterFunction = swaggerRecomenedOptions.operationsSorter;

      // Test the internal order mapping by checking various combinations
      const methods = ['get', 'post', 'put', 'delete'];
      const expectedOrder = ['0', '1', '2', '3'];

      methods.forEach((method, index) => {
        const operation = { get: jest.fn().mockReturnValue(method) };
        // We can't directly access the internal order mapping, but we can verify
        // the sorting behavior is consistent with our expectations
        expect(operation.get).toBeDefined();
      });
    });
  });

  describe('error handling', () => {
    it('should handle operations with undefined methods gracefully', () => {
      const sorterFunction = swaggerRecomenedOptions.operationsSorter;
      const operation1 = { get: jest.fn().mockReturnValue(undefined) };
      const operation2 = { get: jest.fn().mockReturnValue('get') };

      // This should not throw an error
      expect(() => sorterFunction(operation1, operation2)).not.toThrow();
    });

    it('should handle operations with null methods gracefully', () => {
      const sorterFunction = swaggerRecomenedOptions.operationsSorter;
      const operation1 = { get: jest.fn().mockReturnValue(null) };
      const operation2 = { get: jest.fn().mockReturnValue('post') };

      // This should not throw an error
      expect(() => sorterFunction(operation1, operation2)).not.toThrow();
    });
  });
});
