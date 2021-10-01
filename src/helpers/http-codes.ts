import { STATUS_CODES } from 'http';

const codesBetween = Array.from({ length: 500 })
  .fill(0)
  .map((_, index) => 100 + index);

const httpCodes = codesBetween.reduce((codes, code) => {
  const codeString = STATUS_CODES[code];
  if (codeString) {
    codes[code] = `${code} ${codeString}`;
  }
  return codes;
}, {} as Record<number, string>);

export default httpCodes;
