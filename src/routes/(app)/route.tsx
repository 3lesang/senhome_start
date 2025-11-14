import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/components/layouts/main";
import { getStoreQueryOptions } from "@/queries/store";

export const Route = createFileRoute("/(app)")({
  component: MainLayout,
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(getStoreQueryOptions());
  },
});
