import { ContentPage } from "@/pages/content/one";
import { getPageQueryOptions } from "@/queries/page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/contents/$id")({
  component: ContentPage,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(getPageQueryOptions(params.id));
  },
});
