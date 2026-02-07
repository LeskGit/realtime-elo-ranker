import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { Match } from '../../src/modules/matches/entity/match.entity';
import { Player } from '../../src/modules/players/entity/player.entity';
import { EloService } from '../../src/modules/elo/elo.service';
import { RealtimeService } from '../../src/modules/realtime/realtime.service';

describe('MatchesService', () => {
  let service: MatchesService;
  let playersRepository: Repository<Player>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Player, Match],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Player, Match]),
      ],
      providers: [
        MatchesService,
        EloService,
        {
          provide: RealtimeService,
          useValue: { emitRankingUpdate: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(MatchesService);
    playersRepository = moduleRef.get(getRepositoryToken(Player));
  });

  it('should reject missing winner/loser', async () => {
    await expect(
      service.publishMatch({ winner: undefined, loser: 'b', draw: false } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject same winner and loser', async () => {
    await expect(
      service.publishMatch({ winner: 'a', loser: 'a', draw: false }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject unknown players', async () => {
    await expect(
      service.publishMatch({ winner: 'a', loser: 'b', draw: false }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should handle draw matches', async () => {
    await playersRepository.save([
      { id: 'alice', rank: 1000 },
      { id: 'bob', rank: 1000 },
    ]);

    const result = await service.publishMatch({
      winner: 'alice',
      loser: 'bob',
      draw: true,
    });

    expect(result.winner.rank).toBeGreaterThan(980);
    expect(result.loser.rank).toBeGreaterThan(980);
    expect(result.winner.rank).toBeLessThan(1020);
    expect(result.loser.rank).toBeLessThan(1020);
  });

  it('should update ranks and return match result', async () => {
    await playersRepository.save([
      { id: 'alice', rank: 1000 },
      { id: 'bob', rank: 1000 },
    ]);

    const result = await service.publishMatch({
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
