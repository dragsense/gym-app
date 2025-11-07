import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  ValidateNested,
  Min,
  IsEnum,
  IsArray,
  ValidateIf,
  ArrayMinSize,
  minLength,
  MIN,
  Max,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PartialType } from "../../lib/dto-type-adapter";
import { Type } from "class-transformer";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ListQueryDto } from "../common/list-query.dto";
import { FieldType, FieldOptions } from "../../decorators/field.decorator";

export class CreateVariantDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "T-Shirt" })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Min(50)
  @Max(1000)
  @ApiProperty()
  description: string;
}

export class VariantProductDto extends PartialType(CreateVariantDto) {}

export class VariantPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [VariantDto] })
  @Type(() => VariantDto)
  data: VariantDto[];
}

export class VariantListDto extends ListQueryDto<VariantDto> {}

export class VariantDto {}
