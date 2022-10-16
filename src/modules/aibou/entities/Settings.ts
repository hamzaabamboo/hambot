import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AibouSettings {
  @PrimaryColumn()
  key: string;
  @Column()
  value: string;
}
