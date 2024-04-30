import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { IUser } from './interfaces/user';

import * as bcrypt from 'bcrypt';
import { FindOwnerDTO } from 'src/owner/dto/find-owner.dto';
import { FindUserDTO } from './dto/find-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private handleServerError(
    error: any,
    message: string = 'Erro interno do servidor',
  ): void {
    throw new BadRequestException({ error, message });
  }

  private async findOwner(userEmail: string): Promise<FindOwnerDTO | any> {
    try {
      const owner = this.prisma.owner.findUnique({
        where: { email: userEmail },
      });

      if (!owner) {
        return this.handleServerError(null, 'Dono não cadastrado.');
      }

      return owner;
    } catch (error) {
      this.handleServerError(error, 'Erro interno do servidor');
    }
  }

  async create(body: CreateUserDTO): Promise<IUser> {
    try {
      const hashedPassword = await this.hashPassword(body.password);
      const { accounts = [], sessions = [], ...restUserDetails } = body;

      const createdUser = await this.prisma.user.create({
        data: {
          ...restUserDetails,
          password: hashedPassword,
          accounts: { create: accounts },
          sessions: { create: sessions },
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          permission: true,
        },
      });

      const findOwner = await this.findOwner(createdUser.email);

      if (!findOwner) {
        await this.prisma.owner.create({
          data: {
            email: createdUser.email,
            name: createdUser.name,
          },
        });
        return createdUser;
      }
      return createdUser;
    } catch (error) {
      this.handleServerError(error, 'Erro interno do servidor');
    }
  }

  async findAll(page: number, pageSize: number): Promise<FindUserDTO[]> {
    try {
      const skip: number = (page - 1) * pageSize;
      const take: number = pageSize;

      return await this.prisma.user.findMany({
        skip,
        take,
      });
    } catch (error) {
      this.handleServerError(error, 'Erro interno do servidor');
    }
  }

  async findOneById(id: string): Promise<FindUserDTO> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleServerError(error, 'Proprietário não encontrado.');
    }
  }

  async findAllByName(
    page: number,
    pageSize: number,
    name: string,
  ): Promise<FindUserDTO[]> {
    try {
      const skip: number = (page - 1) * pageSize;
      const take: number = pageSize;

      return await this.prisma.user.findMany({
        skip,
        take,
        where: { name },
      });
    } catch (error) {
      this.handleServerError(error);
    }
  }

  async editOneById(
    id: string,
    updateBody: UpdatePutUserDTO,
  ): Promise<UpdatePutUserDTO> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateBody,
      });
    } catch (error) {
      this.handleServerError(error);
    }
  }
}
