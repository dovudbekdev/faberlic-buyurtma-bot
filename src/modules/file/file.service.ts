import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface UploadedFilePayload {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService<AllConfigType>) { }

  async upload(file: UploadedFilePayload): Promise<{ url: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only images are allowed (jpeg, png, webp, gif)',
      );
    }

    const uploadDir = this.configService.get('app.uploadDir', { infer: true })!;
    const appBaseUrl = this.configService.get('app.appBaseUrl', {
      infer: true,
    })!;
    const filesPublicPath = this.configService.get('app.filesPublicPath', {
      infer: true,
    })!;

    await fs.mkdir(uploadDir, { recursive: true });

    const ext = MIME_TO_EXT[file.mimetype] ?? '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, file.buffer);

    const baseUrl = appBaseUrl.replace(/\/$/, '');
    const url = `${baseUrl}/${filesPublicPath}/${filename}`;

    return { url };
  }
}
