import { Column, Entity, PrimaryColumn } from "typeorm";

// Cette classe représente l'entité Player qui sera utilisée par TypeORM pour interagir avec la base de données.

@Entity()
export class Player {

    @PrimaryColumn()
    id: string;

    @Column()
    rank: number;
}
