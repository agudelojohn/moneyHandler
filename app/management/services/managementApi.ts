import type { ManagementObject, Deduction, ManagementRecordCreate } from "../types";
import type { ExpenseCategory } from "@/lib/aws/schemas/common";
import { withUserIdHeader } from "@/app/common/userSession";

export async function appendDeductionToManagementRecord(
    managementObject: ManagementObject,
    deductionObject: Deduction,
    userId: string,
    category: ExpenseCategory
) {
    const { description, amount, isCredit } = deductionObject;

    const updatedDeductions = [
        ...managementObject.deductions,
        {
            description: description.trim(),
            amount,
            isCredit,
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
            })),
        }),
    });

    if (!response.ok) {
        throw new Error("No se pudo actualizar deducciones");
    }

    return response.json();
}

export async function createManagementRecord(
    managementObject: ManagementRecordCreate,
    userId: string
) {
    const { category, initialAmount, creationDate, startDate, endDate } = managementObject;
    const response = await fetch("/api/management", {
        method: "POST",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({
            category,
            initialAmount,
            creationDate,
            startDate: `${startDate}T00:00:00.000Z`,
            endDate: `${endDate}T00:00:00.000Z`,
            deductions: [],
        }),
    });

    if (!response.ok) {
        const errorData: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(errorData.error);
    }

    return response.json();
}
