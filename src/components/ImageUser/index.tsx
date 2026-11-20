
import { useState } from "react";
import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useProfileImage } from "../../context/ProfileImageContext";

type ImageUserProps = {
  size?: number;
  iconColor?: string;
};

export default function ImageUser({
  size = 45,
  iconColor,
}: ImageUserProps) {
  const { colors } = useTheme();
  const { photoUrl } = useProfileImage();

  const [failedUrl, setFailedUrl] =
    useState<string | null>(null);

  const hasPhoto = Boolean(
    photoUrl &&
    /^https:\/\//i.test(photoUrl) &&
    failedUrl !== photoUrl
  );

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.onPrimary + "25",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {hasPhoto && photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          resizeMode="cover"
          accessibilityLabel="Foto de perfil"
          onError={() => setFailedUrl(photoUrl)}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      ) : (
        <Ionicons
          name="person-outline"
          size={size * 0.53}
          color={iconColor ?? colors.onPrimary}
        />
      )}
    </View>
  );
}