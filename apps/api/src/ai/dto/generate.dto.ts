import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GenerateMessageDto {
  @IsIn([
    'system',
    'user',
    'assistant',
  ])
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  content!: string;
}

export class GenerateDto {
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => GenerateMessageDto)
  messages!: GenerateMessageDto[];

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;
}
