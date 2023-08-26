import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const handler = (_req: NextRequest) => {
  const result = { message: "hi" };
  console.log(`Api hello response body ${JSON.stringify(result)}`);
  console.log(`For husky and lint-staged test only 1234567890`);
  return new NextResponse(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      // not working here
      // "Content-Encoding": "br",
    },
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
