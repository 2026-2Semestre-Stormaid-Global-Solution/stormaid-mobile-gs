import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { useAuth } from "./AuthContext";

type ProfileImageContextType = {
  photoUrl: string | null;
  setPhotoUrl: (url: string | null) => void;
};

type PhotoState = {
  userId: number;
  url: string | null;
};

const ProfileImageContext = createContext<
  ProfileImageContextType | undefined
>(undefined);

export function ProfileImageProvider({
  children,
}: PropsWithChildren) {
  const { user } = useAuth();

  const [localPhoto, setLocalPhoto] =
    useState<PhotoState | null>(null);

  // Evita manter o estado local da foto ao trocar de conta.
  useEffect(() => {
    setLocalPhoto(null);
  }, [user?.id]);

  // Prioriza a foto atualizada durante a sessão.
  // Caso contrário, utiliza a URL recebida da API.
  const photoUrl = user
    ? localPhoto?.userId === user.id
      ? localPhoto.url
      : user.photoUrl ?? null
    : null;

  function setPhotoUrl(url: string | null) {
    if (!user) {
      return;
    }

    setLocalPhoto({
      userId: user.id,
      url: url?.trim() || null,
    });
  }

  return (
    <ProfileImageContext.Provider
      value={{ photoUrl, setPhotoUrl }}
    >
      {children}
    </ProfileImageContext.Provider>
  );
}

export function useProfileImage() {
  const context = useContext(ProfileImageContext);

  if (!context) {
    throw new Error(
      "useProfileImage deve ser utilizado dentro do ProfileImageProvider"
    );
  }

  return context;
}