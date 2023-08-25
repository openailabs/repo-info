import { NextApiResponse } from "next";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// const handler2 = (req: NextRequest) => {
//   const headers = new Headers(req.headers);
//   headers.set("Content-Type", "application/json");
//   headers.set("Content-Encoding", "br");
//   const payload = { name: "John Doe" };
//   return NextResponse.json(payload, { headers });
// };

// const handler = () => {
//   const ret = NextResponse.json({ name: "John Doe" });
//   return ret;
// };

export {
  handler3 as GET,
  handler3 as POST,
  handler3 as PUT,
  handler3 as PATCH,
  handler3 as DELETE,
};

const handler3 = (_req: NextRequest) => {
  const result = { message: "hi" };
  console.log(`Api hello response body ${JSON.stringify(result)}`);
  return new NextResponse(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      // not working here
      // "Content-Encoding": "br",
    },
  });
};
