import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/services/database/prisma/prisma.service';
import { PluggyItemRepository } from 'src/domain/repositories/pluggy-item.repository.interface';
import { PluggyItem } from 'src/domain/entities/pluggy/pluggy-item.entity';

@Injectable()
export class PrismaPluggyItemRepository implements PluggyItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: any): PluggyItem {
    return PluggyItem.with({
      id: raw.id,
      userId: raw.userId,
      itemId: raw.itemId,
      connectorId: raw.connectorId,
      bankName: raw.bankName,
      status: raw.status,
      lastSyncAt: raw.lastSyncAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async create(item: PluggyItem): Promise<void> {
    await this.prisma.pluggyItem.create({
      data: {
        id: item.getId(),
        userId: item.getUserId(),
        itemId: item.getItemId(),
        connectorId: item.getConnectorId(),
        bankName: item.getBankName(),
        status: item.getStatus(),
        lastSyncAt: item.getLastSyncAt(),
        createdAt: item.getCreatedAt(),
        updatedAt: item.getUpdatedAt(),
      },
    });
  }

  async findById(id: string): Promise<PluggyItem | null> {
    const raw = await this.prisma.pluggyItem.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByItemId(itemId: string): Promise<PluggyItem | null> {
    const raw = await this.prisma.pluggyItem.findUnique({ where: { itemId } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByUserId(userId: string): Promise<PluggyItem[]> {
    const rows = await this.prisma.pluggyItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async update(item: PluggyItem): Promise<void> {
    await this.prisma.pluggyItem.update({
      where: { id: item.getId() },
      data: {
        connectorId: item.getConnectorId(),
        bankName: item.getBankName(),
        status: item.getStatus(),
        lastSyncAt: item.getLastSyncAt(),
        updatedAt: item.getUpdatedAt(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pluggyItem.delete({ where: { id } });
  }
}
