import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Observable } from 'rxjs';
import { Player } from '../players/entity/player.entity';

// Ce service gère les événements en temps réel liés au classement des joueurs. 
// Il utilise un EventEmitter pour émettre des événements de mise à jour du classement et des erreurs, 
// et expose une méthode pour s'abonner à ces événements via un Observable.

// Types d'événements possibles pour le classement
type RankingUpdateEvent = {
  data: {
    type: 'RankingUpdate';
    player: {
      id: string;
      rank: number;
    };
  };
};

// Type d'événement pour les erreurs liées au classement
type RankingErrorEvent = {
  data: {
    type: 'Error';
    message: string;
    code: number;
  };
};

type RankingEvent = RankingUpdateEvent | RankingErrorEvent;

@Injectable()
export class RealtimeService {
  private readonly emitter = new EventEmitter();

  // Emet une mise à jour du classement d'un joueur
  emitRankingUpdate(player: Player): void {
    this.emitter.emit('ranking', {
      data: {
        type: 'RankingUpdate',
        player: {
          id: player.id,
          rank: player.rank,
        },
      },
    } satisfies RankingEvent);
  }

  // Emet une erreur liée au classement
  emitError(error: { code: number; message: string }): void {
    this.emitter.emit('ranking', {
      data: {
        type: 'Error',
        message: error.message,
        code: error.code,
      },
    } satisfies RankingEvent);
  }

  // Permet de s'abonner aux événements de classement via un Observable
  getRankingEvents(): Observable<RankingEvent> {
    return new Observable((subscriber) => {
      const handler = (event: RankingEvent) => {
        subscriber.next(event);
        if (event.data.type === 'Error') {
          subscriber.complete();
        }
      };
      this.emitter.on('ranking', handler);
      return () => {
        this.emitter.off('ranking', handler);
      };
    });
  }
}
