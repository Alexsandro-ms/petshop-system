import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
} from 'class-validator';
export class CreateUserDTO {
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsDateString()
  emailVerified?: Date;

  @IsString()
  image?: string;

  @IsEnum(['boss', 'employee', 'client'])
  permission: 'boss' | 'employee' | 'client';

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password?: string;

  @IsArray()
  sessions?: [];

  @IsArray()
  accounts?: [];
}
