import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from "../../products/entities/product.entity";

@Entity()
export class Supplier {
    @ApiProperty({ description: 'The unique identifier of the supplier' })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({ description: 'The name of the supplier' })
    @Column()
    name: string;

    @ApiProperty({ description: 'email of the supplier' })
    @Column()
    contactEmail: string;
    
    @ApiProperty({ description: 'Supplier Products', type: ()=> [Product] })
    @OneToMany(()=>Product, (product) => product.supplier, { cascade:["insert","update","remove"] })
    products: Product[];
}