import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
	namespace: '/api-ai',
	cors: {
		origin: '*',
	},
})
export class CrossWebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
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

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}
}
