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
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "../../lib/dto-type-adapter";
import { Type } from "class-transformer";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ListQueryDto } from "../common/list-query.dto";
import { FieldType, FieldOptions } from "../../decorators/field.decorator";

export class CreateProductDto {
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

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [ProductDto] })
  @Type(() => ProductDto)
  data: ProductDto[];
}

export class ProductListDto extends ListQueryDto<ProductDto> {}

export class ProductDto {}
