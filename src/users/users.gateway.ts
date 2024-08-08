import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisStorageService } from 'src/global/redis/redis-storage.service';

@WebSocketGateway({
	cors: {
		origin: '*', // 실제 배포 시에는 보안을 위해 특정 도메인으로 제한
	},
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly redisStorageService: RedisStorageService) {}

	async postAccessToken(token: string) {
		try {
			const response = await fetch('http://172.30.1.72:3000/auth/verify-token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token }),
			});

			return await response.json();
		} catch (e) {
			console.error('Token validation failed:', e.message);
		}
	}

	async handleConnection(client: Socket) {
		const token = client.handshake.query.accessToken as string;

		// 토큰이 없을 경우 디스커넥션
		if (!token) {
			client.emit('error', 'No token provided');
			client.disconnect();
			return;
		}

		const userData = await this.postAccessToken(token);

		client.data.user = userData;

		const userId = userData.result.provideId;
		const socketId = client.id;

		const isUserSocketInRedis = await this.redisStorageService.get(`user:${userId}:socketId`);
		if (isUserSocketInRedis) {
			const existingSocket = this.server.sockets.sockets.get(isUserSocketInRedis);
			if (existingSocket) {
				existingSocket.emit('error', '중복 로그인 감지로 인해 연결이 종료됩니다.');
				existingSocket.disconnect();

				await this.redisStorageService.del(`user:${userId}:socketId`);
			}
		}

		await this.redisStorageService.set(`user:${userId}:socketId`, socketId);
	}

	async handleDisconnect(client: Socket) {
		const userId = client.data.user.result.provideId;
		await this.redisStorageService.del(`user:${userId}:socketId`);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}
}
