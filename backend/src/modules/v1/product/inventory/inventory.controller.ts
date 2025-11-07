import {
  Controller,
  Get,
  Body,
  Post,
  Delete,
  Param,
  Query,
  Patch,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { InventoryService } from './inventory.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryListDto,
  InventoryPaginatedDto,
  InventoryDto,
  SingleQueryDto,
} from '@shared/dtos';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '@/common/base-user/entities/user.entity';
import { EUserLevels } from '@shared/enums';
import { MinUserLevel } from '@/common/decorators/level.decorator';
import { Inventory } from './entities/inventory.entity';

@ApiBearerAuth('access-token')
@ApiTags('Inventory')
@MinUserLevel(EUserLevels.CLIENT)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Get all inventory with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of inventory',
    type: InventoryPaginatedDto,
  })
  @Get()
  findAll(@Query() query: InventoryListDto, @AuthUser() currentUser: User) {
    return this.inventoryService.get(query, InventoryListDto);
  }

  @ApiOperation({ summary: 'Get session by ID' })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns session by ID',
    type: InventoryDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: SingleQueryDto<Inventory>) {
    return this.inventoryService.getSingle(
      id,
      query,
      SingleQueryDto<Inventory>,
    );
  }

  @ApiOperation({ summary: 'Add a new session' })
  @ApiBody({
    type: CreateInventoryDto,
    description: 'Create a new session',
  })
  @ApiResponse({ status: 201, description: 'Inventory created successfully' })
  @Post()
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @AuthUser() currentUser: User,
  ) {
    return this.inventoryService.create(createInventoryDto);
  }

  @ApiOperation({ summary: 'Update session by ID' })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  @ApiBody({
    type: UpdateInventoryDto,
    description: 'Update session information',
  })
  @ApiResponse({ status: 200, description: 'Inventory updated successfully' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @AuthUser() currentUser: User,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @ApiOperation({ summary: 'Delete session by ID' })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  @ApiResponse({ status: 200, description: 'Inventory deleted successfully' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.inventoryService.delete(id);
  }
}
