import {
  applyMethodDecorators,
  applyMethodDecoratorsIf,
  applyClassDecorators,
  applyClassDecoratorsIf,
} from '../../src/utils/decorators.utils';
import { applyDecorators } from '@nestjs/common';

// Mock NestJS decorators
jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn(),
}));

const mockApplyDecorators = applyDecorators as jest.MockedFunction<
  typeof applyDecorators
>;

describe('DecoratorsUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('applyMethodDecorators', () => {
    it('should apply method decorators when decorators array is provided', () => {
      const mockDecorator1 = jest.fn(() => jest.fn());
      const mockDecorator2 = jest.fn(() => jest.fn());
      const decorators = [mockDecorator1, mockDecorator2];

      applyMethodDecorators(decorators);

      expect(mockDecorator1).toHaveBeenCalledTimes(1);
      expect(mockDecorator2).toHaveBeenCalledTimes(1);
      expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    });

    it('should apply empty decorators when decorators array is falsy', () => {
      applyMethodDecorators(null as any);

      expect(mockApplyDecorators).toHaveBeenCalledWith();
    });

    it('should handle empty decorators array', () => {
      applyMethodDecorators([]);

      expect(mockApplyDecorators).toHaveBeenCalledWith();
    });
  });

  describe('applyMethodDecoratorsIf', () => {
    const mockDecorator = jest.fn(() => jest.fn());

    beforeEach(() => {
      mockDecorator.mockClear();
    });
    it('should apply decorators when condition is true (boolean)', () => {
      applyMethodDecoratorsIf(true, [mockDecorator]);

      expect(mockDecorator).toHaveBeenCalledTimes(1);
      expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    });

    it('should not apply decorators when condition is false (boolean)', () => {
      applyMethodDecoratorsIf(false, [mockDecorator]);

      expect(mockDecorator).not.toHaveBeenCalled();
      expect(mockApplyDecorators).toHaveBeenCalledWith();
    });
    it('should apply decorators when condition function returns true', () => {
      const conditionFn = jest.fn(() => true);

      applyMethodDecoratorsIf(conditionFn, [mockDecorator]);

      expect(conditionFn).toHaveBeenCalledTimes(1);
      expect(mockDecorator).toHaveBeenCalledTimes(1);
      expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    });

    it('should not apply decorators when condition function returns false', () => {
      const conditionFn = jest.fn(() => false);

      applyMethodDecoratorsIf(conditionFn, [mockDecorator]);

      expect(conditionFn).toHaveBeenCalledTimes(1);
      expect(mockDecorator).not.toHaveBeenCalled();
      expect(mockApplyDecorators).toHaveBeenCalledWith();
    });
  });
  describe('applyClassDecorators', () => {
    it('should apply class decorators when decorators array is provided', () => {
      const mockDecorator1 = jest.fn(() => jest.fn());
      const mockDecorator2 = jest.fn(() => jest.fn());
      const decorators = [mockDecorator1, mockDecorator2];

      applyClassDecorators(decorators);

      expect(mockDecorator1).toHaveBeenCalledTimes(1);
      expect(mockDecorator2).toHaveBeenCalledTimes(1);
      expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    });

    it('should apply empty decorators when decorators array is falsy', () => {
      applyClassDecorators(null as any);

      expect(mockApplyDecorators).toHaveBeenCalledWith();
    });
  });

  describe('applyClassDecoratorsIf', () => {
    const mockDecorator = jest.fn(() => jest.fn());

    beforeEach(() => {
      mockDecorator.mockClear();
    });
    it('should apply decorators when condition is true (boolean)', () => {
      applyClassDecoratorsIf(true, [mockDecorator]);

      expect(mockDecorator).toHaveBeenCalledTimes(1);
      expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    });

    it('should not apply decorators when condition is false (boolean)', () => {
      applyClassDecoratorsIf(false, [mockDecorator]);

      expect(mockDecorator).not.toHaveBeenCalled();
      expect(mockApplyDecorators).toHaveBeenCalledWith();
    });

    it('should apply decorators when condition function returns true', () => {
      const conditionFn = jest.fn(() => true);

      applyClassDecoratorsIf(conditionFn, [mockDecorator]);

      expect(conditionFn).toHaveBeenCalledTimes(1);
      expect(mockDecorator).toHaveBeenCalledTimes(1);
      expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    });

    it('should not apply decorators when condition function returns false', () => {
      const conditionFn = jest.fn(() => false);

      applyClassDecoratorsIf(conditionFn, [mockDecorator]);

      expect(conditionFn).toHaveBeenCalledTimes(1);
      expect(mockDecorator).not.toHaveBeenCalled();
      expect(mockApplyDecorators).toHaveBeenCalledWith();
    });
  });
});
