import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn, convertToFileUrl } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProductCarouselProps {
  data: string[];
}

export const ProductCarousel = ({ data }: ProductCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Card className="border-0 shadow-none sticky top-20">
      <CardContent>
        <Carousel setApi={setApi}>
          <CarouselContent>
            {data.map((f) => (
              <CarouselItem key={f}>
                <div className="w-full h-full bg-neutral-50 overflow-hidden aspect-square">
                  {f && (
                    <img
                      src={convertToFileUrl(f)}
                      alt="file"
                      className="object-contain w-full h-full"
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        <div className="overflow-scroll">
          <div className="flex gap-2">
            {data.map((f, index) => (
              <div
                key={f}
                className={cn(
                  "size-12 aspect-square bg-neutral-50 border-2 relative",
                  current === index ? "border-primary" : "border-transparent",
                )}
              >
                <button
                  type="button"
                  className="absolute inset-0 hover:cursor-pointer"
                  onClick={() => api?.scrollTo(index)}
                />
                <img
                  src={convertToFileUrl(f)}
                  alt="file"
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
