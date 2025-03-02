import * as schema from '../drizzle/schema';
import { InferSelectModel } from 'drizzle-orm';
import { Term } from 'src/domain/term';

export const mapTerm = (term: InferSelectModel<typeof schema.terms>) => {
  return new Term({
    id: term.id,
    type: term.type,
    isRequired: term.isRequired,
    content: term.content,
    title: term.title,
    createdAt: term.createdAt,
    updatedAt: term.updatedAt,
    deletedAt: term.deletedAt || undefined,
  });
};
