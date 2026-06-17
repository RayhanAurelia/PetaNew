export class UserAdminError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "UserAdminError";
  }
}

export class AdminUserNotFoundError extends UserAdminError {
  constructor() {
    super("Pengguna tidak ditemukan", "ADMIN_USER_NOT_FOUND");
  }
}

export class CannotModifySelfError extends UserAdminError {
  constructor(message = "Anda tidak dapat melakukan aksi ini pada akun sendiri") {
    super(message, "CANNOT_MODIFY_SELF");
  }
}

export class UserAdminOperationFailedError extends UserAdminError {
  constructor(message = "Operasi pada pengguna gagal") {
    super(message, "USER_ADMIN_OPERATION_FAILED");
  }
}
