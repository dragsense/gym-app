import { Entity, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { Variant } from '../../varinats/entities/variant.entity';
import { EInventoryType } from '@shared/enums';

@Entity('inventory')
export class Inventory extends GeneralBaseEntity {
  @ApiProperty({ example: 'Inventory 1', description: 'Inventory name' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    example: 'Inventory 1 description',
    description: 'Inventory description',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 'Inventory 1 unit', description: 'Inventory unit' })
  @Column({ type: 'varchar', length: 255 })
  unit: string;

  @ApiProperty({ example: 100, description: 'Inventory quantity' })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ example: EInventoryType.IN, description: 'Inventory type' })
  @Column({ type: 'enum', enum: EInventoryType, default: EInventoryType.IN })
  type: EInventoryType;

  @ManyToOne(() => Variant, (variant) => variant.inventories, {
    onDelete: 'CASCADE',
  })
  variant: Variant;
}
