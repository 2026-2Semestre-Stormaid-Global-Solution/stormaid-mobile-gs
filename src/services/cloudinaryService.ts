import type { ImagePickerAsset } from "expo-image-picker";
import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

type CloudinaryResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export async function uploadProfilePhoto(
  asset: ImagePickerAsset,
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary não configurado.");
  }

  const file = new File(asset.uri);

  if (!file.exists) {
    throw new Error("Imagem selecionada não encontrada.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A imagem deve ter no máximo 2 MB.");
  }

  const mimeType = asset.mimeType || file.type;

  if (!["image/jpeg", "image/png"].includes(mimeType)) {
    throw new Error("Selecione uma imagem JPEG ou PNG.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const result = (await response.json()) as CloudinaryResponse;

  if (!response.ok) {
    throw new Error(
      result.error?.message ||
        `Falha ao enviar imagem. HTTP ${response.status}.`,
    );
  }

  if (!result.secure_url?.startsWith("https://")) {
    throw new Error("Cloudinary não retornou uma URL válida.");
  }

  return result.secure_url;
}