export type Deduction = {
    description: string;
    amount: number;
    isCredit: boolean;
    isPayed: boolean;
};

export type StaticPayment = Deduction & {
    paymentDay: string | null;
};

export type ManagementRecordCreate = {
    category: string;
    initialAmount: number;
    creationDate: string;
    startDate: string;
    endDate: string;
    deductions: Deduction[];
    staticPayments: StaticPayment[];
};

export type ManagementRecord = {
    id: string;
    category?: string;
    initialAmount: number;
    creationDate: string;
    startDate?: string;
    endDate?: string;
    deductions: Deduction[];
    staticPayments: StaticPayment[];
};

export type ManagementObject = {
    id: string;
    creationDate: string;
    deductions: Deduction[];
    staticPayments: StaticPayment[];
};