// "use server";

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { GenerateResponse } from "../types/response";
// import { prisma } from "@/lib/prisma";

// export async function generateCoverLetter(
//   formData: FormData
// ): Promise<GenerateResponse> {
//   try {
//     const { userId } = await auth();
//     const user = await currentUser();

//     if (!userId || !user) {
//       return {
//         success: false,
//         data: null,
//         error: "Anda harus login terlebih dahulu.",
//       };
//     }

//     let dbUser = await prisma.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!dbUser) {
//       dbUser = await prisma.user.create({
//         data: {
//           clerkUserId: userId,
//           email: user.emailAddresses[0].emailAddress,
//           credits: 3,
//         },
//       });
//     }

//     if (dbUser.credits <= 0) {
//       return {
//         success: false,
//         data: null,
//         error: "Kredit habis! Silakan top-up untuk melanjutkan.",
//       };
//     }

//     const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
//     if (!apiKey) throw new Error("API Key hilang");

//     const genAI = new GoogleGenerativeAI(apiKey);
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const file = formData.get("resume") as File;
//     const jobDescription = formData.get("jobDescription") as string;
//     const jobTitle = formData.get("jobTitle") as string;
//     const companyName = formData.get("companyName") as string;

//     if (!file || !jobDescription) throw new Error("Data tidak lengkap");

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const base64Data = buffer.toString("base64");

//     const promptText = `
//       JOB CONTEXT:
//       Role: ${jobTitle}
//       Company: ${companyName}
//       Job Description: ${jobDescription}

//       TASK:
//       Act as an expert Career Coach. Write a professional cover letter based on the attached PDF Resume.

//       RULES:
//       1. HEADER: Extract the candidate's Name, Email, and Phone from the PDF. Use them to fill the header. If not found, use "Syafrizal Wd Mahendra" as default name.
//       2. CONTENT: Match the candidate's specific skills (Next.js, TypeScript, etc.) from the PDF to the Job Description.
//       3. TONE: Confident, professional, yet human.
//       4. LENGTH: Max 350 words.
//       5. FORMAT: Use standard business letter format.
//       6. IMPORTANT: Do NOT leave any bracketed placeholders like [Your Name] or [Date]. Fill them with real data from the PDF or today's date.
//     `;

//     const result = await model.generateContent([
//       promptText,
//       { inlineData: { data: base64Data, mimeType: "application/pdf" } },
//     ]);
//     const response = await result.response;
//     const text = response.text();

//     await prisma.$transaction(async (tx) => {
//       await tx.coverLetter.create({
//         data: {
//           content: text,
//           jobTitle: jobTitle,
//           company: companyName,
//           userId: dbUser!.id,
//         },
//       });

//       await tx.user.update({
//         where: { id: dbUser!.id },
//         data: { credits: { decrement: 1 } },
//       });
//     });

//     return { success: true, data: text, error: null };
//   } catch (error: any) {
//     console.error("Error:", error);
//     return {
//       success: false,
//       data: null,
//       error: error.message || "Terjadi kesalahan sistem",
//     };
//   }
// }

"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GenerateResponse } from "../types/response";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateCoverLetter(
  formData: FormData
): Promise<GenerateResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        data: null,
        error: "Anda harus login terlebih dahulu.",
      };
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      console.log("User baru terdeteksi, mengambil data dari Clerk...");

      let emailUser = "";

      try {
        const user = await currentUser();
        emailUser = user?.emailAddresses[0]?.emailAddress || "";
      } catch (clerkError) {
        console.warn(
          "Gagal fetch currentUser, menggunakan fallback email.",
          clerkError
        );
        emailUser = `user_${userId.slice(0, 8)}@no-email.temp`;
      }

      if (!emailUser) emailUser = "no-email@provided.com";

      dbUser = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: emailUser,
          credits: 3,
        },
      });
    }

    if (dbUser.credits <= 0) {
      return {
        success: false,
        data: null,
        error: "Kredit habis! Silakan top-up untuk melanjutkan.",
      };
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("API Key hilang");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const file = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const companyName = formData.get("companyName") as string;

    if (!file || !jobDescription) throw new Error("Data tidak lengkap");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const promptText = `
      JOB CONTEXT:
      Role: ${jobTitle}
      Company: ${companyName}
      Job Description: ${jobDescription}

      TASK:
      Act as an expert Career Coach. Write a professional cover letter based on the attached PDF Resume.
      
      RULES:
      1. HEADER: Extract the candidate's Name, Email, and Phone from the PDF. Use them to fill the header. If not found, use "Syafrizal Wd Mahendra" as default name.
      2. CONTENT: Match the candidate's specific skills (Next.js, TypeScript, etc.) from the PDF to the Job Description.
      3. TONE: Confident, professional, yet human.
      4. LENGTH: Max 350 words.
      5. FORMAT: Use standard business letter format.
      6. IMPORTANT: Do NOT leave any bracketed placeholders like [Your Name] or [Date]. Fill them with real data from the PDF or today's date.
    `;

    const result = await model.generateContent([
      promptText,
      { inlineData: { data: base64Data, mimeType: "application/pdf" } },
    ]);
    const response = await result.response;
    const text = response.text();

    await prisma.$transaction(async (tx) => {
      await tx.coverLetter.create({
        data: {
          content: text,
          jobTitle: jobTitle,
          company: companyName,
          userId: dbUser!.id,
        },
      });

      await tx.user.update({
        where: { id: dbUser!.id },
        data: { credits: { decrement: 1 } },
      });
    });

    revalidatePath("/");

    return { success: true, data: text, error: null };
  } catch (error: any) {
    console.error("Action Error:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Terjadi kesalahan sistem",
    };
  }
}
