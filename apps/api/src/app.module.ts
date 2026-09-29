import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module.js';
import { configuration } from './config/configuration.js';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '../../.env',
			load: [configuration]
		}),

		AiModule,
	],
	controllers: [HealthController],
})
export class AppModule { }
