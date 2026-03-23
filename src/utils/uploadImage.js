// /utils/uploadImage.js
import supabase from "@/lib/supabaseClient";

export default async function uploadToSupabase(file, folder) {
  if (!file) return null;

  const now = new Date();
  const formattedDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;

  const fileName = `${folder}/${formattedDateTime}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
