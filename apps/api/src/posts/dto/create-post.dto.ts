import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Hooks customizados em React' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Como criar e usar hooks customizados no React' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false, example: 'const useDebounce = ...' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false, type: [String], example: ['React', 'TypeScript'] })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value as string);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return typeof value === 'string' && value ? [value] : [];
    }
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
