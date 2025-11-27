import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/components/layouts/main";
import { getMenuItemQueryOptions, getMenuQueryOptions } from "@/queries/menu";
import { getStoreQueryOptions } from "@/queries/store";

export const Route = createFileRoute("/(app)")({
  component: MainLayout,
  loader: async ({ context }) => {
    const getHeaderMenuQuery = await context.queryClient.ensureQueryData(
      getMenuQueryOptions("header"),
    );
    await context.queryClient.ensureQueryData(
      getMenuItemQueryOptions(getHeaderMenuQuery?.id ?? 0),
    );
    const getFooterMenuQuery = await context.queryClient.ensureQueryData(
      getMenuQueryOptions("footer"),
    );
    await context.queryClient.ensureQueryData(
      getMenuItemQueryOptions(getFooterMenuQuery?.id ?? 0),
    );
    return context.queryClient.ensureQueryData(getStoreQueryOptions());
  },
});
