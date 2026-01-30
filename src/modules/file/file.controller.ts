import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FileService, UploadedFilePayload } from './file.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({ summary: 'Rasm yuklash (jpeg, png, webp, gif, max 5MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Rasm fayli',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Fayl yuklandi, URL qaytariladi' })
  @ApiResponse({ status: 400, description: 'Fayl kiritilmagan yoki format xato' })
  upload(@UploadedFile() file: UploadedFilePayload | undefined) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.fileService.upload(file);
  }
}
