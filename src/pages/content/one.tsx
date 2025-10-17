import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { renderToReactElement } from "@tiptap/static-renderer";
import { getPageQueryOptions } from "@/api/page/one";
import { contentExtensions } from "@/components/content";

export function ContentPage() {
	const { id } = useParams({ from: "/(app)/contents/$id" });
	const { data } = useSuspenseQuery(getPageQueryOptions(id));
	return (
		<main className="py-8">
			<div className="max-w-4xl mx-auto">
				<p className="font-bold text-xl mb-8 uppercase">{data?.title}</p>
				{data?.content && (
					<div className="typography">
						{renderToReactElement({
							content: data?.content,
							extensions: contentExtensions,
						})}
					</div>
				)}
			</div>
		</main>
	);
}
