import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/components/layouts/main";

export const Route = createFileRoute("/(app)")({
	component: MainLayout,
});
