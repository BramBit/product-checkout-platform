export class Result<T, E> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly isFailure: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {
    Object.freeze(this);
  }

  public static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(true, false, value, undefined);
  }

  public static fail<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, true, undefined, error);
  }

  public getValue(): T {
    if (this.isFailure) {
      throw new Error('Cannot get value from a failed Result.');
    }
    return this.value as T;
  }

  public getError(): E {
    if (this.isSuccess) {
      throw new Error('Cannot get error from a successful Result.');
    }
    return this.error as E;
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<E>(this.error as E);
    }
    return Result.ok<U>(fn(this.value as T));
  }
}
