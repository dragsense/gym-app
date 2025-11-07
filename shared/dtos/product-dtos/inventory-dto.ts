import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PartialType } from "../../lib/dto-type-adapter";
import { Type } from "class-transformer";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ListQueryDto } from "../common/list-query.dto";
import { FieldType, FieldOptions } from "../../decorators/field.decorator";
import { EInventoryType } from "../../enums";

export class CreateInventoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "T-Shirt" })
  @FieldType("text")
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(1000)
  @ApiProperty()
  @FieldType("textarea")
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @FieldType("text")
  unit: string;

  @IsEnum(EInventoryType)
  @ApiProperty({ enum: EInventoryType })
  @FieldType("select")
  @FieldOptions(
    Object.values(EInventoryType).map((v) => ({
      value: v,
      label: v.charAt(0) + v.slice(1).toLowerCase(),
    }))
  )
  type: EInventoryType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  @Type(() => Number)
  @FieldType("number")
  quantity: number;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}

export class InventoryPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [InventoryDto] })
  @Type(() => InventoryDto)
  data: InventoryDto[];
}

export class InventoryListDto extends ListQueryDto<InventoryDto> {
  @IsString()
  @IsOptional()
  @Max(255)
  @ApiProperty()
  @FieldType("text")
  unit?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => Number)
  @FieldType("number")
  quantity?: number;
}

export class InventoryDto {
  id: string;
  name: string;
  description: string;
  unit: string;
  type: EInventoryType;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}
