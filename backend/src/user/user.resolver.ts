import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/grapql-auth.guard';
import { User } from './user.type';
import { v4 as uuiv4 } from 'uuid';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { Request } from 'express';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => User)
  async updateProfile(
    @Args('fullname') fullname: string,
    @Args('file', { type: () => GraphQLUpload, nullable: true })
    file: GraphQLUpload.FileUpload,
    @Context() context: { req: Request },
  ) {
    const imageUrl = file ? await this.storeImageAndGetUrl(file) : null;
    const userId = context.req.user.sub;
    return this.userService.updateProfile(userId, fullname, imageUrl);
  }

  private async storeImageAndGetUrl(file: GraphQLUpload) {
    const { createReadStream, filename } = await file;
    const uniqueFilename = `${uuiv4()}_${filename}`;
    const imagePath = join(process.cwd(), 'public', 'images', uniqueFilename);
    const imageUrl = `${process.env.APP_URL}/${uniqueFilename}`;
    const readStream = createReadStream();
    readStream.pipe(createWriteStream(imagePath));
    return imageUrl;
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [User])
  async searchUsers(
    @Args('fullname') fullname: string,
    @Context() context: { req: Request },
  ) {
    return this.userService.searchUsers(fullname, context.req.user.sub);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [User])
  getUserOfChatroom(@Args('chatroomId') chatroomId: number) {
    return this.userService.getUserOfChatroom(chatroomId);
  }
}
