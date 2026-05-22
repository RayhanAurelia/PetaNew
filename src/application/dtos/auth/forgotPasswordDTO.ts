export interface ForgotPasswordInputDTO {
  email: string;
  redirectUrl: string;
}

export interface ForgotPasswordOutputDTO {
  message: string;
}