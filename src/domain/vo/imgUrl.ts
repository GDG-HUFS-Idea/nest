import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export class ImgUrl {
  static schema = z.string().url();

  private constructor(
    readonly value: z.infer<typeof ImgUrl.schema>,
  ) {}

  static isValid(value: z.infer<typeof ImgUrl.schema>) {
    try {
      this.schema.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  static create(value: z.infer<typeof ImgUrl.schema>) {
    if (!ImgUrl.isValid(value)) throw new BadRequestException();
    return new ImgUrl(value);
  }
}
