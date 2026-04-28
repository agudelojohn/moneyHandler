// Ejemplo de cómo construir las llaves de forma consistente
export const getExpenseKeys = (userId: string, year: string, dateIso: string, isAnExpense: boolean) => {
    const dayMonth = dateIso.split('T')[0]; // YYYY-MM-DD
    return {
        PK: `${userId}#${year}`,
        SK: `${isAnExpense ? 'EXPENSE' : 'METADATA'}#${dayMonth}#${Date.now()}`
    };
};