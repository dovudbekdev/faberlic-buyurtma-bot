import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  phone: string;

  @Column({ name: 'tg_username', nullable: false, type: 'varchar' })
  tgUsername: string;

  @Column({ name: 'tg_id', nullable: false, type: 'bigint' })
  tgId: number;
}
