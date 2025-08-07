import {
	createFileRoute,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
	component: App,
	beforeLoad: ({ context }) => {
		if (!context.user) {
			return redirect({ to: "/login" });
		}
	},
});

function App() {
	const { user } = useRouteContext({ from: Route.id });

	return <div>Hello, {user?.name}!</div>;
}
