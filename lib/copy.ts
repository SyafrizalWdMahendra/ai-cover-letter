import { toast } from "sonner";

export const handleCopy = (text: string) => {
  if (!text) return;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success("Berhasil disalin!");
    })
    .catch((err) => {
      console.log("Gagal menyalin: ", err);
    });
};
