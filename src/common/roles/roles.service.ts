import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { 
  RoleListDto, 
  CreateRoleDto, 
  UpdateRoleDto,
  PermissionListDto,
  CreatePermissionDto,
  UpdatePermissionDto,
  ResourceListDto,
  CreateResourceDto,
  UpdateResourceDto
  
} from 'shared/dtos/role-dtos';
import { IMessageResponse, IPaginatedResponse } from 'shared/interfaces';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  // Role CRUD
  async findRole(
    where: FindOptionsWhere<Role>,
    options?: {
      select?: (keyof Role)[];
      relations?: string[];
    }
  ): Promise<Role> {
    const { select, relations = ['permissions'] } = options || {};

    const role = await this.roleRepository.findOne({
      where,
      select,
      relations,
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<IMessageResponse> {
    const role = this.roleRepository.create(createRoleDto);
    await this.roleRepository.save(role);
    return { message: 'Role created successfully' };
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<IMessageResponse> {
    const role = await this.findRole({ id });
    Object.assign(role, updateRoleDto);
    await this.roleRepository.save(role);
    return { message: 'Role updated successfully' };
  }

  async deleteRole(id: number): Promise<void> {
    const role = await this.findRole({ id });
    await this.roleRepository.remove(role);
  }

  async findAllRoles(queryDto: RoleListDto): Promise<IPaginatedResponse<Role>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      status,
      isSystem,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions');

    // Apply search
    if (search) {
      query.andWhere(
        '(role.name ILIKE :search OR role.code ILIKE :search OR role.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

 
    if (status) {
      query.andWhere('role.status = :status', { status });
    }
    if (isSystem !== undefined) {
      query.andWhere('role.isSystem = :isSystem', { isSystem });
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`role.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdAt';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`role.${String(sortColumn)}`, sortDirection);

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  // Permission CRUD
  async findPermission(
    where: FindOptionsWhere<Permission>,
    options?: {
      select?: (keyof Permission)[];
      relations?: string[];
    }
  ): Promise<Permission> {
    const { select, relations = ['resource', 'roles'] } = options || {};

    const permission = await this.permissionRepository.findOne({
      where,
      select,
      relations,
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async createPermission(createPermissionDto: CreatePermissionDto): Promise<IMessageResponse> {
    const permission = this.permissionRepository.create(createPermissionDto);
    await this.permissionRepository.save(permission);
    return { message: 'Permission created successfully' };
  }

  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto): Promise<IMessageResponse> {
    const permission = await this.findPermission({ id });
    Object.assign(permission, updatePermissionDto);
    await this.permissionRepository.save(permission);
    return { message: 'Permission updated successfully' };
  }

  async deletePermission(id: number): Promise<void> {
    const permission = await this.findPermission({ id });
    await this.permissionRepository.remove(permission);
  }

  async findAllPermissions(queryDto: PermissionListDto): Promise<IPaginatedResponse<Permission>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      action,
      status,
      resourceId,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.permissionRepository.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.resource', 'resource')
      .leftJoinAndSelect('permission.roles', 'roles');

    // Apply search
    if (search) {
      query.andWhere(
        '(permission.name ILIKE :search OR permission.displayName ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (action) {
      query.andWhere('permission.action = :action', { action });
    }
    if (status) {
      query.andWhere('permission.status = :status', { status });
    }
    if (resourceId) {
      query.andWhere('permission.resourceId = :resourceId', { resourceId });
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`permission.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdAt';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`permission.${String(sortColumn)}`, sortDirection);

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  async findPermissionsByRole(roleId: number, queryDto: PermissionListDto): Promise<IPaginatedResponse<Permission>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      action,
      status,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.permissionRepository.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.resource', 'resource')
      .leftJoinAndSelect('permission.roles', 'roles')
      .where('roles.id = :roleId', { roleId });

    // Apply search
    if (search) {
      query.andWhere(
        '(permission.name ILIKE :search OR permission.displayName ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (action) {
      query.andWhere('permission.action = :action', { action });
    }
    if (status) {
      query.andWhere('permission.status = :status', { status });
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`permission.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdAt';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`permission.${String(sortColumn)}`, sortDirection);

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  // Resource CRUD
  async findResource(
    where: FindOptionsWhere<Resource>,
    options?: {
      select?: (keyof Resource)[];
      relations?: string[];
    }
  ): Promise<Resource> {
    const { select, relations = ['permissions'] } = options || {};

    const resource = await this.resourceRepository.findOne({
      where,
      select,
      relations,
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async createResource(createResourceDto: CreateResourceDto): Promise<IMessageResponse> {
    const resource = this.resourceRepository.create(createResourceDto);
    await this.resourceRepository.save(resource);
    return { message: 'Resource created successfully' };
  }

  async updateResource(id: number, updateResourceDto: UpdateResourceDto): Promise<IMessageResponse> {
    const resource = await this.findResource({ id });
    Object.assign(resource, updateResourceDto);
    await this.resourceRepository.save(resource);
    return { message: 'Resource updated successfully' };
  }

  async deleteResource(id: number): Promise<void> {
    const resource = await this.findResource({ id });
    await this.resourceRepository.remove(resource);
  }

  async findAllResources(queryDto: ResourceListDto): Promise<IPaginatedResponse<Resource>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      isActive,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.resourceRepository.createQueryBuilder('resource')
      .leftJoinAndSelect('resource.permissions', 'permissions');

    // Apply search
    if (search) {
      query.andWhere(
        '(resource.name ILIKE :search OR resource.entityName ILIKE :search OR resource.displayName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (isActive !== undefined) {
      query.andWhere('resource.isActive = :isActive', { isActive });
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`resource.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdAt';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`resource.${String(sortColumn)}`, sortDirection);

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }
}
