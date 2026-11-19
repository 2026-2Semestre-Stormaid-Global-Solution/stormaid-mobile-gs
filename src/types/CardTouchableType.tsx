export interface CardTouchableType {
  children: React.ReactNode;
  width?: number;
  flexDirection?: 'column' | 'row';
  gap?: number;
  alignItems?: 'center' | 'flex-start' | 'flex-end'
  justifyContent?: 'center' | 'flex-start' | 'flex-end'
  borderBottomWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderLeftWidth?: number;
  borderWidth?: number;
  borderRadius?: number;
  borderColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  backgorundColor?: string;
  isActive?: boolean;
}