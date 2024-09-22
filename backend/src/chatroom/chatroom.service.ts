import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatroomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async getChatroom(id: string) {
    return this.prisma.chatroom.findUnique({
      where: {
        id: parseInt(id),
      },
    });
  }

  async createChatroom(name: string, sub: number) {
    const existingChatroom = await this.prisma.chatroom.findFirst({
      where: {
        name,
      },
    });
    if (existingChatroom) {
      throw new BadRequestException({
        name: 'Chatroom with this name already exists',
      });
    }

    return this.prisma.chatroom.create({
      data: {
        name,
        users: {
          connect: {
            id: sub,
          },
        },
      },
    });
  }

  async addUserToChatroom(chatroomId: number, userIds: number[]) {
    const existingChatroom = await this.prisma.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
    });

    if (!existingChatroom) {
      throw new BadRequestException({
        name: 'Chatroom does not exist',
      });
    }

    return await this.prisma.chatroom.update({
      where: {
        id: chatroomId,
      },
      data: {
        users: {
          connect: userIds.map((id) => ({ id })),
        },
      },
      include: {
        users: true, // Eager load users
      },
    });
  }

  async getChatroomsForUser(userId: number) {
    return this.prisma.chatroom.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          orderBy: {
            createdAt: 'desc',
          },
        },

        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async sendMessage(
    chatroomId: number,
    message: string,
    userId: number,
    imagePath: string,
  ) {
    return await this.prisma.message.create({
      data: {
        content: message,
        imageUrl: imagePath,
        chatroomId,
        userId,
      },
      include: {
        chatroom: {
          include: {
            users: true,
          },
        },
        user: true,
      },
    });
  }

  async saveImage(image: {
    createReadStream: () => any;
    fileName: string;
    mimetype: string;
  }) {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!validImageTypes.includes(image.mimetype)) {
      throw new BadRequestException({
        image: 'Invalid image type',
      });
    }

    const imageName = `${Date.now()}-${image.fileName}`;
    const imagePAth = `${this.configService.get('IMAGE_PATH')}/${imageName}`;
    const stream = image.createReadStream();
    const output = `./public${imagePAth}`;
    const writeStream = createWriteStream(output);
    stream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('end', resolve);
      writeStream.on('error', reject);
    });

    return imagePAth;
  }

  async getMessagesForChatroom(chatroomId: number) {
    return this.prisma.message.findMany({
      where: {
        chatroomId: chatroomId,
      },
      include: {
        chatroom: {
          include: {
            users: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        user: true,
      },
    });
  }

  async deleteChatroom(chatroomId: number) {
    return this.prisma.chatroom.delete({
      where: {
        id: chatroomId,
      },
    });
  }
}
