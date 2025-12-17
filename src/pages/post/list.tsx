import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { convertToFileUrl } from "@/lib/utils";
import { getPostsQueryOptions } from "@/queries/post";

export function PostListPage() {
	const getPostsQuery = useSuspenseQuery(
		getPostsQueryOptions({ page: 1, limit: 10 }),
	);

	return (
		<div className="py-8">
			<div className="grid grid-cols-12 gap-4 container mx-auto">
				{getPostsQuery.data.data.map((p) => (
					<div key={p.id} className="col-span-3">
						<Link to="/posts/$id" params={{ id: p.slug }}>
							<div className="aspect-video">
								<img
									src={convertToFileUrl(p.file)}
									alt=""
									className="object-cover h-full w-full"
								/>
							</div>
						</Link>
						<div className="py-2">
							<p className="text-sm font-light">
								{new Date(p.created_at).toLocaleString()}
							</p>
							<Link to="/posts/$id" params={{ id: p.slug }}>
								<p className="font-bold text-lg hover:underline">{p.title}</p>
							</Link>
							<p className="font-light text-sm">{p.meta_description}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
