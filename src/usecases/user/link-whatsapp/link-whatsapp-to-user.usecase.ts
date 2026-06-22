import { Injectable } from '@nestjs/common';
import { UserGateway } from 'src/domain/repositories/user.gateway';
import { UserNotFoundUsecaseException } from 'src/usecases/exceptions/user-not-found.usecase.exception';
import { WhatsappAlreadyInUseUsecaseException } from 'src/usecases/exceptions/whatsapp-already-in-use.usecase.exception';
import { UseCase } from 'src/usecases/usecase';

export type LinkWhatsappToUserInput = {
  userId: string;
  whatsappNumber: string;
};

export type LinkWhatsappToUserOutput = {
  success: boolean;
  whatsappNumber: string;
};

@Injectable()
export class LinkWhatsappToUserUseCase
  implements UseCase<LinkWhatsappToUserInput, LinkWhatsappToUserOutput>
{
  public constructor(private readonly userGateway: UserGateway) {}

  public async execute({
    userId,
    whatsappNumber,
  }: LinkWhatsappToUserInput): Promise<LinkWhatsappToUserOutput> {
    // 1. Buscar o usuário pelo ID
    const user = await this.userGateway.findById(userId);

    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found while linking whatsapp with id ${userId} in ${LinkWhatsappToUserUseCase.name}.`,
        `Usuário não encontrado.`,
        LinkWhatsappToUserUseCase.name,
      );
    }

    // 2. Verificar se o WhatsApp já está vinculado a outra conta
    const existingUser =
      await this.userGateway.findByWhatsappNumber(whatsappNumber);

    if (existingUser && existingUser.getId() !== userId) {
      throw new WhatsappAlreadyInUseUsecaseException(
        `WhatsApp ${whatsappNumber} is already linked to user ${existingUser.getId()} in ${LinkWhatsappToUserUseCase.name}.`,
        `Este número de WhatsApp já está vinculado a outra conta.`,
        LinkWhatsappToUserUseCase.name,
      );
    }

    // 3. Atualizar o usuário com o número de WhatsApp
    user.updateWhatsappNumber(whatsappNumber);

    // 4. Salvar no banco de dados
    await this.userGateway.update(user);

    return {
      success: true,
      whatsappNumber: user.getWhatsappNumber() as string,
    };
  }
}
