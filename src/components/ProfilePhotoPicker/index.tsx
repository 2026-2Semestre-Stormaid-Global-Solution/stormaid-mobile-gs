import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useProfileImage } from "../../context/ProfileImageContext";
import { uploadProfilePhoto } from "../../services/cloudinaryService";
import { FONTS } from "../../styles/style";
import ImageUser from "../ImageUser";

export default function ProfilePhotoPicker() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { setPhotoUrl } = useProfileImage();

  const [uploading, setUploading] = useState(false);

  async function handleSelectPhoto() {
    if (!user || uploading) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    setUploading(true);

    try {
      const photoUrl = await uploadProfilePhoto(result.assets[0]);

      await setPhotoUrl(photoUrl);

      Alert.alert("Foto atualizada", "Sua foto foi salva.");
    } catch (error) {
      Alert.alert(
        "Erro ao atualizar foto",
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <View
      style={{
        alignItems: "center",
        marginVertical: 22,
        gap: 12,
      }}
    >
      <Pressable
        onPress={handleSelectPhoto}
        disabled={uploading || !user}
        accessibilityRole="button"
        accessibilityLabel="Alterar foto de perfil"
        style={{ position: "relative" }}
      >
        <ImageUser size={100} iconColor={colors.primary} />

        <View
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            backgroundColor: colors.primary,
            borderRadius: 18,
            padding: 8,
            borderWidth: 2,
            borderColor: colors.surface,
          }}
        >
          <Ionicons name="camera-outline" size={17} color={colors.onPrimary} />
        </View>
      </Pressable>

      {uploading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text
          style={{
            fontFamily: FONTS.inter[500],
            color: colors.textSecondary,
            fontSize: 12,
            textAlign: "center",
          }}
        >
          {user
            ? "Toque na foto para alterar"
            : "Entre na sua conta para alterar a foto"}
        </Text>
      )}
    </View>
  );
}
