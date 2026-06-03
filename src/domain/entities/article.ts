import type { LifeStage } from "./subject";

export class Article {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly excerpt: string | null,
    public readonly content: string,
    public readonly coverImageUrl: string | null,
    public readonly targetLifeStage: LifeStage | null,
    public readonly authorId: string | null,
    public readonly authorName: string | null,
    public readonly isPublished: boolean,
    public readonly publishedAt: Date | null,
    public readonly viewCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
