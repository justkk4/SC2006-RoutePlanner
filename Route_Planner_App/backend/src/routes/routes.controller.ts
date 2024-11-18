import { Controller, Post, Body, Req } from '@nestjs/common';
import { RouteDto, PointDto } from './dto';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('routes')
export class RoutesController {
	constructor(private readonly supabaseService: SupabaseService) {}

	@Post('intersections')
	findIntersections(@Body() routeDto: RouteDto, @Req() req: any) {
		const token = req.token;
		this.supabaseService.setAccessToken(token);
		return this.supabaseService.findIntersections(routeDto.route);
	}

	@Post('nearby-shelters')
	findNearbyShelters(@Body() pointDto: PointDto, @Req() req: any) {
		const token = req.token;
		this.supabaseService.setAccessToken(token);
		return this.supabaseService.findNearbyShelters(pointDto);
	}
}
