import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/pages/collection/one";
import { getCollectionQueryOptions } from "@/queries/collection";

export const Route = createFileRoute("/(app)/collection/$id")({
  component: CollectionPage,
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      getCollectionQueryOptions(params.id),
    );
  },
  head: ({ loaderData }) => ({
    meta: [
      { name: "description", content: loaderData?.meta_description },
      { title: loaderData?.meta_title },
    ],
  }),
});
