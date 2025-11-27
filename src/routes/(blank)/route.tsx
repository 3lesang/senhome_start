import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthModal } from "@/components/auth-modal";

export const Route = createFileRoute("/(blank)")({
	component: Component,
});

function Component() {
	return (
		<>
			<Outlet />
			<AuthModal />
		</>
	);
}
