import { BehaviorSubject } from 'rxjs';

export class StateManagerRx {
  private static instance: StateManagerRx; // Singleton instance
  private tokens$: BehaviorSubject<Map<string, any>> = new BehaviorSubject(
    new Map(),
  );

  private constructor() {}

  static getInstance(): StateManagerRx {
    if (!StateManagerRx.instance) {
      StateManagerRx.instance = new StateManagerRx();
    }
    return StateManagerRx.instance;
  }

  // Ajouter ou mettre à jour les tokens d'un utilisateur
  setToken(userId: string, token: any) {
    const tokens = this.tokens$.getValue();
    tokens.set(userId, token);
    this.tokens$.next(tokens); // Notifier les observateurs
  }

  // Récupérer les tokens d'un utilisateur
  getToken(userId: string): any | null {
    return this.tokens$.getValue().get(userId) || null;
  }

  // Supprimer les tokens d'un utilisateur
  deleteToken(userId: string): void {
    const tokens = this.tokens$.getValue();
    tokens.delete(userId);
    this.tokens$.next(tokens); // Notifier les observateurs
  }

  // Obtenir le flux réactif de l'état
  getTokensStream() {
    return this.tokens$.asObservable();
  }
}
