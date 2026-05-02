export type Deduction = {
    description: string;
    amount: number;
    isCredit: boolean;
};

export type ManagementRecordCreate = {
    category: string;
    initialAmount: number;
    creationDate: string;
    startDate: string;
    endDate: string;
    deductions: Deduction[];
};

export type ManagementRecord = {
    id: string;
    category?: string;
    initialAmount: number;
    creationDate: string;
    startDate?: string;
    endDate?: string;
    deductions: Deduction[];
};

export type ManagementObject = {
    id: string;
    creationDate: string;
    deductions: Deduction[];
};