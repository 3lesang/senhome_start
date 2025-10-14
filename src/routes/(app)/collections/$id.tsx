import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/collections/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(app)/collections/$id"!</div>;
}
