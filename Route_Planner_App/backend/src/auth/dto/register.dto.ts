import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	password: string;
}
