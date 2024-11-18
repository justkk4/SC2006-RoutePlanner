import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthDto, RegisterDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
	) {}
	async login(dto: AuthDto): Promise<{ access_token: string }> {
		const user = await this.prisma.user.findUnique({
			where: {
				username: dto.username,
			},
		});
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const validPassword = await argon.verify(user.password, dto.password);

		if (!validPassword) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const token = await this.signToken(user.id, user.name, user.username);
		return token;
	}

	async register(dto: RegisterDto): Promise<{ message: string }> {
		const hash = await argon.hash(dto.password);
		try {
			const user = await this.prisma.user.create({
				data: {
					name: dto.name,
					username: dto.username,
					password: hash,
				},
			});

			return { message: 'Registration successful. Please log in.' };
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new BadRequestException('Username already exists');
			}
			throw error;
		}
	}

	async signToken(
		userId: number,
		name: string,
		username: string,
	): Promise<{ access_token: string }> {
		const payload = {
			sub: userId.toString(), // Needed for jwt validation when querying for nearest shelter
			name,
			username,
			role: 'authenticated',
		};
		return {
			access_token: await this.jwt.signAsync(payload),
		};
	}
}
