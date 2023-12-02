import { createTemplate } from "../createTemplate.js";

describe("createTemplate", () => {
  it("should generate a template string with the given parts and keys", () => {
    const template = createTemplate<{
      name: string;
      age: number;
    }>`My name is ${"name"} and I am ${"age"} years old.`;

    const result = template({ name: "John", age: 25 });

    expect(result).toBe("My name is John and I am 25 years old.");
  });

  it("should handle missing or undefined property values", () => {
    const template = createTemplate<{
      name?: string;
      age?: number;
    }>`My name is ${"name"} and I am ${"age"} years old.`;

    const result = template({ name: undefined, age: 25 });

    expect(result).toBe("My name is  and I am 25 years old.");
  });
});
