import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
import {
  DatabaseConfig,
  DatabaseMode,
  DatabaseConnection,
} from '@/config/database.config';
import { join } from 'path';

export interface TenantContext {
  tenantId: string;
  organizationId?: string;
}

@Injectable()
export class DatabaseManager implements OnModuleInit {
  private readonly logger = new Logger(DatabaseManager.name);
  private connections: Map<string, DataSource> = new Map();
  private dbConfig: DatabaseConfig;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.dbConfig = this.configService.get<DatabaseConfig>('database')!;
    await this.initializeSystem();
  }

  private async initializeSystem() {
    this.logger.log(
      `Initializing database system in ${this.dbConfig.mode} mode`,
    );

    this.logger.log(`Auto-replica setting: ${this.dbConfig.autoReplica}`);
    this.logger.log(`Auto-archive setting: ${this.dbConfig.autoArchive}`);

    // Initialize main connection
    await this.initializeMainConnection();

    // Initialize auto-replica if enabled
    if (this.dbConfig.autoReplica) {
      await this.initializeReplica();
    }

    // Initialize auto-archive if enabled
    if (this.dbConfig.autoArchive) {
      await this.initializeArchive();
    }
  }

  private async initializeMainConnection() {
    const mainConnection =
      this.dbConfig.connections[this.dbConfig.defaultConnection];
    const dataSource = await this.createConnection('main', mainConnection);
    this.connections.set('main', dataSource);
    this.logger.log('Main database connection initialized');
  }

  private async initializeReplica() {
    const mainConnection =
      this.dbConfig.connections[this.dbConfig.defaultConnection];
    const replicaConnection: DatabaseConnection = {
      ...mainConnection,
      name: 'replica',
      database: `${mainConnection.database}_replica`,
    };

    const dataSource = await this.createConnection(
      'replica',
      replicaConnection,
    );
    this.connections.set('replica', dataSource);
    this.logger.log('Replica database connection initialized');
  }

  private async initializeArchive() {
    const mainConnection =
      this.dbConfig.connections[this.dbConfig.defaultConnection];
    const archiveConnection: DatabaseConnection = {
      ...mainConnection,
      name: 'archive',
      database: `${mainConnection.database}_archive`,
    };

    const dataSource = await this.createConnection(
      'archive',
      archiveConnection,
    );
    this.connections.set('archive', dataSource);
    this.logger.log('Archive database connection initialized');
  }

  private async createConnection(
    name: string,
    config: DatabaseConnection,
  ): Promise<DataSource> {
    const options: DataSourceOptions = {
      ...config,
      entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
      migrations: [
        join(__dirname, '../../migrations/common/**/*{.ts,.js}'),
        join(__dirname, '../../migrations/modules/**/*{.ts,.js}'),
      ],
    };

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    return dataSource;
  }

  /**
   * Auto-create tenant schema/database when new tenant registers
   */
  async createTenantResources(tenantId: string): Promise<void> {
    this.logger.log(`Creating resources for tenant: ${tenantId}`);

    switch (this.dbConfig.mode) {
      case DatabaseMode.SINGLE:
        // Single mode - no tenant-specific resources needed
        break;

      case DatabaseMode.MULTI_SCHEMA:
        await this.createTenantSchema(tenantId);
        break;

      case DatabaseMode.MULTI_DATABASE:
        await this.createTenantDatabase(tenantId);
        break;
    }

    // Create replica for tenant if auto-replica is enabled
    if (this.dbConfig.autoReplica) {
      await this.createTenantReplica(tenantId);
    }

    // Create archive for tenant if auto-archive is enabled
    if (this.dbConfig.autoArchive) {
      await this.createTenantArchive(tenantId);
    }
  }

  private async createTenantSchema(tenantId: string) {
    const schemaName = `tenant_${tenantId}`;
    const mainConnection = this.connections.get('main');
    if (!mainConnection) {
      throw new Error('Main connection not found');
    }

    // Create schema
    await mainConnection.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Create connection for this schema
    const mainConfig =
      this.dbConfig.connections[this.dbConfig.defaultConnection];
    const schemaConnection: DatabaseConnection = {
      ...mainConfig,
      name: `schema_${tenantId}`,
      schema: schemaName,
    };

    const dataSource = await this.createConnection(
      `schema_${tenantId}`,
      schemaConnection,
    );
    this.connections.set(`schema_${tenantId}`, dataSource);

    this.logger.log(`Created schema and connection for tenant: ${tenantId}`);
  }

  private async createTenantDatabase(tenantId: string) {
    const databaseName = `${this.dbConfig.connections[this.dbConfig.defaultConnection].database}_tenant_${tenantId}`;
    const mainConnection = this.connections.get('main');
    if (!mainConnection) {
      throw new Error('Main connection not found');
    }

    // Create database
    await mainConnection.query(`CREATE DATABASE "${databaseName}"`);

    // Create connection for this database
    const mainConfig =
      this.dbConfig.connections[this.dbConfig.defaultConnection];
    const tenantConnection: DatabaseConnection = {
      ...mainConfig,
      name: `tenant_${tenantId}`,
      database: databaseName,
    };

    const dataSource = await this.createConnection(
      `tenant_${tenantId}`,
      tenantConnection,
    );
    this.connections.set(`tenant_${tenantId}`, dataSource);

    this.logger.log(`Created database and connection for tenant: ${tenantId}`);
  }

  private async createTenantReplica(tenantId: string) {
    const replicaName = `replica_tenant_${tenantId}`;
    const mainConfig =
      this.dbConfig.connections[this.dbConfig.defaultConnection];

    let replicaConnection: DatabaseConnection;

    if (this.dbConfig.mode === DatabaseMode.MULTI_SCHEMA) {
      replicaConnection = {
        ...mainConfig,
        name: replicaName,
        database: `${mainConfig.database}_replica`,
        schema: `tenant_${tenantId}`,
      };
    } else {
      replicaConnection = {
        ...mainConfig,
        name: replicaName,
        database: `${mainConfig.database}_tenant_${tenantId}_replica`,
      };
    }

    const dataSource = await this.createConnection(
      replicaName,
      replicaConnection,
    );
    this.connections.set(replicaName, dataSource);

    this.logger.log(`Created replica for tenant: ${tenantId}`);
  }

  private async createTenantArchive(tenantId: string) {
    const archiveName = `archive_tenant_${tenantId}`;
    const mainConfig =
      this.dbConfig.connections[this.dbConfig.defaultConnection];

    let archiveConnection: DatabaseConnection;

    if (this.dbConfig.mode === DatabaseMode.MULTI_SCHEMA) {
      archiveConnection = {
        ...mainConfig,
        name: archiveName,
        database: `${mainConfig.database}_archive`,
        schema: `tenant_${tenantId}`,
      };
    } else {
      archiveConnection = {
        ...mainConfig,
        name: archiveName,
        database: `${mainConfig.database}_tenant_${tenantId}_archive`,
      };
    }

    const dataSource = await this.createConnection(
      archiveName,
      archiveConnection,
    );
    this.connections.set(archiveName, dataSource);

    this.logger.log(`Created archive for tenant: ${tenantId}`);
  }

  /**
   * Get repository for entity with automatic tenant routing
   */
  getRepository<T extends Record<string, any>>(
    entity: any,
    context?: TenantContext,
  ): Repository<T> {
    let connectionName = 'main';

    if (context?.tenantId) {
      switch (this.dbConfig.mode) {
        case DatabaseMode.MULTI_SCHEMA:
          connectionName = `schema_${context.tenantId}`;
          break;
        case DatabaseMode.MULTI_DATABASE:
          connectionName = `tenant_${context.tenantId}`;
          break;
      }
    }

    const connection = this.connections.get(connectionName);
    if (!connection) {
      throw new Error(`Connection '${connectionName}' not found`);
    }

    return connection.getRepository(entity);
  }

  /**
   * Get read-only repository (replica)
   */
  getReadOnlyRepository<T extends Record<string, any>>(
    entity: any,
    context?: TenantContext,
  ): Repository<T> {
    let connectionName = 'replica';

    if (context?.tenantId) {
      connectionName = `replica_tenant_${context.tenantId}`;
    }

    const connection = this.connections.get(connectionName);
    if (!connection) {
      // Fallback to main connection if replica not available
      return this.getRepository(entity, context);
    }

    return connection.getRepository(entity);
  }

  /**
   * Get archive repository
   */
  getArchiveRepository<T extends Record<string, any>>(
    entity: any,
    context?: TenantContext,
  ): Repository<T> {
    let connectionName = 'archive';

    if (context?.tenantId) {
      connectionName = `archive_tenant_${context.tenantId}`;
    }

    const connection = this.connections.get(connectionName);
    if (!connection) {
      throw new Error(
        `Archive connection not found for tenant: ${context?.tenantId}`,
      );
    }

    return connection.getRepository(entity);
  }

  /**
   * Execute query with automatic routing
   */
  async executeQuery(
    query: string,
    parameters: any[] = [],
    context?: TenantContext,
  ): Promise<any> {
    let connectionName = 'main';

    if (context?.tenantId) {
      switch (this.dbConfig.mode) {
        case DatabaseMode.MULTI_SCHEMA:
          connectionName = `schema_${context.tenantId}`;
          break;
        case DatabaseMode.MULTI_DATABASE:
          connectionName = `tenant_${context.tenantId}`;
          break;
      }
    }

    const connection = this.connections.get(connectionName);
    if (!connection) {
      throw new Error(`Connection '${connectionName}' not found`);
    }

    return connection.query(query, parameters);
  }

  /**
   * Get current mode
   */
  getMode(): DatabaseMode {
    return this.dbConfig.mode;
  }

  /**
   * Get all connections
   */
  getAllConnections(): Map<string, DataSource> {
    return new Map(this.connections);
  }

  /**
   * Check if tenant resources exist
   */
  async tenantExists(tenantId: string): Promise<boolean> {
    const connectionName =
      this.dbConfig.mode === DatabaseMode.MULTI_SCHEMA
        ? `schema_${tenantId}`
        : `tenant_${tenantId}`;

    return this.connections.has(connectionName);
  }
}
