import { Test, TestingModule } from '@nestjs/testing';
import { CrossWebsocketGateway } from './cross-websocket.gateway';

describe('CrossWebsocketGateway', () => {
  let gateway: CrossWebsocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrossWebsocketGateway],
    }).compile();

    gateway = module.get<CrossWebsocketGateway>(CrossWebsocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
