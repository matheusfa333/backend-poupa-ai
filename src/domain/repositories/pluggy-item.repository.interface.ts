import { PluggyItem } from 'src/domain/entities/pluggy/pluggy-item.entity';

export interface PluggyItemRepository {
  create(item: PluggyItem): Promise<void>;
  findById(id: string): Promise<PluggyItem | null>;
  findByItemId(itemId: string): Promise<PluggyItem | null>;
  findByUserId(userId: string): Promise<PluggyItem[]>;
  update(item: PluggyItem): Promise<void>;
  delete(id: string): Promise<void>;
}
