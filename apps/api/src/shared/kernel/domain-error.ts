export abstract class DomainError {
  constructor(
    public readonly code: string,
    public readonly message: string,
  ) {}
}
