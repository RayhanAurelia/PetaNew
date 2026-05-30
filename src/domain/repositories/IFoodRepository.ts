import type { Food } from "../entities/food";

export interface SearchFoodsOptions {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface SearchFoodsResult {
  items: Food[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IFoodRepository {
  search(options: SearchFoodsOptions): Promise<SearchFoodsResult>;
  findById(id: string): Promise<Food | null>;
}
