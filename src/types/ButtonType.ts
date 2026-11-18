import { TouchableOpacityProps } from "react-native";

export interface ButtonType extends TouchableOpacityProps {
    backgroundColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
    width?: number;
    borderRadius?: number;
    fontFamily?: string;
    colorText?: string;
    fontSize?: number;
    iconRight?: React.ReactNode;
    iconLeft?: React.ReactNode;
    gap?: number;
}