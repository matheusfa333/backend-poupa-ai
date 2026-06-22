import { UserPasswordValidatorFactory } from 'src/domain/factories/user-password.validator.factory';
import { UserValidatorFactory } from 'src/domain/factories/user-validator.factory';
import { Entity } from 'src/domain/shared/entities/entity';
import { Utils } from 'src/shared/utils/utils';
import { UserRole } from './user-role.enum';

export { UserRole };

export type UserCreateDto = {
  name?: string;
  email: string;
  password: string;
  whatsappNumber?: string;
  role?: UserRole;
};

export type UserWithDto = {
  id: string;
  name: string | null;
  email: string;
  password: string;
  whatsappNumber: string | null;
  role: UserRole;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

export class User extends Entity {
  private constructor(
    id: string,
    private name: string | null,
    private email: string,
    private password: string,
    private whatsappNumber: string | null,
    private role: UserRole,
    private tokenVersion: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static async create({
    name = undefined,
    email,
    password,
    whatsappNumber = undefined,
    role = UserRole.USER,
  }: UserCreateDto): Promise<User> {
    const id = Utils.generateUUID();

    UserPasswordValidatorFactory.create().validate(password);

    const hashedPassword = await Utils.encryptPassword(password);
    const createdAt = new Date();
    const updatedAt = new Date();

    return new User(
      id,
      name ?? null,
      email,
      hashedPassword,
      whatsappNumber ?? null,
      role,
      0,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    name,
    email,
    password,
    whatsappNumber,
    role,
    tokenVersion,
    createdAt,
    updatedAt,
  }: UserWithDto): User {
    return new User(id, name, email, password, whatsappNumber, role, tokenVersion, createdAt, updatedAt);
  }

  protected validate(): void {
    UserValidatorFactory.create().validate(this);
  }

  public getName(): string | null {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public async comparePassword(aPassword: string): Promise<boolean> {
    return Utils.comparePassword(aPassword, this.password);
  }

  public updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
    this.validate();
  }

  public updateEmail(email: string): void {
    this.email = email;
    this.updatedAt = new Date();
    this.validate();
  }

  public async updatePassword(newPassword: string): Promise<void> {
    UserPasswordValidatorFactory.create().validate(newPassword);
    this.password = await Utils.encryptPassword(newPassword);
    this.updatedAt = new Date();
  }

  public getTokenVersion(): number {
    return this.tokenVersion;
  }

  public incrementTokenVersion(): void {
    this.tokenVersion++;
    this.updatedAt = new Date();
  }

  public getWhatsappNumber(): string | null {
    return this.whatsappNumber;
  }

  public updateWhatsappNumber(whatsappNumber: string | null): void {
    if (whatsappNumber) {
      let normalized = whatsappNumber.replace(/[^\d+]/g, '');
      if (!normalized.startsWith('+')) {
        normalized = `+${normalized}`;
      }
      this.whatsappNumber = normalized;
    } else {
      this.whatsappNumber = null;
    }
    this.updatedAt = new Date();
    this.validate();
  }
}
