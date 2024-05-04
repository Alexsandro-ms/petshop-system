import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { IUser } from './interfaces/user';
import { BadRequestException } from '@nestjs/common';

describe('USER SERVICE', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    userService.hashPassword = jest.fn().mockResolvedValue('hashedPassword');
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('MODULE TEST', () => {
    it('Should validate module definition', () => {
      expect(userService).toBeDefined();
    });
  });

  describe('#################### CREATE ####################', () => {
    it('Should create a user', async () => {
      const body: IUser = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      prismaService.user.create = jest.fn().mockResolvedValue(body);
      const createdUser = await userService.create(body);

      expect(createdUser).toEqual({
        id: '1',
        name: 'John Doe',
        email: body.email,
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      });
    });

    it('should present an error when trying to create an user', async () => {
      const body: IUser = {
        id: '1',
        name: 'John Doe',
        email: null,
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      prismaService.user.create = jest
        .fn()
        .mockRejectedValue(new Error('Failed to create user'));

      try {
        await userService.create(body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe('Erro interno do servidor');
      }
    });
  });
});
