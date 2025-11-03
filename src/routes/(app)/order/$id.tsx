import { OneOrderPage } from "@/pages/order/one";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/order/$id")({
  component: OneOrderPage,
});
