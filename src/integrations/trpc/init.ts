import { auth } from "@/lib/auth";
import { getWebRequest } from "@tanstack/react-start/server";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.create({
	transformer: superjson,
});

const authMiddleware = t.middleware(async ({ next }) => {
	const request = getWebRequest();
	const session = request
		? await auth.api.getSession({ headers: request.headers })
		: null;

	if (!session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return next({ ctx: { user: session.user } });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
