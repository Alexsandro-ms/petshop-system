import * as bcrypt from 'bcrypt';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { IUser } from '../user/interfaces/user';
import { AuthCredentialRegisterDTO } from './dto/auth-credentials-register.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailer: MailerService,
  ) {}

  handleServerError(
    error: any,
    message: string = 'Erro interno do servidor',
  ): BadRequestException {
    throw new BadRequestException({ error, message });
  }

  async handleCreateToken(user: IUser): Promise<string> {
    try {
      const payload = {
        id: user.id,
        permission: user.permission,
        imageUrl: user.image,
      };

      return this.jwtService.sign(payload, {
        expiresIn: '7 days',
        secret: process.env.SECRET_KEY,
      });
    } catch (error) {
      this.handleServerError(error);
    }
  }

  async handleComparePasswords(
    providedPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(providedPassword, hashedPassword);
  }

  async handleResetPassword(
    password: string,
    token: string,
  ): Promise<void | BadRequestException> {
    try {
      const data = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });
      const { id } = data;
      const myPlaintextPassword = process.env.MY_PLAIN_TEXT_PASSWORD;

      await bcrypt.hash(
        myPlaintextPassword,
        10,
        async function (err: object, hash: string) {
          if (!err) {
            const updateUserWNewPassword = await this.prisma.user.update({
              where: { id },
              data: { password: hash },
            });
            return updateUserWNewPassword;
          }
          return err;
        },
      );
    } catch (error) {
      return this.handleServerError(error, 'Erro interno do servidor');
    }
  }

  async handleCheckToken(token: string): Promise<object> {
    try {
      return await this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });
    } catch (error) {
      this.handleServerError(error, 'Token Expirou, ou está incorreto');
    }
  }

  async handleLoginUser(
    email: string,
    password: string,
  ): Promise<string | BadRequestException> {
    try {
      const user = await this.prisma.user.findFirst({ where: { email } });

      if (
        !user ||
        !(await this.handleComparePasswords(password, user.password))
      ) {
        throw new UnauthorizedException('E-mail e/ou senha incorreto(s).');
      }

      return this.handleCreateToken(user);
    } catch (error) {
      return this.handleServerError(error);
    }
  }

  async handleRegisterUser(
    data: AuthCredentialRegisterDTO,
  ): Promise<string | BadRequestException> {
    try {
      const user: IUser = await this.userService.create(data);
      return this.handleCreateToken(user);
    } catch (error) {
      this.handleServerError(error);
    }
  }

  async forget(email: string): Promise<boolean | BadRequestException> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        return this.handleServerError(undefined, 'Usuário não encontrado');
      }

      const forgetToken = this.jwtService.sign(
        { id: user.id, permission: user.permission, imageUrl: user.image },
        {
          expiresIn: '15min',
          secret: process.env.SECRET_KEY,
        },
      );

      return await this.mailer.sendMail({
        subject: 'Recuperar senha',
        to: user.email,
        html: `
        <p>Recuperação de Senha</p>
            <p>Olá ${user.name},</p>
            <p>
              Recebemos uma solicitação para redefinir a senha associada à sua conta. Se
              você não fez essa solicitação, por favor, ignore este e-mail.
            </p>
            <p>Para redefinir sua senha, clique no link abaixo:</p>
            <p><a href="http://localhost:3000/${forgetToken}">LINK</a></p>
            <p>
              Este link é válido por 7 dias, após o qual expirará por motivos de segurança.
            </p>
            <p>
              Por favor, ignore este e-mail se você não solicitou uma redefinição de senha.
              Caso contrário, acesse o link o mais rápido possível para garantir a segurança
              de sua conta.
            </p>
            <p>Se precisar de ajuda ou tiver alguma dúvida, entre em contato conosco.</p>
            <p>Atenciosamente,</p>
            <br />
            <p>Alexsandro Martins</p>
            <p>Desenvolvedor FullStack</p>
        `,
      });
    } catch (error) {
      this.handleServerError(error);
    }
  }
}
