import { createFileRoute } from "@tanstack/react-router";
import { SecondLayout } from "@/components/layouts/second";

export const Route = createFileRoute("/(second)")({
	component: SecondLayout,
});
