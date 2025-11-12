import { contentExtensions } from "@/components/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getProductContentQueryOptions } from "@/queries/product";
import { useSuspenseQuery } from "@tanstack/react-query";
import { renderToReactElement } from "@tiptap/static-renderer";
import { memo, useState } from "react";

export const ProductContent = memo(({ slug }: { slug: string }) => {
  const [collapse, setCollapse] = useState(true);
  const getProductContentQuery = useSuspenseQuery(
    getProductContentQueryOptions(slug),
  );
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Mô tả sản phẩm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(collapse && "max-h-96 overflow-hidden")}>
          <div className="typography max-w-none">
            {renderToReactElement({
              content: getProductContentQuery.data,
              extensions: contentExtensions,
            })}
          </div>
        </div>
        <div className="flex items-center justify-center pt-8 relative bg-white">
          <button
            type="button"
            className="text-sm cursor-pointer"
            onClick={() => setCollapse((prev) => !prev)}
          >
            {collapse ? "Xem thêm" : "Thu gọn"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
});
