import type {
    ManagementObject,
    Deduction,
    ManagementRecordCreate,
    ManagementRecord,
    StaticPayment,
} from "../types";
import { localCalendarDayToUtcIso } from "@/app/common/utils/dateHelpers";
import { withUserIdHeader } from "@/app/common/userSession";

export async function appendDeductionToManagementRecord(
    managementObject: ManagementObject,
    deductionObject: Deduction,
    userId: string,
    categoryId: string
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
            categoryId,
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
    categoryId: string
) {
    const response = await fetch("/api/management", {
        method: "PUT",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            id: managementObject.id,
            date: managementObject.creationDate,
            categoryId,
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
    categoryId: string
) {
    const response = await fetch("/api/management", {
        method: "PUT",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            id: managementRecord.id,
            date: managementRecord.creationDate,
            categoryId,
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

export async function updateRangeInManagementRecord(
    managementRecord: ManagementRecord,
    startDate: string,
    endDate: string,
    userId: string,
    categoryId: string
) {
    const response = await fetch("/api/management", {
        method: "PUT",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            id: managementRecord.id,
            date: managementRecord.creationDate,
            categoryId,
            deductions: managementRecord.deductions.map((item) => ({
                description: item.description.trim(),
                amount: item.amount,
                isCredit: item.isCredit,
                isPayed: item.isPayed,
            })),
            staticPayments: managementRecord.staticPayments.map((item) => ({
                description: item.description.trim(),
                amount: item.amount,
                isCredit: item.isCredit,
                isPayed: item.isPayed,
                paymentDay: item.paymentDay,
            })),
            startDate: localCalendarDayToUtcIso(startDate),
            endDate: localCalendarDayToUtcIso(endDate),
        }),
    });

    if (!response.ok) {
        const errorData: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "No se pudo actualizar el rango de fechas");
    }

    return response.json();
}

export async function createManagementRecord(
    managementObject: ManagementRecordCreate,
    userId: string
) {
    const { categoryId, initialAmount, creationDate, startDate, endDate, staticPayments } = managementObject;
    const response = await fetch("/api/management", {
        method: "POST",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            categoryId,
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
