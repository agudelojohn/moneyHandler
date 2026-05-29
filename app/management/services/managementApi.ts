import type {
    ManagementObject,
    Deduction,
    ManagementRecordCreate,
    ManagementRecord,
    StaticPayment,
} from "../types";
import type { ExpenseCategory } from "@/lib/aws/schemas/common";
import { localCalendarDayToUtcIso } from "@/app/common/utils/dateHelpers";
import { withUserIdHeader } from "@/app/common/userSession";

export async function appendDeductionToManagementRecord(
    managementObject: ManagementObject,
    deductionObject: Deduction,
    userId: string,
    category: ExpenseCategory
) {
    const { description, amount, isCredit, isPayed } = deductionObject;

    const updatedDeductions = [
        ...managementObject.deductions,
        {
            description: description.trim(),
            amount,
            isCredit,
            isPayed,
        },
    ];

    const response = await fetch("/api/management", {
        method: "PUT",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            id: managementObject.id,
            date: managementObject.creationDate,
            category,
            deductions: updatedDeductions,
            staticPayments: managementObject.staticPayments,
        }),
    });

    if (!response.ok) {
        throw new Error("No se pudo crear la deduccion");
    }

    return response.json();
}

export async function updateDeductionsInManagementRecord(
    managementObject: ManagementObject,
    deductionsCollection: Deduction[],
    userId: string,
    category: ExpenseCategory
) {
    const response = await fetch("/api/management", {
        method: "PUT",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            id: managementObject.id,
            date: managementObject.creationDate,
            category,
            deductions: deductionsCollection.map((item) => ({
                description: item.description.trim(),
                amount: item.amount,
                isCredit: item.isCredit,
                isPayed: item.isPayed,
            })),
            staticPayments: managementObject.staticPayments,
        }),
    });

    if (!response.ok) {
        throw new Error("No se pudo actualizar deducciones");
    }

    return response.json();
}

export async function updateStaticPaymentsInManagementRecord(
    managementRecord: Pick<ManagementRecord, "id" | "creationDate" | "deductions">,
    nextStaticPayments: StaticPayment[],
    userId: string,
    category: ExpenseCategory
) {
    const response = await fetch("/api/management", {
        method: "PUT",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            id: managementRecord.id,
            date: managementRecord.creationDate,
            category,
            deductions: managementRecord.deductions.map((item) => ({
                description: item.description.trim(),
                amount: item.amount,
                isCredit: item.isCredit,
                isPayed: item.isPayed,
            })),
            staticPayments: nextStaticPayments.map((item) => ({
                description: item.description.trim(),
                amount: item.amount,
                isCredit: item.isCredit,
                isPayed: item.isPayed,
                paymentDay: item.paymentDay,
            })),
        }),
    });

    if (!response.ok) {
        throw new Error("No se pudo actualizar pagos fijos");
    }

    return response.json();
}

export async function createManagementRecord(
    managementObject: ManagementRecordCreate,
    userId: string
) {
    const { category, initialAmount, creationDate, startDate, endDate, staticPayments } = managementObject;
    const response = await fetch("/api/management", {
        method: "POST",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            category,
            initialAmount,
            creationDate,
            startDate: localCalendarDayToUtcIso(startDate),
            endDate: localCalendarDayToUtcIso(endDate),
            deductions: [],
            staticPayments,
        }),
    });

    if (!response.ok) {
        const errorData: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(errorData.error);
    }

    return response.json();
}
