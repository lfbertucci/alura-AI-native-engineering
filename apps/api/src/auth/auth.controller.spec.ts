import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const mockAuthService = {
  login: jest.fn(),
};

const mockUsersService = {
  findById: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('delegates to authService.login and returns accessToken', async () => {
      const dto = { email: 'ana@test.com', password: 'pass123' };
      mockAuthService.login.mockResolvedValue({ accessToken: 'tok' });

      await expect(controller.login(dto)).resolves.toEqual({ accessToken: 'tok' });
    });

    it('propagates UnauthorizedException from service', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException());
      await expect(
        controller.login({ email: 'x@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('returns user data for valid payload', async () => {
      const user = { id: 'uuid', name: 'Ana', email: 'ana@test.com', passwordHash: 'hash' };
      mockUsersService.findById.mockResolvedValue(user);

      await expect(controller.getMe({ userId: 'uuid' })).resolves.toEqual({
        id: 'uuid',
        name: 'Ana',
        email: 'ana@test.com',
      });
      expect(mockUsersService.findById).toHaveBeenCalledWith('uuid');
    });

    it('throws NotFoundException when user is not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);
      await expect(controller.getMe({ userId: 'bad-id' })).rejects.toThrow(NotFoundException);
    });
  });
});
