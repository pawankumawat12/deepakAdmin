import { z } from "zod";

export function createEntitySchema(fields) {
  return z.object(
    Object.fromEntries(
      fields.map((field) => [
        field.key,
        field.type === "number"
          ? z.coerce.number().min(0, `${field.label} must be valid`)
          : z.string().trim().min(1, `${field.label} is required`),
      ])
    )
  );
}
