export type NotificationType =
  | "growth_reminder"
  | "nutrition_reminder"
  | "bmi_alert"
  | "new_articles";

export type NotificationSeverity = "info" | "warning" | "danger";

export interface NotificationDTO {
  /** ID stabil supaya dismissed-flag di localStorage konsisten. */
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  description: string;
  href: string;
  /** ISO timestamp; dipakai untuk relative time di UI. */
  createdAt: string;
}
