import { Injectable, Inject } from '@nestjs/common';
import type { RecurringTransactionRepository } from 'src/domain/repositories/recurring-transaction.repository.interface';
import { TransactionGateway } from 'src/domain/repositories/transaction.gateway';
import { Transaction } from 'src/domain/entities/transaction/transaction.entity';
import { UseCase } from 'src/usecases/usecase';

export type ProcessRecurringTransactionsInput = {
  userId?: string; // Opcional: processar apenas um usuário específico
  date?: Date; // Opcional: data de referência (padrão: hoje)
};

export type ProcessRecurringTransactionsOutput = {
  processedCount: number;
  createdTransactions: number;
};

@Injectable()
export class ProcessRecurringTransactionsUseCase
  implements
    UseCase<
      ProcessRecurringTransactionsInput,
      ProcessRecurringTransactionsOutput
    >
{
  constructor(
    @Inject('RecurringTransactionRepository')
    private readonly recurringTransactionRepository: RecurringTransactionRepository,
    private readonly transactionGateway: TransactionGateway,
  ) {}

  public async execute({
    userId,
    date = new Date(),
  }: ProcessRecurringTransactionsInput): Promise<ProcessRecurringTransactionsOutput> {
    // Busca todas as transações recorrentes ativas
    let recurringTransactions =
      await this.recurringTransactionRepository.findActiveDueForProcessing();

    // Filtra por userId se fornecido
    if (userId) {
      recurringTransactions = recurringTransactions.filter(
        (rt) => rt.getUserId() === userId,
      );
    }

    let processedCount = 0;
    let createdTransactions = 0;

    for (const recurring of recurringTransactions) {
      const shouldProcess = this.shouldProcessRecurring(recurring, date);

      if (shouldProcess) {
        // Calcula a data da transação baseada na frequency
        const transactionDate = this.calculateTransactionDate(recurring, date);
        const existingTransaction = await this.findExistingTransactionForDay(
          recurring,
          transactionDate,
        );

        if (existingTransaction) {
          recurring.markAsProcessed(date);
          await this.recurringTransactionRepository.update(recurring);
          processedCount++;
          continue;
        }

        // Cria a transação
        const transaction = Transaction.create({
          userId: recurring.getUserId(),
          type: recurring.getType(),
          category: recurring.getCategory(),
          paymentMethod: recurring.getPaymentMethod() ?? undefined,
          amount: recurring.getAmount(),
          description: recurring.getDescription() ?? undefined,
          date: transactionDate,
          recurringTransactionId: recurring.getId(),
        });

        await this.transactionGateway.create(transaction);

        // Atualiza lastProcessed
        recurring.markAsProcessed(date);
        await this.recurringTransactionRepository.update(recurring);

        processedCount++;
        createdTransactions++;
      }
    }

    return {
      processedCount,
      createdTransactions,
    };
  }

  /**
   * Verifica se a transação recorrente deve ser processada
   */
  private shouldProcessRecurring(
    recurring: any,
    currentDate: Date,
  ): boolean {
    const startDate = recurring.getStartDate();
    const endDate = recurring.getEndDate();
    const lastProcessed = recurring.getLastProcessed();
    const frequency = recurring.getFrequency();

    // Verifica se já começou
    if (startDate > currentDate) {
      return false;
    }

    // Verifica se já terminou
    if (endDate && endDate < currentDate) {
      return false;
    }

    // Se nunca foi processado, processa apenas se a data atual for elegível
    // para a frequência configurada.
    if (!lastProcessed) {
      return this.isDueForFrequency(recurring, currentDate, startDate);
    }

    // Verifica baseado na frequência
    switch (frequency) {
      case 'DAILY':
        return this.shouldProcessDaily(lastProcessed, currentDate);
      case 'WEEKLY':
        return this.shouldProcessWeekly(
          lastProcessed,
          currentDate,
          recurring.getDayOfWeek(),
        );
      case 'MONTHLY':
        return this.shouldProcessMonthly(
          lastProcessed,
          currentDate,
          recurring.getDayOfMonth(),
        );
      case 'YEARLY':
        return this.shouldProcessYearly(lastProcessed, currentDate, startDate);
      default:
        return false;
    }
  }

  private isDueForFrequency(
    recurring: any,
    currentDate: Date,
    startDate: Date,
  ): boolean {
    switch (recurring.getFrequency()) {
      case 'DAILY':
        return true;
      case 'WEEKLY': {
        const dayOfWeek = recurring.getDayOfWeek();
        return dayOfWeek === null || currentDate.getDay() === dayOfWeek;
      }
      case 'MONTHLY':
        return this.isDueOnDayOfMonth(
          currentDate,
          recurring.getDayOfMonth(),
        );
      case 'YEARLY':
        return (
          currentDate.getMonth() === startDate.getMonth() &&
          currentDate.getDate() === startDate.getDate()
        );
      default:
        return false;
    }
  }

  private isDueOnDayOfMonth(
    currentDate: Date,
    dayOfMonth: number | null,
  ): boolean {
    if (dayOfMonth === null) {
      return true;
    }

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const lastDayOfMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
    ).getDate();
    const targetDay = Math.min(dayOfMonth, lastDayOfMonth);

    return currentDate.getDate() === targetDay;
  }

  /**
   * Verifica se deve processar diariamente
   */
  private shouldProcessDaily(lastProcessed: Date, currentDate: Date): boolean {
    const lastProcessedDay = new Date(lastProcessed);
    lastProcessedDay.setHours(0, 0, 0, 0);

    const currentDay = new Date(currentDate);
    currentDay.setHours(0, 0, 0, 0);

    return currentDay > lastProcessedDay;
  }

  /**
   * Verifica se deve processar semanalmente
   */
  private shouldProcessWeekly(
    lastProcessed: Date,
    currentDate: Date,
    dayOfWeek: number | null,
  ): boolean {
    // Verifica se passou pelo menos 7 dias
    const daysDiff = Math.floor(
      (currentDate.getTime() - lastProcessed.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysDiff < 7) {
      return false;
    }

    // Se dayOfWeek está definido, verifica se é o dia correto
    if (dayOfWeek !== null) {
      return currentDate.getDay() === dayOfWeek;
    }

    return true;
  }

  /**
   * Verifica se deve processar mensalmente
   */
  private shouldProcessMonthly(
    lastProcessed: Date,
    currentDate: Date,
    dayOfMonth: number | null,
  ): boolean {
    // Verifica se mudou de mês
    const lastMonth = lastProcessed.getMonth();
    const currentMonth = currentDate.getMonth();
    const lastYear = lastProcessed.getFullYear();
    const currentYear = currentDate.getFullYear();

    const monthsDiff =
      (currentYear - lastYear) * 12 + (currentMonth - lastMonth);

    if (monthsDiff < 1) {
      return false;
    }

    // Se dayOfMonth está definido, verifica se é o dia correto
    if (dayOfMonth !== null) {
      const currentDay = currentDate.getDate();
      // Ajusta para o último dia do mês se dayOfMonth > dias no mês
      const lastDayOfMonth = new Date(
        currentYear,
        currentMonth + 1,
        0,
      ).getDate();
      const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
      return currentDay === targetDay;
    }

    return true;
  }

  /**
   * Verifica se deve processar anualmente
   */
  private shouldProcessYearly(
    lastProcessed: Date,
    currentDate: Date,
    startDate: Date,
  ): boolean {
    // Verifica se passou pelo menos 1 ano
    const yearsDiff = currentDate.getFullYear() - lastProcessed.getFullYear();

    if (yearsDiff < 1) {
      return false;
    }

    // Verifica se é o mesmo mês e dia do ano que o startDate
    return (
      currentDate.getMonth() === startDate.getMonth() &&
      currentDate.getDate() === startDate.getDate()
    );
  }

  /**
   * Calcula a data da transação baseada na frequency
   */
  private calculateTransactionDate(recurring: any, currentDate: Date): Date {
    const frequency = recurring.getFrequency();

    switch (frequency) {
      case 'DAILY':
        return this.normalizeDate(new Date(currentDate));

      case 'WEEKLY': {
        const date = new Date(currentDate);
        const dayOfWeek = recurring.getDayOfWeek();
        if (dayOfWeek !== null) {
          // Ajusta para o dia da semana correto
          const currentDay = date.getDay();
          const diff = dayOfWeek - currentDay;
          date.setDate(date.getDate() + diff);
        }
        return this.normalizeDate(date);
      }

      case 'MONTHLY': {
        const date = new Date(currentDate);
        const dayOfMonth = recurring.getDayOfMonth();
        if (dayOfMonth !== null) {
          const lastDayOfMonth = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0,
          ).getDate();
          const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
          date.setDate(targetDay);
        }
        return this.normalizeDate(date);
      }

      case 'YEARLY': {
        const startDate = recurring.getStartDate();
        const date = new Date(currentDate);
        date.setMonth(startDate.getMonth());
        date.setDate(startDate.getDate());
        return this.normalizeDate(date);
      }

      default:
        return this.normalizeDate(new Date(currentDate));
    }
  }

  private normalizeDate(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

  private async findExistingTransactionForDay(
    recurring: any,
    transactionDate: Date,
  ): Promise<boolean> {
    const startDate = this.normalizeDate(transactionDate);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const { transactions } = await this.transactionGateway.findByUserId(
      recurring.getUserId(),
      { startDate, endDate },
    );

    return transactions.some(
      (transaction) =>
        transaction.getRecurringTransactionId() === recurring.getId(),
    );
  }
}
