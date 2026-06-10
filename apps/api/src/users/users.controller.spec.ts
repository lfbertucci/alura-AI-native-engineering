import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Response } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  register: jest.fn(),
};

const mockRes = {
  setHeader: jest.fn(),
  status: jest.fn(),
} as unknown as Response;

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('delegates to usersService.register, sets Location header, and returns result', async () => {
      const dto = { name: 'Ana', email: 'ana@test.com', password: 'pass123' };
      const response = { id: 'uuid', name: 'Ana', email: 'ana@test.com' };
      mockUsersService.register.mockResolvedValue(response);

      await expect(controller.register(dto, mockRes)).resolves.toEqual(response);
      expect(mockUsersService.register).toHaveBeenCalledWith(dto);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Location', '/v1/users/uuid');
    });

    it('propagates ConflictException from service', async () => {
      mockUsersService.register.mockRejectedValue(new ConflictException());
      await expect(
        controller.register({ name: 'X', email: 'x@test.com', password: 'pass123' }, mockRes),
      ).rejects.toThrow(ConflictException);
    });
  });
});
