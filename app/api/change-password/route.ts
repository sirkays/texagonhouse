// // app/api/change-password/route.ts
// import {NextRequest, NextResponse} from "next/server";
// import {djangoFetch} from "@/app/api/_lib/proxy";

// export async function POST(request: NextRequest) {
//   const body = await request.text();

//   const {response, text, setCookie} = await djangoFetch(
//     "/accounts/api/reset-password/",
//     {
//       method: "POST",
//       body,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     },
//   );

//   const proxyResponse = new NextResponse(text, {
//     status: response.status,
//     statusText: response.statusText,
//     headers: response.headers,
//   });

//   if (setCookie) {
//     proxyResponse.headers.set("Set-Cookie", setCookie);
//   }

//   return proxyResponse;
// }

// app/api/change-password/route.ts
import {NextRequest, NextResponse} from "next/server";
import {djangoFetch} from "@/app/api/_lib/proxy";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {response, text, setCookie} = await djangoFetch(
    "/accounts/api/reset-password/",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  const proxyResponse = new NextResponse(text, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  if (setCookie) {
    proxyResponse.headers.set("Set-Cookie", setCookie);
  }

  return proxyResponse;
}
