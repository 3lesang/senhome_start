import { queryOptions } from "@tanstack/react-query";
import { COLLECTION_COLLECTION, pocketClient } from "@/pocketbase";

type CollectionDataType = {
	id: string;
	name: string;
	slug: string;
	expand: {
		file: { id: string; collectionName: string; file: string };
	};
};

export function getCollectionsHeroQueryOptions() {
	return queryOptions({
		queryKey: [COLLECTION_COLLECTION, "hero"],
		queryFn: () => {
			return pocketClient
				.collection<CollectionDataType>(COLLECTION_COLLECTION)
				.getList(1, 10, {
					fields: "id,name,slug,expand",
					expand: "file",
					filter: `layout="hero"`,
				});
		},
	});
}

export function getCollectionsHomeQueryOptions() {
	return queryOptions({
		queryKey: [COLLECTION_COLLECTION, "home"],
		queryFn: () => {
			return pocketClient
				.collection<CollectionDataType>(COLLECTION_COLLECTION)
				.getList(1, 10, {
					fields: "id,name,slug,expand",
					expand: "file",
					filter: `layout="home"`,
				});
		},
	});
}
