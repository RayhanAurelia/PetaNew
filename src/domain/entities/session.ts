export class Session {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresAt: Date,
    public readonly userId: string,
  ) {}

  isExpired(): boolean {
    return this.expiresAt.getTime() < Date.now();
  }
}
