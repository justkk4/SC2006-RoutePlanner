import { Module } from '@nestjs/common';
import { RunsService } from './runs.service';
import { RunsController } from './runs.controller';

@Module({
	controllers: [RunsController],
	providers: [RunsService],
})
export class RunsModule {}
