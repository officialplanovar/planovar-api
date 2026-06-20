export declare const emailTemplates: {
    otp(otp: string, purpose: "verify" | "reset" | "login"): {
        subject: string;
        html: string;
    };
    bookingRequest(data: {
        clientName: string;
        vendorName: string;
        listingTitle: string;
        eventDate: string;
        eventLocation: string;
        requirements?: string;
    }): {
        subject: string;
        html: string;
    };
    bookingConfirmed(data: {
        clientName: string;
        vendorName: string;
        listingTitle: string;
        eventDate: string;
        eventLocation: string;
    }): {
        subject: string;
        html: string;
    };
    bookingCancelled(data: {
        recipientName: string;
        listingTitle: string;
        eventDate: string;
        cancelledBy: string;
        reason?: string;
    }): {
        subject: string;
        html: string;
    };
    quoteReceived(data: {
        clientName: string;
        vendorName: string;
        listingTitle: string;
        amount: string;
        validUntil: string;
    }): {
        subject: string;
        html: string;
    };
    quoteAccepted(data: {
        vendorName: string;
        clientName: string;
        listingTitle: string;
        amount: string;
    }): {
        subject: string;
        html: string;
    };
    paymentReceived(data: {
        vendorName: string;
        clientName: string;
        listingTitle: string;
        amount: string;
        installmentLabel?: string;
    }): {
        subject: string;
        html: string;
    };
    payoutProcessed(data: {
        vendorName: string;
        amount: string;
        bankAccount: string;
    }): {
        subject: string;
        html: string;
    };
    installmentDue(data: {
        clientName: string;
        vendorName: string;
        listingTitle: string;
        amount: string;
        dueDate: string;
        label: string;
    }): {
        subject: string;
        html: string;
    };
    reviewRequested(data: {
        clientName: string;
        vendorName: string;
        listingTitle: string;
    }): {
        subject: string;
        html: string;
    };
    disputeOpened(data: {
        adminSubject: string;
        bookingId: string;
        raisedBy: string;
        reason: string;
    }): {
        subject: string;
        html: string;
    };
    welcome(data: {
        firstName: string;
        role: "client" | "vendor";
    }): {
        subject: string;
        html: string;
    };
};
