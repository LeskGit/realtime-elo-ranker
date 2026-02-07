import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
