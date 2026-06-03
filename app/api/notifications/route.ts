import { NextResponse } from "next/server";
import { getNotificationsContainer } from "@/src/infrastructure/di/container";
import { handleApiError } from "../_utils/errorHandler";

export async function GET() {
  try {
    const { getCurrentUser, getNotifications } =
      await getNotificationsContainer();
    const user = await getCurrentUser.execute();
    const items = await getNotifications.execute(user.id);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return handleApiError(error);
  }
}
