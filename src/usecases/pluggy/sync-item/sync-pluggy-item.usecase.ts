import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Transaction } from 'src/domain/entities/transaction/transaction.entity';
import { PluggyItemRepository } from 'src/domain/repositories/pluggy-item.repository.interface';
import { TransactionGateway } from 'src/domain/repositories/transaction.gateway';
import { PluggyApiService } from 'src/infra/services/pluggy/pluggy-api.service';
import { PluggyCategorizerService } from 'src/infra/services/pluggy/pluggy-categorizer.service';

export class SyncPluggyItemUsecase {
  constructor(
    private readonly pluggyItemRepo: PluggyItemRepository,
    private readonly transactionGateway: TransactionGateway,
    private readonly pluggyApi: PluggyApiService,
    private readonly categorizer: PluggyCategorizerService,
  ) {}

  async execute(id: string, userId: string): Promise<{ imported: number }> {
    const item = await this.pluggyItemRepo.findById(id);
    if (!item) throw new NotFoundException('Conta bancária não encontrada');
    if (item.getUserId() !== userId) throw new ForbiddenException('Sem permissão');

    const accounts = await this.pluggyApi.getAccounts(item.getItemId());

    // Only sync from lastSyncAt or last 90 days (whichever is more recent)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const syncFrom = item.getLastSyncAt()
      ? new Date(Math.max(item.getLastSyncAt()!.getTime(), ninetyDaysAgo.getTime()))
      : ninetyDaysAgo;

    let imported = 0;

    for (const account of accounts) {
      // Only sync checking/savings accounts (not credit cards to avoid double counting)
      if (account.type !== 'BANK' && account.type !== 'CHECKING' && account.type !== 'SAVINGS') continue;

      const transactions = await this.pluggyApi.getTransactions(account.id, syncFrom);

      for (const tx of transactions) {
        const amountCents = Math.round(Math.abs(tx.amount) * 100);
        if (amountCents === 0) continue;

        const { type, category } = this.categorizer.categorize(
          tx.category,
          tx.description,
          tx.type,
        );

        const transaction = Transaction.create({
          userId,
          type,
          category,
          paymentMethod: 'TRANSFERENCIA',
          amount: amountCents,
          description: tx.description,
          date: new Date(tx.date),
        });

        try {
          await this.transactionGateway.create(transaction);
          imported++;
        } catch {
          // Skip duplicate or invalid transactions
        }
      }
    }

    item.markSynced();
    await this.pluggyItemRepo.update(item);

    return { imported };
  }
}
