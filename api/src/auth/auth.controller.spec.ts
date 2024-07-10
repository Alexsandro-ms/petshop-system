import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthCredentialLoginDTO } from './dto/auth-credentials-login.dto';
import { AuthCredentialRegisterDTO } from './dto/auth-credentials-register.dto';

describe('AUTH CONTROLLER', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            handleLoginUser: jest.fn(),
            handleRegisterUser: jest.fn(),
            handleResetPassword: jest.fn(),
            handleCheckToken: jest.fn(),
            forget: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('Module test', () => {
    it('Should validate module', () => {
      expect(authController).toBeDefined();
    });
  });

  describe('#################### LogIn User ####################', () => {
    it('Should log in the user with email and password credentials', async () => {
      const body: AuthCredentialLoginDTO = {
        email: 'Johndoe@example.com',
        password: '123456789JohnDoe',
      };

      (authService.handleLoginUser as jest.Mock).mockResolvedValue(body);

      const loggedInUser = await authController.login(body);

      expect(loggedInUser).toBe(body);
      expect(typeof loggedInUser).toBe('object');
    });
    it('Should occurr an error when trying log in the user with email and password credentials', async () => {
      const body: AuthCredentialLoginDTO = {
        email: undefined,
        password: '123456789JohnDoe',
      };

      (authService.handleLoginUser as jest.Mock).mockRejectedValue(
        'E-mail e/ou senha incorreto(s).',
      );

      try {
        await authController.login(body);
      } catch (error) {
        expect(error).toEqual('E-mail e/ou senha incorreto(s).');
      }
    });
  });
  describe('#################### Register User ####################', () => {
    it('Should register user with email and password credentials', async () => {
      const body: AuthCredentialRegisterDTO = {
        email: 'johndoe@example.com',
        name: 'John doe',
        permission: 'boss',
        password: '123456',
      };

      (authService.handleRegisterUser as jest.Mock).mockResolvedValue(body);

      const registerUser = await authController.register(body);
      expect(registerUser).toBe(body);
      expect(typeof registerUser).toBe('object');
    });
    it('Should occurr an error when trying register the user with email and password credentials', async () => {
      const body: AuthCredentialRegisterDTO = {
        email: undefined,
        password: '123456789JohnDoe',
        name: 'john doe',
        permission: 'client',
      };

      (authService.handleRegisterUser as jest.Mock).mockRejectedValue(
        'Erro interno do servidor',
      );

      try {
        await authController.register(body);
      } catch (error) {
        expect(error).toEqual('Erro interno do servidor');
      }
    });
  });
  describe('#################### Forget ####################', () => {
    it('Should generate a token to change password', async () => {
      const body: string = 'johndoe@example.com';

      (authService.forget as jest.Mock).mockResolvedValue(true);

      const forgetUser = await authController.forget(body);
      expect(forgetUser).toBe(true);
      expect(typeof forgetUser).toBe('boolean');
    });
    it('Should occurr an error when trying generate a token to change password', async () => {
      const body: string = 'invalid-email';
      (authService.forget as jest.Mock).mockRejectedValue(
        'Usuário não encontrado',
      );

      try {
        await authController.forget(body);
      } catch (error) {
        expect(error).toEqual('Usuário não encontrado');
      }
    });
  });
  describe('#################### Reset Password ####################', () => {
    it('Should change password with token and password', async () => {
      const body = {
        password: '123456',
        token: 'testToken',
      };
      (authService.handleResetPassword as jest.Mock).mockResolvedValue(true);

      const resetPassword = await authController.reset(
        body.password,
        body.token,
      );
      expect(resetPassword).toBe(true);
      expect(typeof resetPassword).toBe('boolean');
    });
    it('Should occurr an error when trying change password with token', async () => {
      const body = { password: undefined, token: 'testToken' };
      (authService.handleResetPassword as jest.Mock).mockRejectedValue(
        'Token Incorreto ou expirado',
      );

      try {
        await authController.reset(body.password, body.token);
      } catch (error) {
        expect(error).toEqual('Token Incorreto ou expirado');
      }
    });
  });
  describe('#################### Check Token ####################', () => {
    it('Should check if the token is valid or has expired', async () => {
      const body = {
        token: 'testToken',
      };
      (authService.handleCheckToken as jest.Mock).mockResolvedValue(body.token);

      const resetPassword = await authService.handleCheckToken(body.token);
      expect(resetPassword).toBe(body.token);
      expect(typeof resetPassword).toBe('string');
    });
    it('Should occurr an error when trying check if the token is valid or has expired', async () => {
      const body = { token: 'testInvalidToken' };
      (authService.handleResetPassword as jest.Mock).mockRejectedValue(
        'Token Incorreto ou expirado',
      );

      try {
        await authService.handleCheckToken(body.token);
      } catch (error) {
        expect(error).toEqual('Token Incorreto ou expirado');
      }
    });
  });
});
