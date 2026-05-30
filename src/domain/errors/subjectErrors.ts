export class SubjectError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "SubjectError";
  }
}

export class SubjectNotFoundError extends SubjectError {
  constructor() {
    super("Subjek tidak ditemukan", "SUBJECT_NOT_FOUND");
  }
}

export class SubjectPermissionDeniedError extends SubjectError {
  constructor() {
    super(
      "Anda tidak memiliki akses ke subjek ini",
      "SUBJECT_PERMISSION_DENIED",
    );
  }
}

export class PrimarySelfAlreadyExistsError extends SubjectError {
  constructor() {
    super(
      "Sudah ada subjek utama (primary self). Hanya 1 primary self per akun.",
      "PRIMARY_SELF_ALREADY_EXISTS",
    );
  }
}

export class InvalidSubjectDataError extends SubjectError {
  constructor(message = "Data subjek tidak valid") {
    super(message, "INVALID_SUBJECT_DATA");
  }
}

export class SubjectOperationFailedError extends SubjectError {
  constructor(message = "Operasi pada subjek gagal") {
    super(message, "SUBJECT_OPERATION_FAILED");
  }
}
