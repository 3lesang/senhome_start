import { ListOrderPage } from "@/pages/order/list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/order/")({
  component: ListOrderPage,
});
