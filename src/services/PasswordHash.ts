import bcrypt from 'bcrypt';

export default class PasswordHashService {
  private static readonly saltRounds = 10;

  static createHash(plain: string) {
    return bcrypt.hashSync(plain, this.saltRounds);
  }
}
