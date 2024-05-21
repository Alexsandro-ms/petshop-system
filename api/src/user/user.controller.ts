import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from './interfaces/user';

import { CreateUserDTO } from './dto/create-user.dto';
import { FindUserDTO } from './dto/find-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { DeleteUserDTO } from './dto/delete-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  async createUser(@Body() body: CreateUserDTO): Promise<IUser> {
    return this.userService.create(body);
  }

  @Get()
  @HttpCode(200)
  async findAllUser(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<FindUserDTO[]> {
    return this.userService.findAll(Number(page), Number(pageSize));
  }

  @Get(':id')
  @HttpCode(200)
  async findOneUser(@Param('id') id: string): Promise<FindUserDTO> {
    return this.userService.findOneById(id);
  }

  @Get(':name')
  @HttpCode(200)
  async findAllByName(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Param('name') name: string,
  ): Promise<FindUserDTO[]> {
    return this.userService.findAllByName(Number(page), Number(pageSize), name);
  }

  @Put(':id')
  @HttpCode(200)
  async edit(
    @Body() body: UpdatePutUserDTO,
    @Param('id') id: string,
  ): Promise<UpdatePutUserDTO> {
    return this.userService.editOneById(id, body);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Body() body: UpdatePatchUserDTO,
    @Param('id') id: string,
  ): Promise<UpdatePatchUserDTO> {
    return this.userService.updateOneById(id, body);
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string): Promise<DeleteUserDTO> {
    await this.userService.deleteOneById(id);
    return;
  }
}
