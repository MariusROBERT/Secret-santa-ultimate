import {Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';
import {SecretSantaEntity} from './secretsanta.entity';

@Entity('app_user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  mail: string;

  @ManyToOne(() => SecretSantaEntity, (secretsanta) => secretsanta.users)
  @JoinTable()
  public secretSanta: SecretSantaEntity;

  @Column('integer', {array: true, nullable: true})
  forbidden: number[];

  @Column('integer', {nullable: true})
  gift_to: number;

  // Automatically sets the creation date when the entity is created
  @CreateDateColumn()
  creation_date: Date;
}
