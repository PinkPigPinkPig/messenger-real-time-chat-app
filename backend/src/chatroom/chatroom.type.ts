import { Field, ID, ObjectType } from "@nestjs/graphql";
import { User } from "src/user/user.type";


@ObjectType()
export class Chatroom {
    @Field(() => ID, { nullable: true })
    id?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedAt?: Date;

    @Field(() => [User], { nullable: true })
    users: User[];

    @Field(() => [ID], { nullable: true })
    messages: Message[]
}

@ObjectType()
export class Message {
    @Field(() => ID, { nullable: true })
    id?: string;

    @Field({ nullable: true })
    content?: string;

    @Field({ nullable: true })
    imageUrl?: string;

    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedAt?: Date;

    @Field(() => User, { nullable: true })
    user?: User;

    @Field(() => Chatroom, { nullable: true })
    chatroom?: Chatroom;
}

@ObjectType()
export class UserTyping {
    @Field({ nullable: true })
    user?: User;

    @Field({ nullable: true })
    chatroomId?: number;
}

@ObjectType()
export class UserStoppedTyping extends UserTyping {}