import { Injectable } from '@nestjs/common';

@Injectable()
export class EloService {
  private readonly kFactor = 32;

  expectedScore(playerRank: number, opponentRank: number): number {
    // README (Classement Elo): We est la probabilite de victoire du joueur
    // en fonction de son rang et de celui de l'adversaire.
    // Ici, on applique la forme Elo standard avec (adversaire - joueur),
    // puis on conserve la precision flottante pour We.
    return 1 / (1 + Math.pow(10, (opponentRank - playerRank) / 400));
  }

  // Rn = Ro + K * (W - We), avec K = 32.
  // Le classement final est arrondi a l'entier le plus proche.
  newRank(currentRank: number, expectedScore: number, actualScore: number): number {
    return Math.round(currentRank + this.kFactor * (actualScore - expectedScore));
  }
}
