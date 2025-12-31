// export async function generatePromptText(formData: FormData) {
//   const jobDescription = formData.get("jobDescription") as string;
//   const jobTitle = formData.get("jobTitle") as string;
//   const companyName = formData.get("companyName") as string;
//   const promptText = `
//           JOB CONTEXT:
//           Role: ${jobTitle}
//           Company: ${companyName}
//           Job Description: ${jobDescription}

//           TASK:
//           Act as an expert Career Coach. Write a professional cover letter based on the attached PDF Resume.

//           RULES:
//           1. HEADER: Extract the candidate's Name, Email, and Phone from the PDF. Use them to fill the header. If not found, use "Syafrizal Wd Mahendra" as default name.
//           2. CONTENT: Match the candidate's specific skills (Next.js, TypeScript, etc.) from the PDF to the Job Description.
//           3. TONE: Confident, professional, yet human.
//           4. LENGTH: Max 350 words.
//           5. FORMAT: Use standard business letter format.
//           6. IMPORTANT: Do NOT leave any bracketed placeholders like [Your Name] or [Date]. Fill them with real data from the PDF or today's date.
//         `;

//   return promptText;
// }
