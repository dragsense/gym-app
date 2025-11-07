import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { Product } from '../../entities/product.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('variants')
export class Variant extends GeneralBaseEntity {
  @ApiProperty({ example: 'Variant 1', description: 'Variant name' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    example: 'Variant 1 description',
    description: 'Variant description',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 'SKU123', description: 'Variant SKU' })
  @Column({ type: 'varchar', length: 255 })
  sku: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @OneToMany(() => Inventory, (inventory) => inventory.variant, {
    cascade: true,
  })
  @JoinColumn()
  inventories: Inventory[];
}
