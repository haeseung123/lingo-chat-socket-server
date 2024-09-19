import { ConfigService } from '@nestjs/config';
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

	private apiServerURL: string;

	constructor(
		private readonly redisStorageService: RedisStorageService,
		private readonly configService: ConfigService,
	) {
		this.apiServerURL = this.configService.getOrThrow('API_SERVER_URL');
	}

	async postAccessToken(token: string) {
		try {
			const response = await fetch(`${this.apiServerURL}/auth/verify-token`, {
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

		console.log(`User connected: ${client.id}`);
	}

	async handleDisconnect(client: Socket) {
		const userId = client.data.user.result.provideId;
		await this.redisStorageService.del(`user:${userId}:socketId`);
		console.log(`User disconnected: ${client.id}`);
	}

	@SubscribeMessage('send_message')
	async handleMessage(client: Socket, payload: { message: string; personaId: number }) {
		const userId = client.data.user.result.provideId;
		const socketId = client.id;
		console.log(`Message from user ${userId}:`, payload.message);

		const response = await fetch(`${this.apiServerURL}/chats/receive-message`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: userId,
				socketId: socketId,
				personaId: payload.personaId,
				message: payload.message,
			}),
		});

		const data = await response.json();

		return data;
	}

	@SubscribeMessage('chat_message')
	async handleChatRoomMessage(client: Socket, payload: { chatRoomId: number; message: string }) {
		const user_id = client.data.user.result.provideId;
		const chat_room_id = payload.chatRoomId;
		const user_message = payload.message;

		const str = JSON.stringify({ user_id, chat_room_id, user_message });

		await this.redisStorageService.queue('user_ms_queue', str);
	}

	async findClientId(userId: string) {
		return await this.redisStorageService.get(`user:${userId}:socketId`);
	}

	async sendMessageToClient(userId: string, event: string, data: any) {
		const clientId = await this.findClientId(userId);
		if (clientId) {
			this.server.to(clientId).emit(`${event}_${data.chatRoomId}`, data);
			console.log(`Sent message to chat room ?? ${event}_${data.chatRoomId}:`, data.message);
		}
	}

	async sendNewChatRoom(userId: string, event: string, data: any) {
		const clientId = await this.findClientId(userId);

		if (clientId) {
			this.server.to(clientId).emit(event, data);
		}
	}
}
