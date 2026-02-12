import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Cette classe représente l'entité Match qui sera utilisée par TypeORM pour interagir avec la base de données.

@Entity()
export class Match {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    winnerId: string;

    @Column()
    loserId: string;

    @Column({ default: false })
    draw: boolean;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
