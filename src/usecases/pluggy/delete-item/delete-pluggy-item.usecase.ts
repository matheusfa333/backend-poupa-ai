import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PluggyItemRepository } from 'src/domain/repositories/pluggy-item.repository.interface';

export class DeletePluggyItemUsecase {
  constructor(private readonly repository: PluggyItemRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException('Conta bancária não encontrada');
    if (item.getUserId() !== userId) throw new ForbiddenException('Sem permissão');
    await this.repository.delete(id);
  }
}
