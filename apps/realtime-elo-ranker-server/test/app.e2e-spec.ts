import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { Match } from '../src/modules/matches/entity/match.entity';
import { Player } from '../src/modules/players/entity/player.entity';
import { PlayersModule } from '../src/modules/players/players.module';
import { MatchesModule } from '../src/modules/matches/matches.module';
import { RankingModule } from '../src/modules/ranking/ranking.module';
import { EloModule } from '../src/modules/elo/elo.module';
import { RealtimeModule } from '../src/modules/realtime/realtime.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
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

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create players and return ranking', async () => {
    await request(app.getHttpServer())
      .post('/api/player')
      .send({ id: 'alice' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/player')
      .send({ id: 'bob' })
      .expect(200);

    const res = await request(app.getHttpServer()).get('/api/ranking').expect(200);
    expect(res.body).toHaveLength(2);
  });

  it('should publish a match and update ranks', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/match')
      .send({ winner: 'alice', loser: 'bob', draw: false })
      .expect(200);

    expect(res.body.winner.id).toBe('alice');
    expect(res.body.loser.id).toBe('bob');
  });
});
