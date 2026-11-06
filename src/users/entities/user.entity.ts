import 'reflect-metadata';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Cart } from 'src/carts/entities/cart.entity';

export enum UserRoles {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  fullName!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ default: 'user' })
  @Exclude()
  role!: UserRoles;

  @Column({
    name: 'refreshTokenHash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  refreshTokenHash!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Cart, (cart) => cart.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cart!: Cart | null;
}
