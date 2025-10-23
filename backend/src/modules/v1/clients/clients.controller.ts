import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  Put,
  Delete,
  Param,
  Query,
  ParseIntPipe,
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

import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientListDto,
  ClientPaginatedDto,
  ClientDto,
  SingleQueryDto,
} from '@shared/dtos';
import { Client } from './entities/client.entity';
import { AuthUser } from '@/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Get all clients with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of clients',
    type: ClientPaginatedDto,
  })
  @Get()
  findAll(@Query() query: ClientListDto, @AuthUser() user: any) {
    return this.clientsService.get(
      { ...query, createdByUserId: user.id },
      ClientListDto,
    );
  }

  @ApiOperation({ summary: 'Get client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns client by ID',
    type: ClientDto,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: SingleQueryDto<Client>,
  ) {
    return this.clientsService.getSingle(id, query);
  }

  @ApiOperation({ summary: 'Add a new client' })
  @ApiBody({
    type: CreateClientDto,
    description: 'Create a new client',
  })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @Post()
  create(@Body() createClientDto: CreateClientDto, @AuthUser() user: any) {
    return this.clientsService.createClient(createClientDto, user.id);
  }

  @ApiOperation({ summary: 'Update client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiBody({
    type: UpdateClientDto,
    description: 'Update client information',
  })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.updateClient(id, updateClientDto);
  }

  @ApiOperation({ summary: 'Delete client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clientsService.delete(id);
  }
}
