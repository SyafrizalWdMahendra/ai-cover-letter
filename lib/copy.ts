"use client";
import { useState } from "react";

export const handleCopy = () => {
  const [result, setResult] = useState<string>("");
  if (result) {
    navigator.clipboard
      .writeText(result)
      .then(() => {
        alert("Teks berhasil disalin!");
      })
      .catch((err) => {
        console.error("Gagal menyalin: ", err);
      });
  }
};
