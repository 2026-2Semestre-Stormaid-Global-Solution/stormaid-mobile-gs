import { TextInputProps } from "react-native";

export interface InputFormType extends TextInputProps {
    label: string;
    placeholder: string;
    error?: boolean;
    onPress?: () => void;
    isIcon?: React.ReactNode;
    fontSizeLabel?: number;
    color?: string;
    gap?: number;
    width?: number;
}