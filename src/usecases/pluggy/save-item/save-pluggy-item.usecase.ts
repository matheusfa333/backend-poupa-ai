import { ConflictException } from '@nestjs/common';
import { PluggyItem } from 'src/domain/entities/pluggy/pluggy-item.entity';
import { PluggyItemRepository } from 'src/domain/repositories/pluggy-item.repository.interface';
import { PluggyApiService } from 'src/infra/services/pluggy/pluggy-api.service';

export class SavePluggyItemUsecase {
  constructor(
    private readonly repository: PluggyItemRepository,
    private readonly pluggyApi: PluggyApiService,
  ) {}

  async execute(userId: string, itemId: string) {
    const existing = await this.repository.findByItemId(itemId);
    if (existing && existing.getUserId() !== userId) {
      throw new ConflictException('Este banco já está conectado a outra conta');
    }

    const pluggyItem = await this.pluggyApi.getItem(itemId);
    const bankName = pluggyItem.connector?.name ?? null;
    const connectorId = pluggyItem.connector?.id ?? null;

    if (existing) {
      existing.updateStatus(pluggyItem.status);
      await this.repository.update(existing);
      return { id: existing.getId(), itemId, bankName, status: existing.getStatus() };
    }

    const item = PluggyItem.create({ userId, itemId, connectorId, bankName });
    await this.repository.create(item);
    return { id: item.getId(), itemId, bankName, status: item.getStatus() };
  }
}
