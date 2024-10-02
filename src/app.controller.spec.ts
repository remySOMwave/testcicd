import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from './prisma/prisma.service';
import { INestApplication } from '@nestjs/common';

describe('App', () => {
  let appController: AppController;
  let appService: AppService;
  let cacheManager: any;
  let prisma: any;
  let app: INestApplication;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    prisma = {
      $queryRaw: jest.fn(),
      $disconnect: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    if (app) {
      await app.close();
    }
  });

  describe('AppController', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should log environment variables', () => {
      console.log('DATABASE_URL:', process.env.DATABASE_URL);
      console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
      console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
      console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
    });

    it('should return status', async () => {
      const mockStatus = {
        status: 'Application running',
        postgres: 'ok',
        cache: 'ok',
        env: {},
      };
      jest.spyOn(appService, 'getStatus').mockResolvedValue(mockStatus);

      const result = await appController.getStatus();
      expect(result).toEqual(mockStatus);
    });
  });

  describe('AppService', () => {
    it('should return "Hello World!"', () => {
      expect(appService.getHello()).toBe('Hello World!');
    });

    it('should return status with postgres and cache ok', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue('ok');

      const result = await appService.getStatus();
      expect(result).toMatchObject({
        status: 'Application running',
        postgres: 'ok',
        cache: 'ok',
        env: {},
      });
    });

    it('should return status with postgres error', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('DB error'));
      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue('ok');

      const result = await appService.getStatus();
      expect(result).toMatchObject({
        status: 'Application running',
        postgres: 'error: DB error',
        cache: 'ok',
        env: {},
      });
    });

    it('should return status with cache error', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue(null);

      const result = await appService.getStatus();
      expect(result).toMatchObject({
        status: 'Application running',
        postgres: 'ok',
        cache: 'error',
        env: {},
      });
    });
  });
});
