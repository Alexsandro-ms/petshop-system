import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { FindUserDTO } from 'src/user/dto/find-user.dto';
import { UserService } from 'src/user/user.service';
import { Logger } from '@nestjs/common';

interface AuthenticatedRequest extends Request {
  tokenPayload?: FindUserDTO;
  user?: FindUserDTO;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    if (!authorization) {
      this.logger.warn('O cabeçalho de autorização está ausente');
      return false;
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      this.logger.warn('O token de autorização está ausente');
      return false;
    }

    try {
      const tokenPayload: FindUserDTO =
        await this.authService.handleCheckToken(token);

      request.tokenPayload = tokenPayload;
      request.user = await this.userService.findOneById(tokenPayload.id);

      if (!request.user) {
        this.logger.warn(
          `O usuário com o id '${tokenPayload.id}' não foi encontrado`,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        'Ocorreu um erro, verifique se o token, está correto',
        error.stack,
      );
      return false;
    }
  }
}
