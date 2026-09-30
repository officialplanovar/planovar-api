import { Server } from 'socket.io';
export declare class ChatRealtimeService {
    private readonly logger;
    private server?;
    setServer(server: Server): void;
    static userRoom(userId: string): string;
    emitMessage(conversationId: string, message: unknown, participantUserIds?: string[]): void;
}
