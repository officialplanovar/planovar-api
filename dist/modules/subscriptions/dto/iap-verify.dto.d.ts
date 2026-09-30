import type { IapPlatform } from '../iap/iap-products';
export declare class IapVerifyDto {
    platform: IapPlatform;
    productId: string;
    purchaseToken: string;
}
