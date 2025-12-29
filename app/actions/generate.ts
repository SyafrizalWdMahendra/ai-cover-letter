'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Definisikan Tipe Data Balikan (Agar TypeScript Paham)
export interface GenerateResponse {
  success: boolean;
  data?: string | null;
  error?: string | null;
}

// 2. Pasang tipe ini di fungsi
export async function generateCoverLetter(formData: FormData): Promise<GenerateResponse> {
  try {
    console.log('--- Memulai Generasi Cover Letter (Gemini 2.0 Flash) ---');

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("API Key hilang");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Pastikan model ini sesuai dengan list yang Anda punya (gemini-2.0-flash)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const file = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const companyName = formData.get('companyName') as string;

    if (!file || !jobDescription) {
      throw new Error('Resume dan Job Description wajib diisi');
    }

    console.log('Mengkonversi PDF ke Base64...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

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

    console.log('Mengirim data ke Gemini 2.0...');
    
    const result = await model.generateContent([
      promptText,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('--- Selesai! ---');
    
    // PERBAIKAN DI SINI:
    // Kembalikan error: null agar strukturnya konsisten
    return { success: true, data: text, error: null };

  } catch (error: any) {
    console.error('Error generating cover letter:', error);
    
    // PERBAIKAN DI SINI:
    // Kembalikan data: null agar strukturnya konsisten
    return { success: false, data: null, error: error.message || 'Terjadi kesalahan sistem' };
  }
}