export default function convertObjectToLiteralString(obj: object) {
  const entries = Object.entries(obj);
  const properties = entries
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}: '${value}'`;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        return `  ${key}: ${value}`;
      } else if (value === null) {
        return `  ${key}: null`;
      } else if (typeof value === 'object' && Array.isArray(value)) {
        return `  ${key}: [${value.map((v) => (typeof v === 'string' ? `'${v}'` : v)).join(', ')}]`;
      } else if (typeof value === 'object') {
        return `  ${key}: ${convertObjectToLiteralString(value)}`;
      } else {
        return `  ${key}: '${value}'`;
      }
    })
    .join(',\n');

  return `{\n${properties},\n}`;
}
