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

import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { CreateSessionDto, UpdateSessionDto, SessionListDto, SessionPaginatedDto, SessionDto, SingleQueryDto } from 'shared';
import { Session } from './entities/session.entity';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiOperation({ summary: 'Get all sessions with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of sessions',
    type: SessionPaginatedDto,
  })
  @Get()
  findAll(@Query() query: SessionListDto) {
    return this.sessionsService.get(query, SessionListDto);
  }

  @ApiOperation({ summary: 'Get session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns session by ID',
    type: SessionDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Query() query: SingleQueryDto<Session>) {
    return this.sessionsService.getSingle(id, query);
  }

  @ApiOperation({ summary: 'Add a new session' })
  @ApiBody({
    type: CreateSessionDto,
    description: 'Create a new session',
  })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.createSession(createSessionDto);
  }

  @ApiOperation({ summary: 'Update session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiBody({
    type: UpdateSessionDto,
    description: 'Update session information',
  })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.updateSession(id, updateSessionDto);
  }

  @ApiOperation({ summary: 'Delete session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.sessionsService.delete(id);
  }
}
