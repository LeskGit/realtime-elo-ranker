import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { PlayersService } from '../../src/modules/players/players.service';
import { Player } from '../../src/modules/players/entity/player.entity';
import { RealtimeService } from '../../src/modules/realtime/realtime.service';

describe('PlayersService', () => {
  let service: PlayersService;
  let emitError: jest.Mock;

  beforeEach(async () => {
    emitError = jest.fn();
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Player],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Player]),
      ],
      providers: [
        PlayersService,
        {
          provide: RealtimeService,
          useValue: { emitRankingUpdate: jest.fn(), emitError },
        },
      ],
    }).compile();

    service = moduleRef.get(PlayersService);
  });

  it('should create a player with default rank when none exists', async () => {
    const player = await service.createPlayer({ id: 'alice' });
    expect(player.rank).toBe(1000);
  });

  it('should use average rank when players exist', async () => {
    await service.createPlayer({ id: 'a', rank: 1200 });
    await service.createPlayer({ id: 'b', rank: 800 });
    const player = await service.createPlayer({ id: 'c' });
    expect(player.rank).toBe(1000);
  });

  it('should throw conflict on duplicate player', async () => {
    await service.createPlayer({ id: 'dup' });
    await expect(service.createPlayer({ id: 'dup' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(emitError).toHaveBeenCalledWith({
      code: 409,
      message: 'player already exists',
    });
  });
});
