export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid email or password", "INVALID_CREDENTIALS");
  }
}

export class EmailAlreadyInUseError extends AuthError {
  constructor() {
    super("Email is already in use", "EMAIL_ALREADY_IN_USE");
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super("User not found", "USER_NOT_FOUND");
  }
}

export class WeakPasswordError extends AuthError {
  constructor() {
    super("Password is too weak", "WEAK_PASSWORD");
  }
}

export class ProfileNotFoundError extends AuthError {
  constructor() {
    super("Profile not found", "PROFILE_NOT_FOUND");
  }
}

export class EmailVerificationRequiredError extends AuthError {
  constructor() {
    super(
      "Akun berhasil dibuat. Silakan cek email untuk konfirmasi.",
      "EMAIL_VERIFICATION_REQUIRED",
    );
  }
}

export class InvalidResetTokenError extends AuthError {
  constructor() {
    super(
      "Link reset password tidak valid atau sudah expired.",
      "INVALID_RESET_TOKEN",
    );
  }
}

export class PasswordResetFailedError extends AuthError {
  constructor(message = "Gagal mengirim link reset password.") {
    super(message, "PASSWORD_RESET_FAILED");
  }
}

export class PasswordUpdateFailedError extends AuthError {
  constructor(message = "Gagal mengganti password.") {
    super(message, "PASSWORD_UPDATE_FAILED");
  }
}

export class RateLimitExceededError extends AuthError {
  constructor() {
    super(
      "Terlalu banyak permintaan email. Coba lagi dalam 1 jam atau gunakan email lain.",
      "RATE_LIMIT_EXCEEDED",
    );
  }
}
