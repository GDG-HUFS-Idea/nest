import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export class Username {
  static schema = z.string();

  private constructor(readonly value: z.infer<typeof Username.schema>) {}

  static isValid(value: z.infer<typeof Username.schema>) {
    try {
      this.schema.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  static create(value: z.infer<typeof Username.schema>) {
    if (!Username.isValid(value)) throw new BadRequestException();
    return new Username(value);
  }
}
