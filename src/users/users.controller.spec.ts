import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../app.module';
import { PrismaService } from './../prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    if (prismaService) {
      await prismaService.user.deleteMany();
    }
    await app.close();
  });

  it('/users (POST) - should create a new user', async () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(createUserDto.email);
    expect(response.body.name).toBe(createUserDto.name);
    expect(response.body).not.toHaveProperty('password');

    // Vérifier que l'utilisateur a bien été créé dans la base de données
    const createdUser = await prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    expect(createdUser).toBeTruthy();
    expect(createdUser.email).toBe(createUserDto.email);
  });

  // Vous pouvez ajouter d'autres tests pour les autres endpoints (GET, PATCH, DELETE) ici
});
