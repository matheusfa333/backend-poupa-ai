import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { UseCase } from 'src/usecases/usecase';
import type { RecurringTransactionRepository } from 'src/domain/repositories/recurring-transaction.repository.interface';

export interface DeleteRecurringTransactionInput {
  id: string;
  userId: string;
}

export interface DeleteRecurringTransactionOutput {
  success: boolean;
}

@Injectable()
export class DeleteRecurringTransactionUsecase
  implements
    UseCase<DeleteRecurringTransactionInput, DeleteRecurringTransactionOutput>
{
  constructor(
    @Inject('RecurringTransactionRepository')
    private readonly recurringTransactionRepository: RecurringTransactionRepository,
  ) {}

  async execute(
    input: DeleteRecurringTransactionInput,
  ): Promise<DeleteRecurringTransactionOutput> {
    const recurringTransaction =
      await this.recurringTransactionRepository.findById(input.id);

    if (!recurringTransaction) {
      throw new NotFoundException('Transação recorrente não encontrada');
    }

    if (recurringTransaction.getUserId() !== input.userId) {
      throw new NotFoundException('Transação recorrente não encontrada');
    }

    await this.recurringTransactionRepository.delete(input.id);

    return { success: true };
  }
}
