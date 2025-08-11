import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(typeof res.text).toBe('string');
        expect(res.text).toContain('NestJS Single Action Pattern Demo');
        expect(res.text).toContain('Version 0.0.1');
        expect(res.text).toContain('Single Action Controller');
        expect(res.text).toContain('NestJS v11.1.6');
        expect(res.text).toContain('TypeScript');
        expect(res.text).toContain('SQLite');
        expect(res.text).toContain('Serhii Malyshev');
        expect(res.text).toContain('MIT');
        expect(res.text).toContain('yarn install');
        expect(res.text).toContain('yarn start:dev');
      });
  });
});
