import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersGateway } from 'src/users/users.gateway';

@WebSocketGateway({
	namespace: '/api-ai',
	cors: {
		origin: '*',
	},
})
export class CrossWebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly usersGateway: UsersGateway) {}

	@WebSocketServer() server: Server;

	afterInit(server: Server) {
		console.log('API-AI Client WebSocket initialized');
	}

	handleConnection(client: Socket) {
		console.log(`API-AI Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`API-AI Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('created_new_chat_room')
	handleNewChatRoom(client: Socket, payload: any) {
		const { userId, ...room } = payload;

		this.usersGateway.sendNewChatRoom(userId, 'new_chat_room', room);
	}

	@SubscribeMessage('ai_chat_message')
	handleAIChatMessage(client: Socket, payload: any) {
		const { user_id, chat_room_id, response, is_final } = payload;
		const userId = user_id;
		const chatRoomId = chat_room_id;
		const message = response;
		const isFinal = is_final;

		this.usersGateway.sendMessageToClient(userId, 'new_chat_message', { chatRoomId, message, isFinal });
	}

	@SubscribeMessage('api_chat_message')
	handleNewChatMessage(client: Socket, payload: any) {
		const { userId, chatRoomId, message } = payload;

		this.usersGateway.sendMessageToClient(userId, 'new_chat_message', { chatRoomId, message });
		// this.sendMessageToClient(userId, 'new_chat_message', { chatRoomId, message });
	}
}
