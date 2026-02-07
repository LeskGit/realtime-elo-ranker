import { Injectable } from '@nestjs/common';

@Injectable()
export class EloService {
  private readonly kFactor = 32;

  expectedScore(playerRank: number, opponentRank: number): number {
    return 1 / (1 + Math.pow(10, (opponentRank - playerRank) / 400));
  }

  newRank(currentRank: number, expectedScore: number, actualScore: number): number {
    return Math.round(currentRank + this.kFactor * (actualScore - expectedScore));
  }
}
