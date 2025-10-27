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
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionListDto,
  SessionPaginatedDto,
  SessionDto,
  SingleQueryDto,
} from '@shared/dtos';
import { Session } from './entities/session.entity';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '../users/entities/user.entity';

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
  findOne(@Param('id') id: string, @Query() query: SingleQueryDto<Session>) {
    return this.sessionsService.getSingle(
      { id },
      query,
      SingleQueryDto<Session>,
    );
  }

  @ApiOperation({ summary: 'Add a new session' })
  @ApiBody({
    type: CreateSessionDto,
    description: 'Create a new session',
  })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @Post()
  create(
    @Body() createSessionDto: CreateSessionDto,
    @AuthUser() currentUser: User,
  ) {
    return this.sessionsService.createSession(createSessionDto, currentUser.id);
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
  update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @AuthUser() currentUser: User,
  ) {
    return this.sessionsService.updateSession(
      id,
      updateSessionDto,
      currentUser.id,
    );
  }

  @ApiOperation({ summary: 'Delete session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.sessionsService.delete({ id });
  }
}
