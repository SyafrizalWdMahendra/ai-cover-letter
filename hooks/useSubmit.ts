"use client";
import { generateCoverLetter } from "@/app/actions/generate";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function useSubmit() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string>("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await generateCoverLetter(formData);
      if (response.success && response.data) {
        setResult(response.data);
        router.refresh();
      } else {
        alert("Gagal generate: " + (response.error ?? "Terjadi kesalahan"));
      }
    });
  }

  return { isPending, result, handleSubmit };
}
