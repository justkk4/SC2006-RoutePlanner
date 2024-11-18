import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { getUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	//TODO: Ensure that the new password is hashed before saving it to the database
	@Patch()
	update(
		@getUser('userId') userId: number,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<Partial<User>> {
		return this.usersService.update(userId, updateUserDto);
	}

	//TODO: What happens after the user is deleted? Should we return the user that was deleted? JWT token?
	@Delete()
	remove(@getUser('userId') userId: number): Promise<{ message: string }> {
		return this.usersService.remove(userId);
	}
}
