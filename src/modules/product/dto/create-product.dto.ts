import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Krem', description: 'Mahsulot nomi' })
  name: string;

  @ApiProperty({ example: 150000, description: 'Narx (so\'m)' })
  price: number;

  @ApiPropertyOptional({ example: 'Terini namlash uchun', description: 'Tavsif' })
  description?: string;

  @ApiProperty({
    type: [String],
    example: ['https://example.com/image1.jpg'],
    description: 'Rasmlar URL lari',
  })
  images: string[];
}
