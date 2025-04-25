import { z } from "zod";

export const unused = z.string().describe(
  `This lib is currently not used as we use drizzle-zod for simple schemas
   But as your application grows and you need other validators to share
   with back and frontend, you can put them in here
  `,
);

export const prettyPrint = (obj: string | object | number) => {
  if (typeof obj === "string") {
    console.log("*".repeat(30));
    console.log(obj);
    console.log("*".repeat(30));
  } else if (typeof obj === "object") {
    console.log(JSON.stringify(obj, null, 2));
  } else {
    console.log(obj);
  }
};
