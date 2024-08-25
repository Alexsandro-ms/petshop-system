import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FindUserDTO } from './dto/find-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { DeleteUserDTO } from './dto/delete-user.dto';
import { PrismaService } from '../prisma/prisma.service';

describe('USER CONTROLLER', () => {
  let userController: UserController;
  beforeAll(async () => {
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
        expect(error).toEqual({ Error: 'Erro interno do servidor' });
      }
    });
  });

  describe('FIND ALL USERS', () => {
    it('Should find and list all users', async () => {
      const body: FindUserDTO = {
        id: 'validId',
        email: 'johndoe@email.com',
        image: 'google.com',
        name: 'John Doe',
        password: '12345678910',
        permission: 'boss',
      };

      userController.findAllUser = jest.fn().mockResolvedValue(body);
      const findUsers = await userController.findAllUser();

      expect(findUsers).toEqual(body);
    });
    it('Should occurr an error when trying find and list all users', async () => {
      userController.findAllUser = jest
        .fn()
        .mockRejectedValue({ Error: 'Erro interno do servidor' });

      try {
        await userController.findAllUser();
      } catch (error) {
        expect(error).toEqual({ Error: 'Erro interno do servidor' });
      }
    });
    it('Should find an user by id', async () => {
      const body: FindUserDTO = {
        id: '1',
        email: 'johndoeas@email.com',
        name: 'john doe',
        permission: 'boss',
        password: 'securePassword123',
      };

      userController.findOneUser = jest.fn().mockResolvedValue(body);

      const findAnUserById = await userController.findOneUser(body.id);

      expect(findAnUserById).toEqual(body);
    });
    it('Should occurr an error when trying find and list an user by id', async () => {
      userController.findOneUser = jest
        .fn()
        .mockRejectedValue({ Error: 'Erro interno do servidor' });

      try {
        await userController.findOneUser(undefined);
      } catch (error) {
        expect(error).toEqual({ Error: 'Erro interno do servidor' });
      }
    });
    it('Should find and list users by name', async () => {
      const body: FindUserDTO = {
        id: '1',
        email: 'johndoeas@email.com',
        name: 'john doe',
        permission: 'boss',
        password: 'securePassword123',
      };

      userController.findAllByName = jest.fn().mockResolvedValue(body);

      const findAnUserById = await userController.findAllByName(
        1,
        10,
        body.name,
      );

      expect(findAnUserById).toEqual(body);
    });
    it('Should occurr an error when trying find and list all users by name', async () => {
      userController.findAllByName = jest
        .fn()
        .mockRejectedValue({ Error: 'Erro interno do servidor' });

      try {
        await userController.findAllByName(1, 2, undefined);
      } catch (error) {
        expect(error).toEqual({ Error: 'Erro interno do servidor' });
      }
    });
  });

  describe('USER EDIT', () => {
    it('Should edit an user by id', async () => {
      const body: UpdatePutUserDTO = {
        id: '1',
        email: 'johndoeas@email.com',
        name: 'john doe',
        permission: 'boss',
        password: 'securePassword123',
      };

      userController.edit = jest.fn().mockResolvedValue(body);

      const findAndEditUser = await userController.edit(body, body.id);

      expect(findAndEditUser).toEqual(body);
    });
    it('Should occurr an erro when trying edit an user by id', async () => {
      const body: UpdatePutUserDTO = {
        id: undefined,
        email: 'johndoeas@email.com',
        name: 'john doe',
        permission: 'boss',
        password: 'securePassword123',
      };

      userController.edit = jest
        .fn()
        .mockRejectedValue({ error: 'Erro interno do servidor' });

      try {
        await userController.edit(body, body.id);
      } catch (error) {
        expect(error).toEqual({ error: 'Erro interno do servidor' });
      }
    });
    it('Should update an user by id', async () => {
      const body: UpdatePatchUserDTO = {
        id: '1',
        email: 'johndoeas@email.com',
        name: 'john doe',
        permission: 'boss',
        password: 'securePassword123',
        image: '',
      };

      userController.update = jest.fn().mockResolvedValue(body);

      const findAndEditUser = await userController.update(body, body.id);

      expect(findAndEditUser).toEqual(body);
    });
    it('Should occurr an erro when trying edit an user by id', async () => {
      const body: UpdatePatchUserDTO = {
        id: undefined,
        email: 'johndoeas@email.com',
        name: 'john doe',
        permission: 'boss',
        password: 'securePassword123',
        image: '',
      };

      userController.update = jest
        .fn()
        .mockRejectedValue({ error: 'Erro interno do servidor' });

      try {
        await userController.update(body, body.id);
      } catch (error) {
        expect(error).toEqual({ error: 'Erro interno do servidor' });
      }
    });
  });

  describe('USER DELETE', () => {
    it('Should delete an user by id', async () => {
      const body: DeleteUserDTO = {
        id: '1',
      };

      userController.delete = jest.fn().mockResolvedValue(true);

      const deleteUser = await userController.delete(body.id);

      expect(deleteUser).toEqual(true);
    });
    it('Should occurr an erro when trying delete an user by id', async () => {
      const body: DeleteUserDTO = {
        id: undefined,
      };

      userController.delete = jest
        .fn()
        .mockRejectedValue({ error: 'Erro interno do servidor' });

      try {
        await userController.delete(body.id);
      } catch (error) {
        expect(error).toEqual({ error: 'Erro interno do servidor' });
      }
    });
  });
});
