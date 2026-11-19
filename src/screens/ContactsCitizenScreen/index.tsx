import { useState } from "react";
import { View } from "react-native";
import LayoutWrapper from "../../components/LayoutWrapper";
import PageHeader from "../../components/PageHeader";
import SectionEmergencyContacts from "../../components/SectionEmergencyContacts";
import ModalEmergencyContact from "../../components/ModalEmergencyContact";
import { useAuth } from "../../context/AuthContext";
import { useEmergencyContact } from "../../hooks/useEmergencyContact";
import type { EmergencyContactFormType } from "../../types/EmergencyContactType";

export default function ContactsCitizenScreen() {
  const { token } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const { contact, loading, saving, error, refreshContact, saveContact } =
    useEmergencyContact(token);

  async function handleSave(contactData: EmergencyContactFormType) {
    await saveContact(contactData);
    setModalVisible(false);
  }

  return (
    <LayoutWrapper paddingHorizontal={0} paddingBottom={25}>
      <PageHeader
        title="Contatos"
        subtitle="Pessoas de confiança para momentos em que você precisar de ajuda."
        icon="people-outline"
      />

      <View style={{ paddingHorizontal: 20, paddingTop: 27 }}>
        <SectionEmergencyContacts
          contact={contact}
          loading={loading}
          error={error}
          onOpenModal={() => setModalVisible(true)}
          onRetry={() => { void refreshContact(); }}
        />
      </View>

      <ModalEmergencyContact
        visible={modalVisible}
        contact={contact}
        saving={saving}
        onClose={() => { if (!saving) setModalVisible(false); }}
        onSave={handleSave}
      />
    </LayoutWrapper>
  );
}
