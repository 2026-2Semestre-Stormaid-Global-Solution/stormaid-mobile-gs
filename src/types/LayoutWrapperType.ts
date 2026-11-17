import type { ReactNode } from "react";

export interface LayoutWrapperType {
  children: ReactNode;
  paddingHorizontal?: number;
  paddingBottom?: number;
  marginTop?: number;
  justifyContent?: "center" | "flex-end" | "flex-start";
  alignItems?: "center" | "flex-end" | "flex-start";
}