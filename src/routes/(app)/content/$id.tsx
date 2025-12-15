import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/pages/content/one";
import { getPageQueryOptions } from "@/queries/page";

export const Route = createFileRoute("/(app)/content/$id")({
  component: ContentPage,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(getPageQueryOptions(params.id));
  },
});
