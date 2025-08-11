import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return comprehensive project information as HTML', () => {
      const result = appController.getProjectInfo();

      expect(typeof result).toBe('string');
      expect(result).toContain('NestJS Single Action Pattern Demo');
      expect(result).toContain('Version 0.0.1');
      expect(result).toContain('Single Action Controller');
      expect(result).toContain('NestJS v11.1.6');
      expect(result).toContain('TypeScript');
      expect(result).toContain('SQLite');
      expect(result).toContain('Serhii Malyshev');
      expect(result).toContain('MIT');
      expect(result).toContain('yarn install');
      expect(result).toContain('yarn start:dev');
      expect(result).toContain('<!DOCTYPE html>');
    });
  });
});
