import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SuppliersService } from './suppliers.service';
import { SuppliersResolver } from './suppliers.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  providers: [SuppliersResolver, SuppliersService],
  exports: [SuppliersService]
})
export class SuppliersModule { }