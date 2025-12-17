import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { renderToReactElement } from "@tiptap/static-renderer";
import { contentExtensions } from "@/components/content";
import {
	getPostContentQueryOptions,
	getPostQueryOptions,
} from "@/queries/post";

export function PostPage() {
	const { id } = useParams({ from: "/(app)/posts/$id" });
	const getPostQuery = useSuspenseQuery(getPostQueryOptions(id));
	const getPostContentQuery = useSuspenseQuery(
		getPostContentQueryOptions(getPostQuery.data.slug),
	);

	return (
		<div className="max-w-6xl mx-auto py-8">
			<p className="font-bold text-2xl">{getPostQuery.data.title}</p>
			<p className="text-sm font-light">
				{new Date(getPostQuery.data.created_at).toLocaleString()}
			</p>
			<div className="typography max-w-none">
				{renderToReactElement({
					content: getPostContentQuery.data,
					extensions: contentExtensions,
				})}
			</div>
		</div>
	);
}
