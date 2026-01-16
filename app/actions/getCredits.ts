"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getCredits() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return 0;
    }
    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        credits: true,
      },
    });

    return user ? user.credits : [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
