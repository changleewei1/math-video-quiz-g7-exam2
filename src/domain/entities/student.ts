export class Student {
  constructor(
    public readonly id: string,
    public readonly studentCode: string,
    public readonly name: string,
    public readonly grade: number,
    public readonly className: string | null,
    public readonly isActive: boolean,
    /** 若為 null，登入僅驗證學號（相容舊帳號） */
    public readonly passwordHash: string | null,
  ) {}

  canLogin(): boolean {
    return this.isActiveStudent();
  }

  isActiveStudent(): boolean {
    return this.isActive === true;
  }

  requiresPassword(): boolean {
    return this.passwordHash != null && this.passwordHash.length > 0;
  }
}
