import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  async transform(value: { [fieldname: string]: Express.Multer.File[] }) {
    if (!value) return value;

    // ✅ Rules
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const MIN_SIZE = 10 * 1024;       // 10KB
    const MIN_DIM = 200;
    const MAX_DIM = 2000;

    // ✅ Loop over all uploaded files automatically
    for (const fieldName of Object.keys(value)) {
      const file = value[fieldName]?.[0];
      if (!file) continue;

      // ─── File size ─────
      if (file.size > MAX_SIZE) {
        throw new BadRequestException(`${fieldName} must be smaller than 2MB`);
      }
      if (file.size < MIN_SIZE) {
        throw new BadRequestException(`${fieldName} must be larger than 10KB`);
      }

      // ─── Dimensions ─────
      const metadata = await sharp(file.buffer).metadata();
      if (!metadata.width || !metadata.height) {
        throw new BadRequestException(`${fieldName} has invalid image data`);
      }
      if (metadata.width < MIN_DIM || metadata.height < MIN_DIM) {
        throw new BadRequestException(
          `${fieldName} must be at least ${MIN_DIM}x${MIN_DIM} pixels`
        );
      }
      if (metadata.width > MAX_DIM || metadata.height > MAX_DIM) {
        throw new BadRequestException(
          `${fieldName} must not exceed ${MAX_DIM}x${MAX_DIM} pixels`
        );
      }
    }

    return value; 
  }
}
