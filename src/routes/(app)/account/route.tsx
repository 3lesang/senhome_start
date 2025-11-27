import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountLayout } from "@/components/layouts/account";

export const Route = createFileRoute("/(app)/account")({
	component: AccountLayout,
	ssr: false,
	beforeLoad() {
		const token = localStorage.getItem("token");
		if (!token) {
			throw redirect({
				to: "/",
			});
		}
	},
});
