export class AuthTokenStore {
  private static instance: AuthTokenStore;
  private tokens: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): AuthTokenStore {
    if (!AuthTokenStore.instance) {
      AuthTokenStore.instance = new AuthTokenStore();
    }
    return AuthTokenStore.instance;
  }

  setToken(userId: string, token: any) {
    this.tokens.set(userId, token);
  }

  getToken(userId: string): any | null {
    return this.tokens.get(userId) || null;
  }

  deleteToken(userId: string): void {
    this.tokens.delete(userId);
  }
}
