import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export class SubscriptionType {
  static schema = z.enum(['free', 'pro']);

  private constructor(readonly value: z.infer<typeof SubscriptionType.schema>) {}

  static isValid(value: z.infer<typeof SubscriptionType.schema>) {
    try {
      this.schema.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  static create(value: z.infer<typeof SubscriptionType.schema>) {
    if (!SubscriptionType.isValid(value)) throw new BadRequestException();
    return new SubscriptionType(value);
  }
}
