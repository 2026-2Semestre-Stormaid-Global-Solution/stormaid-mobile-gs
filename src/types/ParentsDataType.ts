import type { RelationshipType } from "../data/relationshipOptions";

export type ParentsDataType = {
  noEmergencyContact: boolean;
  emergencyContact: {
    name: string;
    phoneNumber: string;
    relationship: RelationshipType;
  } | null;
};

export type FormParentsType = {
  onContinue?: () => void;
};