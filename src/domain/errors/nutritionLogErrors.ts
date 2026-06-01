export class NutritionLogError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "NutritionLogError";
  }
}

export class NutritionLogNotFoundError extends NutritionLogError {
  constructor() {
    super("Catatan konsumsi tidak ditemukan", "NUTRITION_LOG_NOT_FOUND");
  }
}

export class NutritionLogPermissionDeniedError extends NutritionLogError {
  constructor() {
    super(
      "Anda tidak memiliki akses ke catatan konsumsi ini",
      "NUTRITION_LOG_PERMISSION_DENIED",
    );
  }
}

export class InvalidNutritionLogDataError extends NutritionLogError {
  constructor(message = "Data catatan konsumsi tidak valid") {
    super(message, "INVALID_NUTRITION_LOG_DATA");
  }
}

export class NutritionLogOperationFailedError extends NutritionLogError {
  constructor(message = "Operasi pada catatan konsumsi gagal") {
    super(message, "NUTRITION_LOG_OPERATION_FAILED");
  }
}
