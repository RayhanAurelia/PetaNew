export class GrowthLogError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "GrowthLogError";
  }
}

export class GrowthLogNotFoundError extends GrowthLogError {
  constructor() {
    super("Catatan pengukuran tidak ditemukan", "GROWTH_LOG_NOT_FOUND");
  }
}

export class GrowthLogPermissionDeniedError extends GrowthLogError {
  constructor() {
    super(
      "Anda tidak memiliki akses ke catatan pengukuran ini",
      "GROWTH_LOG_PERMISSION_DENIED",
    );
  }
}

export class InvalidGrowthLogDataError extends GrowthLogError {
  constructor(message = "Data pengukuran tidak valid") {
    super(message, "INVALID_GROWTH_LOG_DATA");
  }
}

export class GrowthLogOperationFailedError extends GrowthLogError {
  constructor(message = "Operasi pada catatan pengukuran gagal") {
    super(message, "GROWTH_LOG_OPERATION_FAILED");
  }
}
