import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true; // If the route is marked as public, allow access
		}
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers['authorization'];
		if (authHeader && authHeader.startsWith('Bearer '))
			request.token = authHeader.slice(7);
		return super.canActivate(context); // Otherwise, apply the guard
	}
}
