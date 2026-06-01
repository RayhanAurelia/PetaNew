import { createClient } from "@/lib/supabase/server";
import { SupabaseAuthRepository } from "../supabase/repositories/supabaseAuthRepository";
import { SupabaseSubjectRepository } from "../supabase/repositories/supabaseSubjectRepository";
import { SupabaseGrowthLogRepository } from "../supabase/repositories/supabaseGrowthLogRepository";
import { OpenFoodFactsRepository } from "../external/openFoodFactsRepository";
import { SupabaseNutritionLogRepository } from "../supabase/repositories/supabaseNutritionLogRepository";
import { RegisterUserUseCase } from "@/src/application/use-cases/auth/registerUserUseCase";
import { LoginUserUseCase } from "@/src/application/use-cases/auth/loginUserUseCase";
import { LogOutUserUseCase } from "@/src/application/use-cases/auth/logoutUserUseCase";
import { GetCurrentUserUseCase } from "@/src/application/use-cases/auth/getCurrentUserUseCase";
import { RequestPasswordResetUseCase } from "@/src/application/use-cases/auth/requestPasswordResetUseCase";
import { UpdatePasswordUseCase } from "@/src/application/use-cases/auth/updatePasswordUseCase";
import { ExchangeAuthCodeUseCase } from "@/src/application/use-cases/auth/exchangeAuthCodeUseCase";
import { ListSubjectsUseCase } from "@/src/application/use-cases/subjects/listSubjectsUseCase";
import { CreateSubjectUseCase } from "@/src/application/use-cases/subjects/createSubjectUseCase";
import { UpdateSubjectUseCase } from "@/src/application/use-cases/subjects/updateSubjectUseCase";
import { DeleteSubjectUseCase } from "@/src/application/use-cases/subjects/deleteSubjectUseCase";
import { ListGrowthLogsUseCase } from "@/src/application/use-cases/growthLogs/listGrowthLogsUseCase";
import { CreateGrowthLogUseCase } from "@/src/application/use-cases/growthLogs/createGrowthLogUseCase";
import { DeleteGrowthLogUseCase } from "@/src/application/use-cases/growthLogs/deleteGrowthLogUseCase";
import { SearchFoodsUseCase } from "@/src/application/use-cases/foods/searchFoodsUseCase";
import { GetFoodUseCase } from "@/src/application/use-cases/foods/getFoodUseCase";
import { ListNutritionLogsUseCase } from "@/src/application/use-cases/nutrition/listNutritionLogsUseCase";
import { CreateNutritionLogUseCase } from "@/src/application/use-cases/nutrition/createNutritionLogUseCase";
import { DeleteNutritionLogUseCase } from "@/src/application/use-cases/nutrition/deleteNutritionLogUseCase";
import { GetDailySummaryUseCase } from "@/src/application/use-cases/nutrition/getDailySummaryUseCase";

export async function getAuthUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);

  return {
    register: new RegisterUserUseCase(authRepo),
    login: new LoginUserUseCase(authRepo),
    logout: new LogOutUserUseCase(authRepo),
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    requestPasswordReset: new RequestPasswordResetUseCase(authRepo),
    updatePassword: new UpdatePasswordUseCase(authRepo),
    exchangeAuthCode: new ExchangeAuthCodeUseCase(authRepo),
  };
}

export async function getSubjectUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const subjectRepo = new SupabaseSubjectRepository(supabase);

  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    listSubjects: new ListSubjectsUseCase(subjectRepo),
    createSubject: new CreateSubjectUseCase(subjectRepo),
    updateSubject: new UpdateSubjectUseCase(subjectRepo),
    deleteSubject: new DeleteSubjectUseCase(subjectRepo),
  };
}

export function getFoodUseCases() {
  // Tidak butuh Supabase: source data dari OpenFoodFacts. Auth ditangani di route handler.
  const foodRepo = new OpenFoodFactsRepository();

  return {
    searchFoods: new SearchFoodsUseCase(foodRepo),
    getFood: new GetFoodUseCase(foodRepo),
  };
}

export async function getNutritionLogUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const subjectRepo = new SupabaseSubjectRepository(supabase);
  const nutritionRepo = new SupabaseNutritionLogRepository(supabase);

  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    listNutritionLogs: new ListNutritionLogsUseCase(
      nutritionRepo,
      subjectRepo,
    ),
    createNutritionLog: new CreateNutritionLogUseCase(
      nutritionRepo,
      subjectRepo,
    ),
    deleteNutritionLog: new DeleteNutritionLogUseCase(
      nutritionRepo,
      subjectRepo,
    ),
    getDailySummary: new GetDailySummaryUseCase(nutritionRepo, subjectRepo),
  };
}

export async function getGrowthLogUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const subjectRepo = new SupabaseSubjectRepository(supabase);
  const growthRepo = new SupabaseGrowthLogRepository(supabase);

  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    listGrowthLogs: new ListGrowthLogsUseCase(growthRepo, subjectRepo),
    createGrowthLog: new CreateGrowthLogUseCase(growthRepo, subjectRepo),
    deleteGrowthLog: new DeleteGrowthLogUseCase(growthRepo, subjectRepo),
  };
}
