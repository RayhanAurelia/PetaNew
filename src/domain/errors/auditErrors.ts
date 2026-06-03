export class AuditError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AuditError";
  }
}

export class AuditOperationFailedError extends AuditError {
  constructor(message = "Gagal memuat log audit") {
    super(message, "AUDIT_OPERATION_FAILED");
  }
}
