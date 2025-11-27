import { useSuspenseQuery } from "@tanstack/react-query";
import { renderToReactElement } from "@tiptap/static-renderer";
import { memo, useEffect, useRef, useState } from "react";
import { contentExtensions } from "@/components/content";
import { Button } from "@/components/ui/button";
import { getProductContentQueryOptions } from "@/queries/product";

const MAX_HEIGHT = 500;

export const ProductContent = memo(({ slug }: { slug: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getProductContentQuery = useSuspenseQuery(
    getProductContentQueryOptions(slug),
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setIsOverflowing(el.scrollHeight > MAX_HEIGHT);
    };

    checkOverflow();

    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <div className="min-h-96 bg-neutral-50 py-16">
      <p className="font-bold text-2xl uppercase text-center">
        Mô tả sản phẩm
      </p>

      <div className="relative container mx-auto">
        <div
          ref={contentRef}
          className="transition-all duration-500 overflow-hidden w-full"
          style={{
            maxHeight: expanded
              ? contentRef.current?.scrollHeight
              : MAX_HEIGHT,
          }}
        >
          <div className="typography max-w-none">
            {renderToReactElement({
              content: getProductContentQuery.data,
              extensions: contentExtensions,
            })}
          </div>
        </div>

        {!expanded && isOverflowing && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-50 to-transparent" />
        )}
      </div>

      {isOverflowing && (
        <Button
          type="button"
          variant="outline"
          className="text-sm cursor-pointer rounded-full bg-transparent hover:bg-background mx-auto block mt-4"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </Button>
      )}
    </div>
  );
});
