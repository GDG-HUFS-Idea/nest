import { UserAgreement } from './userAgreement';
import { TermType } from 'src/shared/type/enum.type';

export class Term {
  id?: number;
  type!: TermType;
  title!: string;
  content!: string;
  isRequired!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  userAgreements?: UserAgreement[];

  constructor(params: {
    id?: number;
    type: TermType;
    isRequired: boolean;
    title: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    userAgreements?: UserAgreement[];
  }) {
    this.id = params.id;
    this.type = params.type;
    this.isRequired = params.isRequired;
    this.title = params.title;
    this.content = params.content;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
    this.deletedAt = params.deletedAt;
    this.userAgreements = params.userAgreements;
  }
}
