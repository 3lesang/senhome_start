import { createFileRoute } from "@tanstack/react-router";
import { PostPage } from "@/pages/post/one";
import {
	getPostContentQueryOptions,
	getPostQueryOptions,
} from "@/queries/post";

export const Route = createFileRoute("/(app)/posts/$id")({
	component: PostPage,
	loader: async ({ context, params }) => {
		const res = await context.queryClient.ensureQueryData(
			getPostQueryOptions(params.id),
		);
		await context.queryClient.ensureQueryData(
			getPostContentQueryOptions(res.slug),
		);
		return res;
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
