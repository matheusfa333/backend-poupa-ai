import { User, UserRole } from 'src/domain/entities/user/user.entity';
import UserPrismaModel from '../user.prisma.model';

export class UserPrismaModelToUserEntityMapper {
  public static map(user: UserPrismaModel): User {
    const whatsappNumber = user.whatsappNumber;

    const anUser = User.with({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      whatsappNumber,
      role: user.role as UserRole,
      tokenVersion: user.tokenVersion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    return anUser;
  }
}
