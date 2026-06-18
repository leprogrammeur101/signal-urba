import {
  IsString, IsNumber, IsOptional, IsUUID,
  Min, Max,
} from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
