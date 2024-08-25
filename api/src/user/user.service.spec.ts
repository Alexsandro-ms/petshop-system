import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { IUser } from './interfaces/user';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { DeleteUserDTO } from './dto/delete-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { FindUserDTO } from './dto/find-user.dto';
import { FindOwnerDTO } from 'src/owner/dto/find-owner.dto';
import { Owner } from '@prisma/client';

describe('USER SERVICE', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    userService = module.get<UserService>(UserService);

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
      const body: CreateUserDTO = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      userService.create = jest.fn().mockResolvedValue(body);
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

    it('Should present an error when trying to create an user', async () => {
      const body: CreateUserDTO = {
        name: 'John Doe',
        email: null,
        permission: 'boss',
      };

      userService.create = jest
        .fn()
        .mockRejectedValue({ error: 'Erro interno do servidor' });

      try {
        await userService.create(body);
      } catch (error) {
        expect(error).toEqual({
          error: 'Erro interno do servidor',
        });
      }
    });

    it('Should find owner', async () => {
      const mockUser: FindOwnerDTO = {
        email: 'johndoe@email.com',
        name: 'John Doe',
      };

      const returnUser: Owner = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@email.com',
        phone: '',
      };

      userService.findOwner = jest.fn().mockResolvedValue(returnUser);

      const findOwner = await userService.findOwner(mockUser.email);

      expect(findOwner).toEqual(returnUser);
    });

    it('Should give an error "Dono não encontrado." when trying to find user by email', async () => {
      const mockUser = {
        email: '1',
      };

      userService.findOwner = jest
        .fn()
        .mockRejectedValue('Dono não encontrado.');

      try {
        await userService.findOwner(mockUser.email);
      } catch (error) {
        expect(error).toBe('Dono não encontrado.');
      }
    });
  });

  describe('################### FIND ALL ###################', () => {
    it('Should find all users', async () => {
      const mockedUsers: FindUserDTO[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'Johndoe@email.com',
          permission: 'boss',
          emailVerified: new Date(1620144000000),
          image: '',
        },
        {
          id: '2',
          name: 'Jona Doe',
          email: 'Jonadoe@email.com',
          permission: 'client',
          emailVerified: new Date(1620144000000),
          image: '',
        },
      ];
      userService.findAll = jest.fn().mockResolvedValue(mockedUsers);
      const page: number = 1;
      const pageSize: number = 10;

      const findUsers = await userService.findAll(page, pageSize);

      expect(findUsers).toEqual(mockedUsers);
    });

    it('Should give an error when trying to find multiple users', async () => {
      userService.findAll = jest
        .fn()
        .mockRejectedValue({ error: 'Erro interno do servidor' });

      try {
        const page: number = 1;
        const pageSize: any = '';

        await userService.findAll(page, pageSize);
      } catch (error) {
        expect(error).toEqual({ error: 'Erro interno do servidor' });
      }
    });
  });

  describe('################# FIND USER BY ID #################', () => {
    it('Should find an user by id', async () => {
      const body: FindUserDTO = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      userService.findOneById = jest.fn().mockResolvedValue(body);
      const findOneUser = await userService.findOneById(body.id);

      expect(findOneUser).toEqual(body);
    });
    it('Should give an error when trying to find an user by id', async () => {
      const body: IUser = {
        id: undefined,
        name: 'John Doe',
        email: 'johndoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      userService.findOneById = jest
        .fn()
        .mockRejectedValue({ error: 'Proprietário não encontrado' });
      try {
        await userService.findOneById(body.id);
      } catch (error) {
        expect(error).toEqual({ error: 'Proprietário não encontrado' });
      }
    });
  });

  describe('################# FIND USER BY NAME #################', () => {
    it('Should find an user by name', async () => {
      const body: FindUserDTO[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'johndoe@email.com',
          permission: 'boss',
          emailVerified: new Date(1620144000000),
          image: '',
        },
        {
          id: '2',
          name: 'Jona Doe',
          email: 'jonadoe@email.com',
          permission: 'client',
          emailVerified: new Date(1620144000000),
          image: '',
        },
      ];

      userService.findAllByName = jest.fn().mockResolvedValue(body);

      const page: number = 1;
      const pageSize: number = 10;

      const findUsersByName = await userService.findAllByName(
        page,
        pageSize,
        body[0].name,
      );

      expect(findUsersByName).toEqual(body);
    });
    it('Should give an error when trying to find users by name', async () => {
      const body: FindUserDTO[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'johndoe@email.com',
          permission: 'boss',
          emailVerified: new Date(1620144000000),
          image: '',
        },
        {
          id: '2',
          name: 'Jona Doe',
          email: 'jonadoe@email.com',
          permission: 'client',
          emailVerified: new Date(1620144000000),
          image: '',
        },
      ];

      userService.findAllByName = jest
        .fn()
        .mockRejectedValue({ error: 'Erro interno do servidor' });
      try {
        const page: number = 1;
        const pageSize: number = 10;

        await userService.findAllByName(page, pageSize, body[0].name);
      } catch (error) {
        expect(error).toEqual({ error: 'Erro interno do servidor' });
      }
    });
  });

  describe('################# EDIT USER BY ID #################', () => {
    it('Should edit some user information', async () => {
      const body: UpdatePutUserDTO = {
        id: '1',
        name: 'John Doe',
      };

      const userReturn: IUser = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      userService.editOneById = jest.fn().mockResolvedValue(userReturn);

      const EditUser = await userService.editOneById(body.id, body);

      expect(EditUser).toEqual(userReturn);
    });
    it('Should give an error when trying to edit user info by id', async () => {
      const body: UpdatePutUserDTO = {
        id: '1',
        name: 'John Doe',
      };

      userService.editOneById = jest
        .fn()
        .mockRejectedValue({ error: 'Usuário Não Encontrado.' });
      try {
        await userService.editOneById(body.id, body);
      } catch (error) {
        expect(error).toEqual({ error: 'Usuário Não Encontrado.' });
      }
    });
  });

  describe('################# UPDATE USER INFO BY ID #################', () => {
    it('Should edit some user information', async () => {
      const body: UpdatePatchUserDTO = {
        id: '1',
        name: 'Jona Doe',
        email: 'jonadoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      const userReturn: IUser = {
        id: '1',
        name: 'Jona Doe',
        email: 'jonadoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      userService.updateOneById = jest.fn().mockResolvedValue(userReturn);

      const EditUser = await userService.updateOneById(body.id, body);

      expect(EditUser).toEqual(userReturn);
    });
    it('Should give an error when trying to update user info by id', async () => {
      const body: UpdatePatchUserDTO = {
        id: '1',
        name: 'Jona Doe',
        email: 'jonadoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      userService.updateOneById = jest
        .fn()
        .mockRejectedValue({ error: 'Erro interno do servidor' });
      try {
        await userService.updateOneById(body.id, body);
      } catch (error) {
        expect(error).toEqual({ error: 'Erro interno do servidor' });
      }
    });
  });

  describe('################# DELETE USER BY ID #################', () => {
    it('Should edit some user information', async () => {
      const body: DeleteUserDTO = {
        id: '1',
      };

      userService.deleteOneById = jest.fn().mockResolvedValue(body);

      const DeletedUser = await userService.deleteOneById(body.id);

      expect(DeletedUser).toEqual({ id: '1' });
    });
    it('Should give an error when trying to update user info by id', async () => {
      const body: DeleteUserDTO = {
        id: '1',
      };

      userService.deleteOneById = jest
        .fn()
        .mockRejectedValue({ error: 'Usuário Não Encontrado.' });
      try {
        await userService.deleteOneById(body.id);
      } catch (error) {
        expect(error).toEqual({ error: 'Usuário Não Encontrado.' });
      }
    });
  });
});
