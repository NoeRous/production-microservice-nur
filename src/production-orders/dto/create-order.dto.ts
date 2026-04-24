import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsDateString()
  productionDate: string;
}