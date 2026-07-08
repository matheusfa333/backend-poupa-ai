import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  RecurringTransaction,
  RecurrenceFrequency,
  TransactionCategory,
  TransactionType,
  PaymentMethod,
} from 'src/domain/entities/recurring-transaction/recurring-transaction.entity';
import { RecurringTransactionRepository } from 'src/domain/repositories/recurring-transaction.repository.interface';

export interface UpdateRecurringTransactionInput {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod?: PaymentMethod | null;
  amount: number; // Em centavos
  description?: string | null;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date | null;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
}

export class UpdateRecurringTransactionUsecase {
  constructor(
    private readonly repository: RecurringTransactionRepository,
  ) {}

  async execute(input: UpdateRecurringTransactionInput) {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new NotFoundException('Transação fixa não encontrada');
    }

    if (existing.getUserId() !== input.userId) {
      throw new ForbiddenException('Sem permissão para editar esta transação fixa');
    }

    const updated = RecurringTransaction.with({
      id: existing.getId(),
      userId: existing.getUserId(),
      type: input.type,
      category: input.category,
      paymentMethod: input.paymentMethod ?? null,
      amount: input.amount,
      description: input.description ?? null,
      frequency: input.frequency,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      dayOfMonth: input.dayOfMonth ?? null,
      dayOfWeek: input.dayOfWeek ?? null,
      active: existing.isActive(),
      lastProcessed: existing.getLastProcessed(),
      deletedAt: existing.getDeletedAt(),
      createdAt: existing.getCreatedAt(),
      updatedAt: new Date(),
    });

    await this.repository.update(updated);

    return {
      id: updated.getId(),
      userId: updated.getUserId(),
      type: updated.getType(),
      category: updated.getCategory(),
      paymentMethod: updated.getPaymentMethod(),
      amount: updated.getAmount(),
      description: updated.getDescription(),
      frequency: updated.getFrequency(),
      startDate: updated.getStartDate(),
      endDate: updated.getEndDate(),
      dayOfMonth: updated.getDayOfMonth(),
      dayOfWeek: updated.getDayOfWeek(),
      active: updated.isActive(),
      lastProcessed: updated.getLastProcessed(),
      createdAt: updated.getCreatedAt(),
      updatedAt: updated.getUpdatedAt(),
    };
  }
}
