import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RankingService } from '../../src/modules/ranking/ranking.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Player } from '../../src/modules/players/entity/player.entity';

describe('RankingService', () => {
  let service: RankingService;
  let moduleRef: any;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Player],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Player]),
      ],
      providers: [RankingService],
    }).compile();

    service = moduleRef.get(RankingService);
  });

  it('should throw when no players exist', async () => {
    await expect(service.getRanking()).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should return players sorted by rank desc', async () => {
    const repo = moduleRef.get(getRepositoryToken(Player)) as Repository<Player>;
    await repo.save([{ id: 'a', rank: 900 }, { id: 'b', rank: 1100 }]);

    const ranking = await service.getRanking();
    expect(ranking[0].id).toBe('b');
    expect(ranking[1].id).toBe('a');
  });
});
