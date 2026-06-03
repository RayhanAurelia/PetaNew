import type { LifeStage, Relationship } from "@/src/domain/entities/subject";

export interface SearchSubjectHit {
  id: string;
  name: string;
  relationship: Relationship;
  lifeStage: LifeStage;
}

export interface SearchArticleHit {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  targetLifeStage: LifeStage | null;
}

export interface SearchOutputDTO {
  query: string;
  subjects: SearchSubjectHit[];
  articles: SearchArticleHit[];
}
