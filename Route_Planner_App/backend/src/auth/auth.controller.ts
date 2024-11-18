import { Controller, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RegisterDto } from './dto';
import { Body, Post } from '@nestjs/common';
import { Public } from './decorator';

@Public()
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	login(@Body() dto: AuthDto): Promise<{ access_token: string }> {
		return this.authService.login(dto);
	}

	@Post('register')
	register(@Body() dto: RegisterDto): Promise<{ message: string }> {
		return this.authService.register(dto);
	}
}
