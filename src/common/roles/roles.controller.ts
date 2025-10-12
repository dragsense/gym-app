import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Query, 
  Param, 
  UseGuards, 
  ParseIntPipe 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { RolesService } from './roles.service';
import {
  RoleListDto,
  RoleDto,
  RolePaginatedDto,
  CreateRoleDto,
  UpdateRoleDto,
  PermissionListDto,
  PermissionDto,
  PermissionPaginatedDto,
  CreatePermissionDto,
  UpdatePermissionDto,
  ResourceListDto,
  ResourceDto,
  ResourcePaginatedDto,
  UpdateResourceDto
} from 'shared/dtos/role-dtos';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Role endpoints
  @Get()
  @ApiOperation({ summary: 'Get all roles with pagination and filtering' })
  @ApiQuery({ type: RoleListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of roles',
    type: RolePaginatedDto,
  })
  async findAllRoles(@Query() queryDto: RoleListDto) {
    return await this.rolesService.findAllRoles(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: RoleDto
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findRole(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.findRole({ id });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleDto
  })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.createRole(createRoleDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleDto
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return await this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.deleteRole(id);
    return { message: 'Role deleted successfully' };
  }

  // Permission endpoints
  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions with pagination and filtering' })
  @ApiQuery({ type: PermissionListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of permissions',
    type: PermissionPaginatedDto,
  })
  async findAllPermissions(@Query() queryDto: PermissionListDto) {
    return await this.rolesService.findAllPermissions(queryDto);
  }

  @Get('permissions/:id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
    type: PermissionDto
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findPermission(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.findPermission({ id });
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get permissions by role ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiQuery({ type: PermissionListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of permissions for the role',
    type: PermissionPaginatedDto,
  })
  async findPermissionsByRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Query() queryDto: PermissionListDto
  ) {
    return await this.rolesService.findPermissionsByRole(roleId, queryDto);
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionDto
  })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.rolesService.createPermission(createPermissionDto);
  }

  @Put('permissions/:id')
  @ApiOperation({ summary: 'Update permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionDto
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    return await this.rolesService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Delete permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.deletePermission(id);
    return { message: 'Permission deleted successfully' };
  }

  // Resource endpoints
  @Get('resources')
  @ApiOperation({ summary: 'Get all resources with pagination and filtering' })
  @ApiQuery({ type: ResourceListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of resources',
    type: ResourcePaginatedDto,
  })
  async findAllResources(@Query() queryDto: ResourceListDto) {
    return await this.rolesService.findAllResources(queryDto);
  }

  @Get('resources/:id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({
    status: 200,
    description: 'Resource retrieved successfully',
    type: ResourceDto
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findResource(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.findResource({ id });
  }


  @Put('resources/:id')
  @ApiOperation({ summary: 'Update resource by ID' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({
    status: 200,
    description: 'Resource updated successfully',
    type: ResourceDto
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResourceDto: UpdateResourceDto
  ) {
    return await this.rolesService.updateResource(id, updateResourceDto);
  }
}
