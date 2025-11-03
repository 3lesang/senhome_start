import { createFileRoute } from "@tanstack/react-router";
import { OneProductPage } from "@/pages/product/one";
import {
  getProductBySlugQueryOptions,
  getProductContentQueryOptions,
} from "@/queries/product";

export const Route = createFileRoute("/(app)/products/$id")({
  component: OneProductPage,
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(
      getProductBySlugQueryOptions(params.id),
    );
    await context.queryClient?.ensureQueryData(
      getProductContentQueryOptions(product?.slug ?? ""),
    );
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { name: "description", content: loaderData?.meta_description },
      {
        title: loaderData?.meta_title,
      },
    ],
  }),
});
