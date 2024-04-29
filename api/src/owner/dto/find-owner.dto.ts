import { IsEmail, IsString } from 'class-validator';
export class FindOwnerDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
