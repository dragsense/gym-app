import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { Variant } from '../varinats/entities/variant.entity';

@Entity('products')
export class Product extends GeneralBaseEntity {
  @ApiProperty({ example: 'Product 1', description: 'Product name' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    example: 'Product 1 description',
    description: 'Product description',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Variant, (variant) => variant.product, {
    cascade: true,
  })
  variants: Variant[];
}
