// texagon_academy\texagonui\app\api\auth\logout-route
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };

