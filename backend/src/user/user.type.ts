import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field({ nullable: true })
  id?: number;

  @Field()
  fullname: string;

  @Field()
  email?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  created_at?: Date;

  @Field({ nullable: true })
  updated_at?: Date;
}
