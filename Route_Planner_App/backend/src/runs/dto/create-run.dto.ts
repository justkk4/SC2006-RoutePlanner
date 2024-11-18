import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRunDto {
	@IsString()
	@IsNotEmpty()
	distance: string;

	@IsString()
	@IsNotEmpty()
	time: string;

	@IsString()
	@IsNotEmpty()
	pace: string;

	@IsString()
	@IsNotEmpty()
	date: string;
}
