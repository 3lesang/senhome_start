import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { renderToReactElement } from "@tiptap/static-renderer";
import { contentExtensions } from "@/components/content";
import {
  getPageContentQueryOptions,
  getPageQueryOptions,
} from "@/queries/page";

export function ContentPage() {
  const { id } = useParams({ from: "/(app)/contents/$id" });
  const getPageQuery = useSuspenseQuery(getPageQueryOptions(id));
  const getPageContentQuery = useSuspenseQuery(
    getPageContentQueryOptions(getPageQuery.data.id),
  );

  return (
    <main className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="typography max-w-none">
          {renderToReactElement({
            content: getPageContentQuery.data,
            extensions: contentExtensions,
          })}
        </div>
      </div>
    </main>
  );
}
