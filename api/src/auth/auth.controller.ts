import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthCredentialLoginDTO } from './dto/auth-credentials-login.dto';
import { AuthCredentialRegisterDTO } from './dto/auth-credentials-register.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: AuthCredentialLoginDTO,
  ): Promise<string | BadRequestException> {
    return this.authService.handleLoginUser(body.email, body.password);
  }

  @Post('register')
  async register(
    @Body() body: AuthCredentialRegisterDTO,
  ): Promise<string | BadRequestException> {
    return this.authService.handleRegisterUser(body);
  }

  @Post('forget')
  async forget(
    @Body('email') email: string,
  ): Promise<boolean | BadRequestException> {
    return this.authService.forget(email);
  }

  @Patch('reset/:token')
  async reset(
    @Param('token') token: string,
    @Body() password: string,
  ): Promise<void | BadRequestException> {
    return this.authService.handleResetPassword(password, token);
  }
}
