import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };

  beforeEach(async () => {
    usersService = { findByEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('mocked-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('returns accessToken for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('pass123', 10);
      const user: User = Object.assign(new User(), {
        id: '1',
        name: 'Bob',
        email: 'bob@test.com',
        passwordHash,
      });
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.login({ email: 'bob@test.com', password: 'pass123' });
      expect(result.accessToken).toBe('mocked-token');
    });

    it('throws UnauthorizedException for unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'ghost@test.com', password: 'pass123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct', 10);
      const user: User = Object.assign(new User(), {
        id: '2',
        name: 'Carol',
        email: 'carol@test.com',
        passwordHash,
      });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({ email: 'carol@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
