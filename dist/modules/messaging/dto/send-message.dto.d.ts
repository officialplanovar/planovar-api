import { MessageType } from '@prisma/client';
export declare class AttachmentDto {
    url: string;
    publicId?: string;
    fileName?: string;
    fileType: string;
    fileSize: number;
}
export declare class SendMessageDto {
    content?: string;
    type: MessageType;
    voiceUrl?: string;
    voiceDuration?: number;
    quoteId?: string;
    attachments?: AttachmentDto[];
}
