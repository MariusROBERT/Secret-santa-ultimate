const available = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++)
    code += available.charAt(Math.floor(Math.random() * available.length));

  return code;
}
