import {Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {SecretSantaEntity} from './secretsanta.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  mail: string;

  @ManyToOne(()=> SecretSantaEntity, (secretsanta) => secretsanta.users)
  @JoinTable()
  public secretSanta: SecretSantaEntity;

  @Column('integer', {array: true, nullable: true})
  forbidden: number[];
}