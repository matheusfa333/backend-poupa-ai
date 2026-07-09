import { PluggyItemRepository } from 'src/domain/repositories/pluggy-item.repository.interface';

export class ListPluggyItemsUsecase {
  constructor(private readonly repository: PluggyItemRepository) {}

  async execute(userId: string) {
    const items = await this.repository.findByUserId(userId);
    return {
      items: items.map((item) => ({
        id: item.getId(),
        itemId: item.getItemId(),
        bankName: item.getBankName(),
        status: item.getStatus(),
        lastSyncAt: item.getLastSyncAt(),
        createdAt: item.getCreatedAt(),
      })),
    };
  }
}
