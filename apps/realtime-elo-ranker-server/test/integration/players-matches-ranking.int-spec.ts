import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersController } from '../../src/modules/players/players.controller';
import { MatchesController } from '../../src/modules/matches/matches.controller';
import { RankingController } from '../../src/modules/ranking/ranking.controller';
import { PlayersModule } from '../../src/modules/players/players.module';
import { MatchesModule } from '../../src/modules/matches/matches.module';
import { RankingModule } from '../../src/modules/ranking/ranking.module';
import { EloModule } from '../../src/modules/elo/elo.module';
import { RealtimeModule } from '../../src/modules/realtime/realtime.module';
import { Player } from '../../src/modules/players/entity/player.entity';
import { Match } from '../../src/modules/matches/entity/match.entity';

describe('Integration: Players, Matches, Ranking', () => {
  const createModule = async () => {
    return Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Player, Match],
          synchronize: true,
        }),
        PlayersModule,
        MatchesModule,
        RankingModule,
        EloModule,
        RealtimeModule,
      ],
    }).compile();
  };

  it('should create players and return ranking', async () => {
    const moduleRef = await createModule();
    const playersController = moduleRef.get(PlayersController);
    const rankingController = moduleRef.get(RankingController);

    await playersController.createPlayer({ id: 'alice' });
    await playersController.createPlayer({ id: 'bob' });

    const ranking = await rankingController.getRanking();
    expect(ranking).toHaveLength(2);
  });

  it('should publish a match and update ranks', async () => {
    const moduleRef = await createModule();
    const playersController = moduleRef.get(PlayersController);
    const matchesController = moduleRef.get(MatchesController);

    await playersController.createPlayer({ id: 'alice' });
    await playersController.createPlayer({ id: 'bob' });

    const result = await matchesController.publishMatch({
      winner: 'alice',
      loser: 'bob',
      draw: false,
    });

    expect(result.winner.id).toBe('alice');
    expect(result.loser.id).toBe('bob');
    expect(result.winner.rank).toBeGreaterThan(1000);
    expect(result.loser.rank).toBeLessThan(1000);
  });
});
