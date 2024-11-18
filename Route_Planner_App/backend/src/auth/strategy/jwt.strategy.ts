import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false, // remove this line
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	validate(payload: any) {
		return {
			userId: +payload.sub,
			username: payload.username,
			role: payload.role,
		};
	}
}
