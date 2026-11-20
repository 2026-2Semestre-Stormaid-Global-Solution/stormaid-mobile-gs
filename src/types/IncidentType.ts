export type EmergencyCategory =
   "POLICE_DANGER"
  | "MEDICAL_EMERGENCY"
  | "FIRE_RESCUE"
  | "CLIMATE_DISASTER"
  | "UNKNOWN_EMERGENCY";

export type IncidentPublicStatus =
   "RECEIVED"
  | "UNDER_REVIEW"
  | "AWAITING_DISPATCH"
  | "DISPATCHED"
  | "EN_ROUTE"
  | "ON_SITE"
  | "RESOLVED"
  | "CANCELLED"
  | "CLOSED_NO_DISPATCH";

export type IncidentResponseType = {
  id: number;
  requesterUserId: number;
  recipientType: "SELF" | "DEPENDENT" | "THIRD_PARTY";
  channelType: "SOS_SILENT" | "TEXT_INPUT" | "VOICE_AUDIO";
  emergencyCategory: EmergencyCategory;
  publicStatus: IncidentPublicStatus;
  location: {
    latitude?: number | null;
    longitude?: number | null;
    addressText?: string | null;
    referencePoint?: string | null;
  } | null;
  createdAt: string;
};
