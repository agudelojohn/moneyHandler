import type { StaticPayment } from "./types";

/** Copia los pagos fijos como borrador: el pago del registro anterior no se arrastra. */
export function copyStaticPaymentsAsDraft(payments: StaticPayment[]): StaticPayment[] {
    return payments.map((payment) => ({
        description: payment.description,
        amount: payment.amount,
        isCredit: payment.isCredit,
        isPayed: false,
        paymentDay: null,
    }));
}
