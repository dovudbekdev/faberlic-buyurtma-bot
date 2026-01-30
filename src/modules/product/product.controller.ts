import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi mahsulot yaratish' })
  @ApiResponse({ status: 201, description: 'Mahsulot muvaffaqiyatli yaratildi' })
  @ApiResponse({ status: 400, description: 'Noto\'g\'ri so\'rov' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha mahsulotlarni olish' })
  @ApiResponse({ status: 200, description: 'Mahsulotlar ro\'yxati' })
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mahsulotni ID bo\'yicha olish' })
  @ApiParam({ name: 'id', type: Number, description: 'Mahsulot ID' })
  @ApiResponse({ status: 200, description: 'Mahsulot topildi' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mahsulotni yangilash' })
  @ApiParam({ name: 'id', type: Number, description: 'Mahsulot ID' })
  @ApiResponse({ status: 200, description: 'Mahsulot yangilandi' })
  @ApiResponse({ status: 400, description: 'Noto\'g\'ri so\'rov' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Mahsulotni o\'chirish' })
  @ApiParam({ name: 'id', type: Number, description: 'Mahsulot ID' })
  @ApiResponse({ status: 200, description: 'Mahsulot o\'chirildi' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
