"use client";
import { useState } from "react";

export function useFileChange() {
  const [fileName, setFileName] = useState<string>("");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return { fileName, handleFileChange };
}
