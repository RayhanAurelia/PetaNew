export class FoodError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "FoodError";
  }
}

export class FoodNotFoundError extends FoodError {
  constructor() {
    super("Makanan tidak ditemukan", "FOOD_NOT_FOUND");
  }
}

export class FoodSearchFailedError extends FoodError {
  constructor(message = "Pencarian makanan gagal") {
    super(message, "FOOD_SEARCH_FAILED");
  }
}

export class FoodExternalApiError extends FoodError {
  constructor(message = "Layanan database makanan tidak tersedia") {
    super(message, "FOOD_EXTERNAL_API_ERROR");
  }
}

export class InvalidFoodQueryError extends FoodError {
  constructor(message = "Query pencarian tidak valid") {
    super(message, "INVALID_FOOD_QUERY");
  }
}
