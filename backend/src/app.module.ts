import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { TokenService } from './token/token.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ChatroomModule } from './chatroom/chatroom.module';
import { LiveChatroomModule } from './live-chatroom/live-chatroom.module';

const pubSub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    retryStrategy: (times) => {
      // reconnect after
      return Math.min(times * 50, 2000);
    },
  },
});

@Module({
  controllers: [AppController],
  providers: [AppService, TokenService],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/'
    }),
    AuthModule,
    UserModule,
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, AppModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: async (configService: ConfigService, tokenService: TokenService) => ({
        installSubscriptionHandlers: true,
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: true,
        subscriptions: {
          'subscriptions-transport-ws': true,
          'graphql-ws': true,
        },
        onConnect: (connectionParams) => {
          const token = tokenService.extractToken(connectionParams);

          if(!token) {
            throw new Error('Missing auth token!');
          }

          const user = tokenService.validateToken(token);

          if(!user) {
            throw new Error('Invalid auth token!');
          }
          return { user };
        },
        context: ({ req, res, connection }) => {
          if (connection) {
            return { req, res, user: connection.context.user, pubSub };
          }
          return { req, res };
        }
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatroomModule,
    LiveChatroomModule,
  ],
})
export class AppModule {}
