export class ArticleError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ArticleError";
  }
}

export class ArticleNotFoundError extends ArticleError {
  constructor() {
    super("Artikel tidak ditemukan", "ARTICLE_NOT_FOUND");
  }
}

export class ArticleOperationFailedError extends ArticleError {
  constructor(message = "Operasi pada artikel gagal") {
    super(message, "ARTICLE_OPERATION_FAILED");
  }
}

export class InvalidArticleDataError extends ArticleError {
  constructor(message = "Data artikel tidak valid") {
    super(message, "INVALID_ARTICLE_DATA");
  }
}

export class ArticleSlugTakenError extends ArticleError {
  constructor() {
    super("Slug artikel sudah digunakan", "ARTICLE_SLUG_TAKEN");
  }
}
