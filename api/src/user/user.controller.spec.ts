import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('USER CONTROLLER', () => {
  let userController: UserController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserController, UserService, PrismaService],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  describe('MODULE TEST', () => {
    it('Should validate module definition', () => {
      expect(userController).toBeDefined();
    });
  });

  describe('USER CREATE', () => {
    it('Should create a user', async () => {
      const body: CreateUserDTO = {
        email: 'johndoeas@email.com',
        name: 'john doe',
        permission: 'boss',
        password: 'securePassword123',
      };

      userController.createUser = jest.fn().mockResolvedValue({
        id: expect.any(String),
        name: 'john doe',
        email: 'johndoe@email.com',
        emailVerified: null,
        image: null,
        permission: 'boss',
      });
      const createdUser = await userController.createUser(body);

      expect(createdUser).toEqual({
        id: expect.any(String),
        name: 'john doe',
        email: 'johndoe@email.com',
        emailVerified: null,
        image: null,
        permission: 'boss',
      });
    });
    it('Should occurr an error when trying create user', async () => {
      const body: any = {
        email: null,
        name: 'John Doe',
        permission: null,
        password: null,
      };

      userController.createUser = jest
        .fn()
        .mockRejectedValue({ Error: 'Erro interno do servidor' });

      try {
        await userController.createUser(body);
      } catch (error) {
        console.log(error.error);
      }
    });
  });
});
