'use client';

import { useState, useTransition } from 'react';
import { generateCoverLetter } from './actions/generate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Upload, FileText, CheckCircle } from 'lucide-react'; // Tambah icon
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string>('');
  
  // STATE BARU: Untuk menyimpan nama file yang diupload
  const [fileName, setFileName] = useState<string>('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await generateCoverLetter(formData);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        alert('Gagal generate: ' + response.error);
      }
    });
  }

  // HANDLER BARU: Saat user memilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setFileName(e.target.files[0].name);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: INPUT FORM */}
        <Card className="h-fit shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Cover Letter Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Posisi/Jabatan</Label>
                  <Input id="jobTitle" name="jobTitle" placeholder="ex: Frontend Dev" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nama Perusahaan</Label>
                  <Input id="companyName" name="companyName" placeholder="ex: Tokopedia" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Deskripsi Pekerjaan (Copy-Paste)</Label>
                <Textarea 
                  id="jobDescription" 
                  name="jobDescription" 
                  placeholder="Paste kualifikasi pekerjaan di sini..." 
                  className="h-32"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Upload CV / Resume (PDF)</Label>
                
                {/* MODIFIKASI AREA UPLOAD */}
                <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition cursor-pointer relative ${
                    fileName ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'
                }`}>
                  
                  {fileName ? (
                      // TAMPILAN JIKA FILE SUDAH DIPILIH
                      <div className="flex flex-col items-center text-blue-600 animate-in fade-in zoom-in duration-300">
                          <CheckCircle className="w-8 h-8 mb-2" />
                          <p className="font-semibold text-sm text-center break-all">{fileName}</p>
                          <p className="text-xs text-blue-400 mt-1">Klik untuk ganti file</p>
                      </div>
                  ) : (
                      // TAMPILAN DEFAULT
                      <div className="flex flex-col items-center text-slate-500">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm">Klik untuk upload PDF</span>
                      </div>
                  )}

                  <Input 
                    id="resume" 
                    name="resume" 
                    type="file" 
                    accept=".pdf" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange} // Hubungkan handler disini
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sedang Meracik Kata...
                  </>
                ) : (
                  'Buat Cover Letter Sekarang'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* KOLOM KANAN: HASIL OUTPUT */}
        <Card className="h-full min-h-[500px] shadow-lg bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-slate-700">Hasil Surat Lamaran</CardTitle>
          </CardHeader>
          <CardContent className="p-8 prose prose-slate max-w-none">
            {result ? (
              <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                <Sparkles className="w-12 h-12 opacity-20" />
                <p>Hasil akan muncul di sini...</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}