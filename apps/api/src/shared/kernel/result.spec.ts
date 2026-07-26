import { Result } from './result';

describe('Result', () => {
  it('should throw error when getValue() is called on a failure Result', () => {
    const result = Result.fail(new Error('Something went wrong'));
    expect(result.isFailure).toBe(true);
    expect(() => result.getValue()).toThrow('Cannot get value from a failed Result.');
  });

  it('should throw error when getError() is called on a successful Result', () => {
    const result = Result.ok('success value');
    expect(result.isSuccess).toBe(true);
    expect(() => result.getError()).toThrow('Cannot get error from a successful Result.');
  });

  it('should transform value with map() on success Result', () => {
    const result = Result.ok(10);
    const mapped = result.map((val) => val * 2);

    expect(mapped.isSuccess).toBe(true);
    expect(mapped.getValue()).toBe(20);
  });

  it('should propagate error with map() on failure Result without executing fn', () => {
    const error = new Error('Original error');
    const result = Result.fail(error);
    const fn = jest.fn((val: number) => val * 2);

    const mapped = result.map(fn);

    expect(fn).not.toHaveBeenCalled();
    expect(mapped.isFailure).toBe(true);
    expect(mapped.getError()).toBe(error);
  });
});
