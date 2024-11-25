import {Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn, Unique, CreateDateColumn} from 'typeorm';
import {UserEntity} from './user.entity';

@Entity('secretsanta')
export class SecretSantaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({nullable: false, unique: true})
  code: string;

  @OneToMany(() => UserEntity, (user) => user.secretSanta, {nullable: true})
  @JoinTable()
  public users: UserEntity[];

  @Column({type: 'timestamptz'})
  mail_date: Date

  // Automatically sets the creation date when the entity is created
  @CreateDateColumn()
  creation_date: Date;
}
