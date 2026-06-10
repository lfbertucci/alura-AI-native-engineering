import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const makeRepoMock = () => {
  const store: User[] = [];
  return {
    create: (data: Partial<User>) => ({ ...data }) as User,
    save: jest.fn(async (entity: User) => {
      if (!entity.id) entity.id = crypto.randomUUID();
      store.push(entity);
      return entity;
    }),
    findOne: jest.fn(async ({ where }: { where: Partial<User> }) => {
      return (
        store.find((u) =>
          (Object.entries(where) as [keyof User, unknown][]).every(
            ([k, v]) => u[k] === v,
          ),
        ) ?? null
      );
    }),
  };
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: makeRepoMock() },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('creates a user and returns it', async () => {
      const user = await service.create({
        name: 'Ana',
        email: 'ana@test.com',
        passwordHash: 'hash',
      });
      expect(user.id).toBeDefined();
      expect(user.name).toBe('Ana');
      expect(user.email).toBe('ana@test.com');
    });
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      await service.create({ name: 'Bob', email: 'bob@test.com', passwordHash: 'hash' });
      expect(await service.findByEmail('bob@test.com')).toBeDefined();
    });

    it('returns null for unknown email', async () => {
      expect(await service.findByEmail('unknown@test.com')).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const user = await service.create({ name: 'Carol', email: 'carol@test.com', passwordHash: 'hash' });
      expect(await service.findById(user.id)).toMatchObject({ id: user.id });
    });

    it('returns null for unknown id', async () => {
      expect(await service.findById('non-existent-id')).toBeNull();
    });
  });

  describe('register', () => {
    it('creates user and returns dto without passwordHash', async () => {
      const result = await service.register({
        name: 'Ana',
        email: 'ana@test.com',
        password: 'pass123',
      });
      expect(result).toEqual({
        id: expect.any(String) as unknown,
        name: 'Ana',
        email: 'ana@test.com',
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException for duplicate email', async () => {
      await service.register({ name: 'Ana', email: 'dup@test.com', password: 'pass123' });
      await expect(
        service.register({ name: 'Ana2', email: 'dup@test.com', password: 'pass123' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
