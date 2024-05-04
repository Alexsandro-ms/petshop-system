import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { IUser } from './interfaces/user';
import { BadRequestException } from '@nestjs/common';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';

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

  afterAll(async () => {
    await prismaService.$disconnect();
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

  describe('################### FIND ALL ###################', () => {
    it('Should find all users', async () => {
      const mockedUsers: IUser[] = [
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
      prismaService.user.findMany = jest.fn().mockResolvedValue(mockedUsers);
      const page: number = 1;
      const pageSize: number = 10;

      const findUsers = await userService.findAll(page, pageSize);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      expect(findUsers).toEqual(mockedUsers);
    });

    it('Should give an error when trying to find multiple users', async () => {
      prismaService.user.findMany = jest
        .fn()
        .mockRejectedValue(new Error('Erro interno do servidor'));

      try {
        const page: number = 1;
        const pageSize: any = '';

        await userService.findAll(page, pageSize);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe('Erro interno do servidor');
      }
    });
  });

  describe('################# FIND USER BY ID #################', () => {
    it('Should find an user by id', async () => {
      const body: IUser = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@email.com',
        permission: 'boss',
        emailVerified: new Date(1620144000000),
        image: '',
      };

      prismaService.user.findUnique = jest.fn().mockResolvedValue(body);
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

      prismaService.user.findUnique = jest
        .fn()
        .mockRejectedValue(new Error('Erro interno do servidor'));
      try {
        await userService.findOneById(body.id);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe('Proprietário não encontrado.');
      }
    });
  });

  describe('################# FIND USER BY NAME #################', () => {
    it('Should find an user by name', async () => {
      const body: IUser[] = [
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

      prismaService.user.findMany = jest.fn().mockResolvedValue(body);

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
      const body: IUser[] = [
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

      prismaService.user.findMany = jest
        .fn()
        .mockRejectedValue('Usuário Não Encontrado.');
      try {
        const page: number = 1;
        const pageSize: number = 10;

        await userService.findAllByName(page, pageSize, body[0].name);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe('Usuário Não Encontrado.');
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

      prismaService.user.update = jest.fn().mockResolvedValue(userReturn);

      const EditUser = await userService.editOneById(body.id, body);

      expect(EditUser).toBe(userReturn);
    });
    it('Should give an error when trying to edit user info by id', async () => {
      const body: UpdatePutUserDTO = {
        id: '1',
        name: 'John Doe',
      };

      prismaService.user.update = jest
        .fn()
        .mockRejectedValue('Usuário Não Encontrado.');
      try {
        await userService.editOneById(body.id, body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe('Erro interno do servidor');
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

      prismaService.user.update = jest.fn().mockResolvedValue(userReturn);

      const EditUser = await userService.updateOneById(body.id, body);

      expect(EditUser).toBe(userReturn);
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

      prismaService.user.update = jest
        .fn()
        .mockRejectedValue('Usuário Não Encontrado.');
      try {
        await userService.updateOneById(body.id, body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe('Erro interno do servidor');
      }
    });
  });
});
