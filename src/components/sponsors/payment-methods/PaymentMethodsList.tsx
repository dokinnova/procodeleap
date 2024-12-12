import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Trash2 } from "lucide-react";

interface PaymentMethod {
  id: string;
  method: string;
  bank_name?: string;
  account_number?: string;
  card_last_four?: string;
  is_default?: boolean;
}

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  onDelete: (id: string) => void;
}

export const PaymentMethodsList = ({ paymentMethods, onDelete }: PaymentMethodsListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Métodos de pago registrados</h3>
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <p className="font-medium flex items-center gap-2">
              {method.method === "bank_transfer" && (
                <>
                  <Banknote className="h-4 w-4" />
                  <span>Transferencia bancaria</span>
                </>
              )}
              {method.method === "credit_card" && (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Tarjeta de crédito</span>
                </>
              )}
              {method.is_default && (
                <span className="ml-2 text-sm text-primary">(Principal)</span>
              )}
            </p>
            {method.bank_name && (
              <p className="text-sm text-gray-600">
                Banco: {method.bank_name}
              </p>
            )}
            {method.account_number && (
              <p className="text-sm text-gray-600">
                Cuenta: {method.account_number}
              </p>
            )}
            {method.card_last_four && (
              <p className="text-sm text-gray-600">
                Tarjeta: ****{method.card_last_four}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(method.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};