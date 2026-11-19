import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import * as SecureStore from "expo-secure-store";
import { useAuth } from "./AuthContext";

type ProfileImageContextType = {
  photoUrl: string | null;
  setPhotoUrl: (url: string | null) => Promise<void>;
  isPhotoLoading: boolean;
};

type StoredPhoto = {
  userId: number;
  url: string | null;
};

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(
  undefined,
);

function getPhotoKey(userId: number) {
  return `stormaid_profile_photo_${userId}`;
}

export function ProfileImageProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();

  const [storedPhoto, setStoredPhoto] = useState<StoredPhoto | null>(null);

  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  useEffect(() => {
    let active = true;

    setStoredPhoto(null);

    if (!user) {
      setIsPhotoLoading(false);
      return;
    }

    const userId = user.id;
    setIsPhotoLoading(true);

    async function loadPhoto() {
      try {
        const url = await SecureStore.getItemAsync(getPhotoKey(userId));

        if (active) {
          setStoredPhoto({ userId, url });
        }
      } catch (error) {
        console.warn("Erro ao recuperar foto:", error);
      } finally {
        if (active) {
          setIsPhotoLoading(false);
        }
      }
    }

    loadPhoto();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const photoUrl =
    user && storedPhoto?.userId === user.id ? storedPhoto.url : null;

  async function setPhotoUrl(url: string | null) {
    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    const userId = user.id;
    const normalizedUrl = url?.trim() || null;
    const key = getPhotoKey(userId);

    if (normalizedUrl) {
      await SecureStore.setItemAsync(key, normalizedUrl);
    } else {
      await SecureStore.deleteItemAsync(key);
    }

    setStoredPhoto({
      userId,
      url: normalizedUrl,
    });
  }

  return (
    <ProfileImageContext.Provider
      value={{
        photoUrl,
        setPhotoUrl,
        isPhotoLoading,
      }}
    >
      {children}
    </ProfileImageContext.Provider>
  );
}

export function useProfileImage() {
  const context = useContext(ProfileImageContext);

  if (!context) {
    throw new Error(
      "useProfileImage deve ser usado dentro do ProfileImageProvider.",
    );
  }

  return context;
}