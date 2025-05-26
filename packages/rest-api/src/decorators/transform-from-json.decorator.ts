import { Transform } from "class-transformer";

export const TransformFromJson = () => Transform(
    ({ value }) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },
    { toClassOnly: true },
  )