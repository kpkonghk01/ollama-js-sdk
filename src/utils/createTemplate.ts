import type { Serializable } from "../interfaces/Serializable.js";

export function createTemplate<
  T extends Record<string | number | symbol, Serializable>
>(parts: TemplateStringsArray, ...keys: (keyof T)[]) {
  return (props: T) => {
    const serializer: (
      parts: TemplateStringsArray,
      keys: (keyof T)[],
      props: T
    ) => string = (parts, keys, props) => {
      let result = "";

      for (let i = 0; i < parts.length; i++) {
        result += parts[i];
        result += keys[i] ? props[keys[i] as keyof T]?.toString() ?? "" : "";
      }

      return result;
    };

    return serializer(parts, keys, props);
  };
}
