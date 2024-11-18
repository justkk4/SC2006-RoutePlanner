import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	ParseIntPipe,
	UseInterceptors,
	UploadedFile,
	Req,
} from '@nestjs/common';
import { RunsService } from './runs.service';
import { CreateRunDto } from './dto/create-run.dto';
import { getUser } from 'src/auth/decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase/supabase.service';

@Controller('runs')
export class RunsController {
	constructor(
		private readonly runsService: RunsService,
		private readonly supabaseService: SupabaseService,
	) {}

	@Post()
	@UseInterceptors(FileInterceptor('routeImage')) // Handle the image upload
	async create(
		@getUser('userId') userId: number,
		@Body() createRunDto: CreateRunDto,
		@UploadedFile() routeImage: Express.Multer.File | undefined,
		@Req() req: any,
	) {
		// Upload image to Supabase Storage
		const token = req.token;
		this.supabaseService.setAccessToken(token);

		let routeImagePath = '';

		if (routeImage) {
			// Upload the image and get the URL
			routeImagePath = await this.supabaseService.uploadRouteImage(routeImage);
		}

		// Save run metadata and image URL
		return this.runsService.create(userId, createRunDto, routeImagePath);
	}

	@Get()
	findAll(@getUser('userId') userId: number, @Req() req: any) {
		// Set the token for the Supabase Storage service
		const token = req.token;
		this.supabaseService.setAccessToken(token);
		return this.runsService.findAll(userId);
	}

	@Get(':id')
	findOne(
		@getUser('userId') userId: number,
		@Param('id', ParseIntPipe) runId: number,
		@Req() req: any,
	) {
		// Set the token for the Supabase Storage service
		const token = req.token;
		this.supabaseService.setAccessToken(token);
		return this.runsService.findOne(userId, runId);
	}
}
