import { createFileRoute } from "@tanstack/react-router";
import { getOneMenuQueryOptions } from "@/api/menu/one";
import { MainLayout } from "@/components/layouts/main";
import { getStoreQueryOptions } from "@/queries/store";

export const Route = createFileRoute("/(app)")({
  component: MainLayout,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getOneMenuQueryOptions());
    return context.queryClient.ensureQueryData(getStoreQueryOptions());
  },
});
