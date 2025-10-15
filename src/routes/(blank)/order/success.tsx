import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { OrderSuccessPage } from "@/pages/order/success";

const schema = z.object({
	id: z.string(),
});

export const Route = createFileRoute("/(blank)/order/success")({
	component: OrderSuccessPage,
	validateSearch: schema,
});
