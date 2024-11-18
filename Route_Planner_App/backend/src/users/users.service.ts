import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async update(
		id: number,
		updateUserDto: UpdateUserDto,
	): Promise<Partial<User>> {
		const user = await this.prisma.user.update({
			where: { id },
			data: updateUserDto,
		});
		delete user.password;
		return user;
	}

	async remove(id: number): Promise<{ message: string }> {
		await this.prisma.user.delete({
			where: { id },
		});
		return { message: 'User deleted successfully' };
	}
}
