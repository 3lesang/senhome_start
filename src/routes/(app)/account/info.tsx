import { createFileRoute } from "@tanstack/react-router";
import { AccountInfoPage } from "@/pages/account/info";

export const Route = createFileRoute("/(app)/account/info")({
	component: AccountInfoPage,
});
