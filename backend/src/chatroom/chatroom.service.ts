import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatroomService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly userService: UserService
    ) {}

    async getChatroom(id: string) {
        return this.prisma.chatroom.findUnique({
            where: {
                id: parseInt(id)
            }
        });
    }

    async createChatroom(name: string, sub: number) {
        const existingChatroom = await this.prisma.chatroom.findFirst({
            where: {
                name
            }
        });
        if (existingChatroom) {
            return new BadRequestException({ name: 'Chatroom with this name already exists' });
        }
    }

}
