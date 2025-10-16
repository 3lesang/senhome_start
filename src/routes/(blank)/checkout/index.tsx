import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/pages/checkout";

export const Route = createFileRoute("/(blank)/checkout/")({
	ssr: false,
	component: CheckoutPage,
});
