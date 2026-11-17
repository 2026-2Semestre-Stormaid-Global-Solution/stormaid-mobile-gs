import { TextInputProps } from "react-native";

export interface InputFormType extends TextInputProps {
    label: string;
    placeholder: string;
    error?: boolean;
    onPress?: () => void;
    isIcon?: React.ReactNode;
}