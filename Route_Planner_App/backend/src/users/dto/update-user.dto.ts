import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	username?: string;

	@IsString()
	@MinLength(8)
	@IsOptional()
	password?: string;
}
