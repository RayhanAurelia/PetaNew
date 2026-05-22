import { createClient } from "@/lib/supabase/server";
import { SupabaseAuthRepository } from "../supabase/repositories/supabaseAuthRepository";
import { RegisterUserUseCase } from "@/src/application/use-cases/auth/registerUserUseCase";
import { LoginUserUseCase } from "@/src/application/use-cases/auth/loginUserUseCase";
import { LogOutUserUseCase } from "@/src/application/use-cases/auth/logoutUserUseCase";
import { GetCurrentUserUseCase } from "@/src/application/use-cases/auth/getCurrentUserUseCase";
import { RequestPasswordResetUseCase } from "@/src/application/use-cases/auth/requestPasswordResetUseCase";
import { UpdatePasswordUseCase } from "@/src/application/use-cases/auth/updatePasswordUseCase";
import { ExchangeAuthCodeUseCase } from "@/src/application/use-cases/auth/exchangeAuthCodeUseCase";

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
