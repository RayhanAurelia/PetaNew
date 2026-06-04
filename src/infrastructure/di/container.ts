import { createClient } from "@/lib/supabase/server";
import { SupabaseAuthRepository } from "../supabase/repositories/supabaseAuthRepository";
import { SupabaseSubjectRepository } from "../supabase/repositories/supabaseSubjectRepository";
import { SupabaseGrowthLogRepository } from "../supabase/repositories/supabaseGrowthLogRepository";
import { OpenFoodFactsRepository } from "../external/openFoodFactsRepository";
import { SupabaseNutritionLogRepository } from "../supabase/repositories/supabaseNutritionLogRepository";
import { SupabaseArticleRepository } from "../supabase/repositories/supabaseArticleRepository";
import { RegisterUserUseCase } from "@/src/application/use-cases/auth/registerUserUseCase";
import { LoginUserUseCase } from "@/src/application/use-cases/auth/loginUserUseCase";
import { LogOutUserUseCase } from "@/src/application/use-cases/auth/logoutUserUseCase";
import { GetCurrentUserUseCase } from "@/src/application/use-cases/auth/getCurrentUserUseCase";
import { RequestPasswordResetUseCase } from "@/src/application/use-cases/auth/requestPasswordResetUseCase";
import { UpdatePasswordUseCase } from "@/src/application/use-cases/auth/updatePasswordUseCase";
import { ChangePasswordUseCase } from "@/src/application/use-cases/auth/changePasswordUseCase";
import { VerifyPasswordUseCase } from "@/src/application/use-cases/auth/verifyPasswordUseCase";
import { ExchangeAuthCodeUseCase } from "@/src/application/use-cases/auth/exchangeAuthCodeUseCase";
import { UpdateProfileUseCase } from "@/src/application/use-cases/auth/updateProfileUseCase";
import { ListSubjectsUseCase } from "@/src/application/use-cases/subjects/listSubjectsUseCase";
import { CreateSubjectUseCase } from "@/src/application/use-cases/subjects/createSubjectUseCase";
import { UpdateSubjectUseCase } from "@/src/application/use-cases/subjects/updateSubjectUseCase";
import { DeleteSubjectUseCase } from "@/src/application/use-cases/subjects/deleteSubjectUseCase";
import { ListGrowthLogsUseCase } from "@/src/application/use-cases/growthLogs/listGrowthLogsUseCase";
import { CreateGrowthLogUseCase } from "@/src/application/use-cases/growthLogs/createGrowthLogUseCase";
import { DeleteGrowthLogUseCase } from "@/src/application/use-cases/growthLogs/deleteGrowthLogUseCase";
import { SearchFoodsUseCase } from "@/src/application/use-cases/foods/searchFoodsUseCase";
import { GetFoodUseCase } from "@/src/application/use-cases/foods/getFoodUseCase";
import { SupabaseFoodRepository } from "../supabase/repositories/supabaseFoodRepository";
import { AdminListFoodsUseCase } from "@/src/application/use-cases/foods/adminListFoodsUseCase";
import { GetFoodByIdAdminUseCase } from "@/src/application/use-cases/foods/getFoodByIdAdminUseCase";
import { CreateFoodUseCase } from "@/src/application/use-cases/foods/createFoodUseCase";
import { UpdateFoodUseCase } from "@/src/application/use-cases/foods/updateFoodUseCase";
import { DeleteFoodUseCase } from "@/src/application/use-cases/foods/deleteFoodUseCase";
import { ListNutritionLogsUseCase } from "@/src/application/use-cases/nutrition/listNutritionLogsUseCase";
import { CreateNutritionLogUseCase } from "@/src/application/use-cases/nutrition/createNutritionLogUseCase";
import { DeleteNutritionLogUseCase } from "@/src/application/use-cases/nutrition/deleteNutritionLogUseCase";
import { GetDailySummaryUseCase } from "@/src/application/use-cases/nutrition/getDailySummaryUseCase";
import { ListArticlesUseCase } from "@/src/application/use-cases/articles/listArticlesUseCase";
import { GetArticleBySlugUseCase } from "@/src/application/use-cases/articles/getArticleBySlugUseCase";
import { AdminListArticlesUseCase } from "@/src/application/use-cases/articles/adminListArticlesUseCase";
import { GetArticleByIdUseCase } from "@/src/application/use-cases/articles/getArticleByIdUseCase";
import { CreateArticleUseCase } from "@/src/application/use-cases/articles/createArticleUseCase";
import { UpdateArticleUseCase } from "@/src/application/use-cases/articles/updateArticleUseCase";
import { DeleteArticleUseCase } from "@/src/application/use-cases/articles/deleteArticleUseCase";
import { GlobalSearchUseCase } from "@/src/application/use-cases/search/globalSearchUseCase";
import { SupabaseUserAdminRepository } from "../supabase/repositories/supabaseUserAdminRepository";
import { AdminListUsersUseCase } from "@/src/application/use-cases/users/adminListUsersUseCase";
import { UpdateUserUseCase } from "@/src/application/use-cases/users/updateUserUseCase";
import { DeleteUserUseCase } from "@/src/application/use-cases/users/deleteUserUseCase";
import { GetNotificationsUseCase } from "@/src/application/use-cases/notifications/getNotificationsUseCase";
import { SupabaseAuditLogRepository } from "../supabase/repositories/supabaseAuditLogRepository";
import { AdminListAuditLogsUseCase } from "@/src/application/use-cases/audit/adminListAuditLogsUseCase";

