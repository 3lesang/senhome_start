import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { OrderSuccessPage } from "@/pages/checkout/success";

const schema = z.object({
  id: z.number(),
});

export const Route = createFileRoute("/(blank)/checkout/success")({
  component: OrderSuccessPage,
  validateSearch: schema,
});
