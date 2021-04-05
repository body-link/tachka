import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { map } from 'rxjs/operators';
import { connection$ } from '../../config/typeorm';

@Entity({
  name: 'token',
})
export class TokenEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column('text', { nullable: false })
  jwt!: string;
}

export const tokenRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(TokenEntity))
);
