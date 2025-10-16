import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/pages/cart";

export const Route = createFileRoute("/(second)/cart")({
	ssr: false,
	component: CartPage,
});
