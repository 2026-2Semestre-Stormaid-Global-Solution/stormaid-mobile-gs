import type { RelationshipType } from "../data/relationshipOptionsData";

export type EmergencyContactType = {
  name: string | null;
  phoneNumber: string | null;
  relationship: string | null;
};

export type EmergencyContactFormType = {
  name: string;
  phoneNumber: string;
  relationship: RelationshipType;
};

export type CitizenProfileContactResponseType = {
  emergencyContact: EmergencyContactType | null;
};
