import { NextResponse } from "next/server";
import { isValidAppUserId } from "@/app/common/userProfiles";

export const getUserIdFromRequest = (request: Request) => {
  const userId = request.headers.get("x-user-id");
  if (!isValidAppUserId(userId)) {
    return {
      userId: null,
      errorResponse: NextResponse.json(
        { error: "Usuario inválido o no seleccionado" },
        { status: 401 }
      ),
    };
  }
  return { userId, errorResponse: null };
};
