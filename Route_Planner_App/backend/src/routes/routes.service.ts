import { Injectable } from '@nestjs/common';
import { RouteDto } from './dto/route.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class RoutesService {
	constructor(private readonly supabase: SupabaseService) {}
}
