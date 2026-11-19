export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  const first = digits.slice(0, 3);
  const second = digits.slice(3, 6);
  const third = digits.slice(6, 9);
  const last = digits.slice(9, 11);

  let result = first;

  if (digits.length > 3) result += `.${second}`;
  if (digits.length > 6) result += `.${third}`;
  if (digits.length > 9) result += `-${last}`;

  return result;
}

export function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, "");

  if (!/^\d{11}$/.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  for (let position = 9; position <= 10; position++) {
    let sum = 0;

    for (let i = 0; i < position; i++) {
      sum += Number(cpf[i]) * (position + 1 - i);
    }

    const remainder = (sum * 10) % 11;
    const digit = remainder === 10 ? 0 : remainder;

    if (digit !== Number(cpf[position])) return false;
  }

  return true;
}

export function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function toIsoBirthDate(value: string): string | null {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 8) return null;

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  if (year < 1 || month < 1 || month > 12) return null;

  const leapYear =
    year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);

  const daysPerMonth = [
    31, leapYear ? 29 : 28, 31, 30,
    31, 30, 31, 31, 30, 31, 30, 31,
  ];

  if (day < 1 || day > daysPerMonth[month - 1]) {
    return null;
  }

  const isoDate = [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");

  const today = new Date();
  const todayIso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return isoDate > todayIso ? null : isoDate;
}
