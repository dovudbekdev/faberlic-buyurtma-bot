import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('products') 
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: 'varchar'})
    name: string;

    @Column({nullable: false, type: 'decimal'})
    price: number;

    @Column({nullable: true, type: 'varchar'})
    description: string;

    @Column({nullable: true, type: 'jsonb'})
    images?: string[];
}
