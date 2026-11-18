import { RootStackParamListType } from "./RootStackParamListType";

export interface TextLinkType {
    route: keyof RootStackParamListType;
    text: string;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    fontFamily?: string;
    fontSize?: number;
    textAlign?: 'center' | 'end' | 'start';
}