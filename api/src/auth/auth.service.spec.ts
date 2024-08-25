import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCredentialLoginDTO } from './dto/auth-credentials-login.dto';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailerService, MailerModule } from '@nestjs-modules/mailer';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthCredentialRegisterDTO } from './dto/auth-credentials-register.dto';
import { BadRequestException } from '@nestjs/common';
import { IUser } from 'src/user/interfaces/user';
import { Role } from '@prisma/client';

describe('AUTH SERVICE', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '60s' },
        }),
        MailerModule.forRoot({
          transport: {
            host: 'smtp.test.com',
            port: 587,
            auth: {
              user: 'test@example.com',
              pass: 'testpassword',
            },
          },
        }),
      ],
      providers: [
        AuthService,
        PrismaService,
        UserService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('Module test', () => {
    it('Should validate module', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('#################### LogIn User ####################', () => {
    it('Should log in the user with email and password credentials', async () => {
      const body: AuthCredentialLoginDTO = {
        email: 'Johndoe@example.com',
        password: 'CorrectPassword',
      };

      prismaService.user.findFirst = jest
        .fn()
        .mockResolvedValue({ email: body.email, password: 'hashedPassword' });

      authService.handleComparePasswords = jest.fn().mockResolvedValue(true);

      authService.handleCreateToken = jest
        .fn()
        .mockResolvedValue('validtokengenerated');

      const userLogin = await authService.handleLoginUser(
        body.email,
        body.password,
      );

      expect(userLogin).toBe('validtokengenerated');
      expect(typeof userLogin).toBe('string');
    });
    it('Should throw UnauthorizedException when email or password is incorrect', async () => {
      const body: AuthCredentialLoginDTO = {
        email: 'Johndoe@example.com',
        password: 'WrongPassword',
      };

      prismaService.user.findFirst = jest
        .fn()
        .mockResolvedValue({ email: body.email, password: 'hashedPassword' });

      authService.handleComparePasswords = jest.fn().mockResolvedValue(false);

      await expect(
        authService.handleLoginUser(body.email, body.password),
      ).rejects.toThrow(BadRequestException);
    });
    it('Should handle server errors within catch block', async () => {
      const body: AuthCredentialLoginDTO = {
        email: 'Johndoe@example.com',
        password: 'AnyPassword',
      };

      prismaService.user.findFirst = jest
        .fn()
        .mockRejectedValue(new Error('Database connection error'));

      authService.handleServerError = jest
        .fn()
        .mockReturnValue(new BadRequestException('Internal Server Error'));

      const response = await authService.handleLoginUser(
        body.email,
        body.password,
      );

      expect(response).toBeInstanceOf(BadRequestException);
      expect(authService.handleServerError).toHaveBeenCalledWith(
        expect.any(Error),
      );
    });
    it('Should create a valid token', async () => {
      const body: IUser = {
        id: 'valid-id',
        name: 'valid-name',
        email: 'valid-email@example.com',
        image: 'google.com/img',
        permission: 'client',
        emailVerified: new Date(),
      };
      jwtService.sign = jest.fn().mockResolvedValue(true);
      const token = await authService.handleCreateToken(body);

      expect(token).toBe('validtokengenerated');
      expect(typeof token).toBe('string');
    });
    it('Should occur an error when trying to create a valid token', async () => {
      const body: IUser = {
        id: 'invalid-id',
        name: 'invalid-name',
        email: 'invalid-email@example.com',
        image: 'google.com/img',
        permission: 'client',
        emailVerified: new Date(),
      };

      jest.spyOn(authService['jwtService'], 'sign').mockImplementation(() => {
        throw new BadRequestException('invalidToken');
      });

      const handleServerErrorSpy = jest
        .spyOn(authService, 'handleServerError')
        .mockImplementation((error) => {
          throw error;
        });

      try {
        await authService.handleCreateToken(body);
      } catch (error) {
        expect(handleServerErrorSpy).toHaveBeenCalledWith(error);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.error).toBe('Bad Request');
        expect(error.response.statusCode).toBe(400);
        expect(error.response.message).toBe('invalidToken');
      }

      handleServerErrorSpy.mockRestore();
    });
  });
  describe('#################### Register User ####################', () => {
    it('Should register in the user with email and password credentials', async () => {
      const body: AuthCredentialRegisterDTO = {
        email: 'johndoe@example.com',
        name: 'John Doe',
        permission: 'client',
        password: '123456789',
      };

      authService.handleRegisterUser = jest
        .fn()
        .mockResolvedValue('validTokenGenerated');

      const userRegisted = await authService.handleRegisterUser(body);
      expect(userRegisted).toBe('validTokenGenerated');
      expect(typeof userRegisted).toBe('string');
    });
  });
  describe('#################### Check Token ####################', () => {
    it('Should throw BadRequestException with correct message when token is invalid', async () => {
      const token = 'invalid_token';
      const error = new BadRequestException('Token Expirou, ou está incorreto');
      jest.spyOn(JwtService.prototype, 'verify').mockImplementation(() => {
        throw error;
      });

      try {
        await authService.handleCheckToken(token);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toEqual({
          error,
          message: 'Token Expirou, ou está incorreto',
        });
      }
    });
  });
  describe('#################### Function That Throws A Bad Request Exception ####################', () => {
    it('should throw BadRequestException with correct error and message', () => {
      const error: any = new BadRequestException('Custom error message');
      const message: string = 'Custom error message';

      try {
        (authService as any).handleServerError(error, message);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response).toEqual({
          error,
          message,
        });
      }
    });
  });
});
