export type RegisterRequestType = {
  fullName: string;
  email: string;
  phoneNumber: string;
  cpf: string;
  birthDate: string;
  password: string;
};

export type RegisterResponseType = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  status: string;
};

export type RegisterResultType = {
  user: RegisterResponseType;
  draftCleared: boolean;
};