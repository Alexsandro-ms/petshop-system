import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCredentialLoginDTO } from './dto/auth-credentials-login.dto';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailerService, MailerModule } from '@nestjs-modules/mailer';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthCredentialRegisterDTO } from './dto/auth-credentials-register.dto';
import { BadRequestException } from '@nestjs/common';

describe('AUTH SERVICE', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
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
        JwtService,
        PrismaService,
        UserService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(true), // Mock the sendMail method
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
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

      authService.handleLoginUser = jest
        .fn()
        .mockResolvedValue('validtokengenerated');

      const userLogin = await authService.handleLoginUser(
        body.email,
        body.password,
      );

      expect(userLogin).toBe('validtokengenerated');
      expect(typeof userLogin).toBe('string');
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
      const error = new Error('Token error');
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
      const error = new Error('Some server error');
      const message = 'Custom error message';

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
