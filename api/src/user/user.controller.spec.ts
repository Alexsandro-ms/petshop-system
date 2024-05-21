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

      const createdUser = await userController.createUser(body);

      expect(createdUser).toEqual({
        id: expect.any(String),
        name: 'john doe',
        email: 'johndoeas@email.com',
        emailVerified: null,
        image: null,
        permission: 'boss',
      });
    });
  });
});
