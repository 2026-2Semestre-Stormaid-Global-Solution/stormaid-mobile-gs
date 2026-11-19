export type MobilityStatusType = "AUTONOMOUS" | "ASSISTED" | "WHEELCHAIR_USER" | "BEDRIDDEN";

export type AccessibilityDataType = {
  mobilityStatus: MobilityStatusType;
  hasVisualImpairment: boolean;
  hasHearingImpairment: boolean;
  hasSpeechImpairment: boolean;
  hasCognitiveImpairment: boolean;
  equipmentDescription: string;
  preferNotToInformEquipment: boolean;
};

export type SectionAccessibilityType = {
  value: AccessibilityDataType;
  onChange: (changes: Partial<AccessibilityDataType>) => void;
  equipmentError: string | null;
};

export type SectionEssentialEquipmentsType = {
  equipmentDescription: string;
  preferNotToInformEquipment: boolean;
  error: string | null;
  onEquipmentChange: (value: string) => void;
  onPreferNotInformChange: () => void;
};