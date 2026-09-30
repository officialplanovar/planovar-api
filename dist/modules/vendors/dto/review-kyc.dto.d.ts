export declare enum KycDecision {
    APPROVE = "APPROVE",
    REJECT = "REJECT"
}
export declare class ReviewKycDto {
    decision: KycDecision;
    rejectionReason?: string;
}
