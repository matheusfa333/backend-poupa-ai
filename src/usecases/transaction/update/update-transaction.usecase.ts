import { Injectable } from '@nestjs/common';
import { TransactionGateway } from 'src/domain/repositories/transaction.gateway';
import { UseCase } from 'src/usecases/usecase';
import { TransactionNotFoundUsecaseException } from 'src/usecases/exceptions/transaction-not-found.usecase.exception';
import { UnauthorizedTransactionAccessUsecaseException } from 'src/usecases/exceptions/unauthorized-transaction-access.usecase.exception';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
} from 'src/domain/entities/transaction/transaction.entity';

export type UpdateTransactionInput = {
  transactionId: string;
  userId: string; // Para validar ownership
  type?: TransactionType;
  category?: TransactionCategory;
  paymentMethod?: PaymentMethod;
  amount?: number; // Em centavos
  description?: string;
  date?: Date;
};

export type UpdateTransactionOutput = {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT';
  category: string;
  paymentMethod?: string;
  amount: number;
  description?: string;
  date: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateTransactionUseCase
  implements UseCase<UpdateTransactionInput, UpdateTransactionOutput>
{
  public constructor(private readonly transactionGateway: TransactionGateway) {}

  public async execute({
    transactionId,
    userId,
    type,
    category,
    paymentMethod,
    amount,
    description,
    date,
  }: UpdateTransactionInput): Promise<UpdateTransactionOutput> {
    // 1. Busca a transação existente
    const existingTransaction =
      await this.transactionGateway.findById(transactionId);

    // 2. Verifica se existe
    if (!existingTransaction) {
      throw new TransactionNotFoundUsecaseException(transactionId);
    }

    // 3. Verifica ownership
    if (existingTransaction.getUserId() !== userId) {
      throw new UnauthorizedTransactionAccessUsecaseException(
        userId,
        transactionId,
      );
    }

    // 4. Cria nova instância com dados atualizados (usando .with para hidratar)
    const updatedTransaction = Transaction.with({
      id: existingTransaction.getId(),
      userId: existingTransaction.getUserId(),
      type: type ?? existingTransaction.getType(),
      category: category ?? existingTransaction.getCategory(),
      paymentMethod:
        paymentMethod !== undefined
          ? paymentMethod
          : existingTransaction.getPaymentMethod(),
      amount: amount ?? existingTransaction.getAmount(),
      description:
        description !== undefined
          ? description
          : existingTransaction.getDescription(),
      date: date ?? existingTransaction.getDate(),
      recurringTransactionId: existingTransaction.getRecurringTransactionId(),
      deletedAt: existingTransaction.getDeletedAt(),
      createdAt: existingTransaction.getCreatedAt(),
      updatedAt: new Date(), // Atualiza timestamp
    });

    // 5. Persiste no banco
    await this.transactionGateway.update(updatedTransaction);

    // 6. Retorna output
    return {
      id: updatedTransaction.getId(),
      type: updatedTransaction.getType(),
      category: updatedTransaction.getCategory(),
      paymentMethod: updatedTransaction.getPaymentMethod() ?? undefined,
      amount: updatedTransaction.getAmount(),
      description: updatedTransaction.getDescription() ?? undefined,
      date: updatedTransaction.getDate(),
      updatedAt: updatedTransaction.getUpdatedAt(),
    };
  }
}
