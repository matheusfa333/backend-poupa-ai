import { Injectable } from '@nestjs/common';

import { UserGateway } from 'src/domain/repositories/user.gateway';
import { prismaClient } from '../../client.prisma';
import { UserPrismaModelToUserEntityMapper } from './mappers/user-prisma-model-to-user-entity.mapper';
import { UserEntityToUserPrismaModelMapper } from './mappers/user-entity-to-user-prisma-model.mapper';
import { User } from 'src/domain/entities/user/user.entity';

@Injectable()
export class UserPrismaRepository extends UserGateway {
  public constructor() {
    super();
  }

  public async findByEmail(email: string): Promise<User | null> {
    const aModel = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!aModel) {
      return null;
    }

    const anUser = UserPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findById(id: string): Promise<User | null> {
    const aModel = await prismaClient.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!aModel) {
      return null;
    }

    const anUser = UserPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findByWhatsappNumber(whatsappNumber: string): Promise<User | null> {
    let normalized = whatsappNumber.replace(/[^\d+]/g, '');
    if (!normalized.startsWith('+')) {
      normalized = `+${normalized}`;
    }

    const aModel = await prismaClient.user.findUnique({
      where: { whatsappNumber: normalized },
    });

    if (!aModel) return null;

    return UserPrismaModelToUserEntityMapper.map(aModel);
  }

  public async create(user: User): Promise<void> {
    // Transformando a entidade User no modelo que o Prisma entende
    const aModel = UserEntityToUserPrismaModelMapper.map(user);

    await prismaClient.user.create({
      data: aModel,
    });
  }

  public async update(user: User): Promise<void> {
    const aModel = UserEntityToUserPrismaModelMapper.map(user);

    await prismaClient.user.update({
      where: {
        id: user.getId(),
      },
      data: {
        name: aModel.name,
        email: aModel.email,
        password: aModel.password,
        whatsappNumber: aModel.whatsappNumber,
        updatedAt: aModel.updatedAt,
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await prismaClient.user.delete({
      where: {
        id: id,
      },
    });
  }
}
