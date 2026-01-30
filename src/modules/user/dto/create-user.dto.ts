import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Ali', description: 'Foydalanuvchi ismi' })
  name: string;

  @ApiProperty({ example: '+998901234567', description: 'Telefon raqami' })
  phone: string;

  @ApiProperty({ example: 123456789, description: 'Telegram ID' })
  tgId: number;

  @ApiProperty({ example: 'ali_user', description: 'Telegram username' })
  tgUsername: string;
}
