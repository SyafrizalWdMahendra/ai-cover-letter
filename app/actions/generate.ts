'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';

type GenerateResponse = 
  | { success: true; data: string }
  | { success: false; error: string };

export async function generateCoverLetter(formData: FormData): Promise<GenerateResponse> {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google Generative AI API key is missing. Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // Ambil data dari form
    const file = formData.get('resume') as File | null;
    const jobDescription = formData.get('jobDescription') as string | null;
    const jobTitle = formData.get('jobTitle') as string | null;
    const companyName = formData.get('companyName') as string | null;

    if (!file || !jobDescription) {
      throw new Error('Resume (PDF) dan Job Description wajib diisi.');
    }

    // Konversi PDF ke Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Prompt untuk Gemini
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

    console.log('Mengirim data ke Gemini (model: gemini-flash-latest)...');

    const result = await model.generateContent([
      promptText,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'application/pdf',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('--- Selesai generate cover letter ---');
    return { success: true, data: text };
  } catch (error: any) {
    console.error('Error generating cover letter:', error);
    return { success: false, error: error.message ?? 'Unknown error' };
  }
}