export async function getSearchUseCase() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    globalSearch: new GlobalSearchUseCase(supabase),
  };
}

export async function getNotificationsContainer() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    getNotifications: new GetNotificationsUseCase(supabase),
  };
}

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
    changePassword: new ChangePasswordUseCase(authRepo),
    verifyPassword: new VerifyPasswordUseCase(authRepo),
    exchangeAuthCode: new ExchangeAuthCodeUseCase(authRepo),
    updateProfile: new UpdateProfileUseCase(authRepo),
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
  const foodRepo = new OpenFoodFactsRepository();

  return {
    searchFoods: new SearchFoodsUseCase(foodRepo),
    getFood: new GetFoodUseCase(foodRepo),
  };
}

export async function getArticleUseCases() {
  const supabase = await createClient();
  const articleRepo = new SupabaseArticleRepository(supabase);

  return {
    listArticles: new ListArticlesUseCase(articleRepo),
    getArticleBySlug: new GetArticleBySlugUseCase(articleRepo),
  };
}

export async function getAdminAuditUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const auditRepo = new SupabaseAuditLogRepository(supabase);

  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    adminListAuditLogs: new AdminListAuditLogsUseCase(auditRepo),
  };
}

export async function getAdminUserUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const userRepo = new SupabaseUserAdminRepository(supabase);

  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    adminListUsers: new AdminListUsersUseCase(userRepo),
    updateUser: new UpdateUserUseCase(userRepo),
    deleteUser: new DeleteUserUseCase(userRepo),
  };
}

export async function getAdminFoodUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const foodRepo = new SupabaseFoodRepository(supabase);

  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    adminListFoods: new AdminListFoodsUseCase(foodRepo),
    getFoodById: new GetFoodByIdAdminUseCase(foodRepo),
    createFood: new CreateFoodUseCase(foodRepo),
    updateFood: new UpdateFoodUseCase(foodRepo),
    deleteFood: new DeleteFoodUseCase(foodRepo),
  };
}

export async function getAdminArticleUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const articleRepo = new SupabaseArticleRepository(supabase);

  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    adminListArticles: new AdminListArticlesUseCase(articleRepo),
    getArticleById: new GetArticleByIdUseCase(articleRepo),
    createArticle: new CreateArticleUseCase(articleRepo),
    updateArticle: new UpdateArticleUseCase(articleRepo),
    deleteArticle: new DeleteArticleUseCase(articleRepo),
  };
}

export async function getNutritionLogUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const subjectRepo = new SupabaseSubjectRepository(supabase);
  const nutritionRepo = new SupabaseNutritionLogRepository(supabase);

  return {
    getCurrentUser: new GetCurrentUserUseCase(authRepo),
    listNutritionLogs: new ListNutritionLogsUseCase(nutritionRepo, subjectRepo),
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
