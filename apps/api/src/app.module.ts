import {
	Module,
} from '@nestjs/common';

import {
	ConfigModule,
} from '@nestjs/config';

import {
	configuration,
} from './config/configuration.js';

import {
	AiModule,
} from './modules/ai/ai.module.js';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '../../.env',
			load: [
				configuration,
			],
		}),

		AiModule,
	],
})
export class AppModule { }
