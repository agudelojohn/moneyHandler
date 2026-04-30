import type { ManagementObject, Deduction, ManagementRecordCreate } from "../types";


export async function appendDeductionToManagementRecord(managementObject: ManagementObject, deductionObject: Deduction) {

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: managementObject.id,
            date: managementObject.creationDate,
            deductions: updatedDeductions,
        }),
    });

    if (!response.ok) {
        throw new Error("No se pudo crear la deduccion");
    }

    return response.json();
}

export async function updateDeductionsInManagementRecord(managementObject: ManagementObject, deductionsCollection: Deduction[]) {
    const response = await fetch("/api/management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: managementObject.id,
            date: managementObject.creationDate,
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

export async function createManagementRecord(managementObject: ManagementRecordCreate) {
    const { initialAmount, creationDate, startDate, endDate } = managementObject;
    const response = await fetch("/api/management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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