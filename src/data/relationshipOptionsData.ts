export const RELATIONSHIP_OPTIONS = [
  { label: "Mãe", value: "MOTHER" },
  { label: "Pai", value: "FATHER" },
  { label: "Cônjuge", value: "SPOUSE" },
  { label: "Filho(a)", value: "CHILD" },
  { label: "Irmão(ã)", value: "SIBLING" },
  { label: "Avô ou avó", value: "GRANDPARENT" },
  { label: "Tio(a)", value: "UNCLE_AUNT" },
  { label: "Amigo(a)", value: "FRIEND" },
  { label: "Vizinho(a)", value: "NEIGHBOR" },
  { label: "Outro", value: "OTHER" },
] as const;

export type RelationshipType =
  (typeof RELATIONSHIP_OPTIONS)[number]["value"];