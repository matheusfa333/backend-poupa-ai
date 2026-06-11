import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessRecurringTransactionsUseCase } from './process-recurring-transactions.usecase';

@Injectable()
export class RecurringTransactionProcessorService {
  private readonly logger = new Logger(RecurringTransactionProcessorService.name);

  constructor(
    private readonly processRecurringTransactionsUseCase: ProcessRecurringTransactionsUseCase,
  ) {}

  /**
   * Executa o processamento de transações recorrentes a cada dia à meia-noite
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyProcessing() {
    this.logger.log('Iniciando processamento de transações recorrentes...');

    try {
      const result = await this.processRecurringTransactionsUseCase.execute({
        date: new Date(),
      });

      this.logger.log(
        `Processamento concluído: ${result.processedCount} transações processadas, ${result.createdTransactions} transações criadas`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao processar transações recorrentes: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Também executa a cada hora para processar transações que podem ter sido perdidas
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyProcessing() {
    const now = new Date();

    if (now.getHours() === 0) {
      return;
    }

    this.logger.debug('Verificando transações recorrentes pendentes...');

    try {
      const result = await this.processRecurringTransactionsUseCase.execute({
        date: now,
      });

      if (result.createdTransactions > 0) {
        this.logger.log(
          `Processamento extra concluído: ${result.processedCount} transações processadas, ${result.createdTransactions} transações criadas`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao processar transações recorrentes (verificação horária): ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Método manual para processar transações recorrentes
   * Útil para testes ou execução manual
   */
  async processNow(userId?: string) {
    this.logger.log(
      `Processamento manual de transações recorrentes${userId ? ` para o usuário ${userId}` : ''}...`,
    );

    try {
      const result = await this.processRecurringTransactionsUseCase.execute({
        userId,
        date: new Date(),
      });

      this.logger.log(
        `Processamento manual concluído: ${result.processedCount} transações processadas, ${result.createdTransactions} transações criadas`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao processar transações recorrentes manualmente: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
