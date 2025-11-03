import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRightIcon, ShoppingCartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  calculateDiscount,
  cn,
  convertToFileUrl,
  formatVND,
} from "@/lib/utils";
import {
  getHeroCollectionsQueryOptions,
  getHomeCollectionsQueryOptions,
} from "@/queries/collection";

export function HomePage() {
  const getHeroCollectionsQuery = useSuspenseQuery(
    getHeroCollectionsQueryOptions,
  );

  const getHomeCollectionsQuery = useSuspenseQuery(
    getHomeCollectionsQueryOptions,
  );

  return (
    <main>
      <section>
        <Carousel
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
        >
          <CarouselContent>
            {getHeroCollectionsQuery.data?.map((item) => (
              <CarouselItem key={item?.id}>
                <Link to="/collections/$id" params={{ id: item.slug }}>
                  <div className="bg-neutral-50 aspect-auto lg:h-[800px] h-56">
                    <img
                      src={convertToFileUrl(item?.file)}
                      alt={item.slug}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="lg:left-56 left-2" />
          <CarouselNext className="lg:right-56 right-2" />
        </Carousel>
      </section>
      {getHomeCollectionsQuery.data?.map((item) => (
        <section key={item.id} className="mt-16">
          {item.file && (
            <div className="h-32 lg:h-96 my-8 relative">
              <img
                src={convertToFileUrl(item.file)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="container mx-auto">
            <Card className="border-0 shadow-none px-4 lg:px-0">
              <CardHeader className="px-0">
                <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
                <CardAction>
                  <Link
                    to="/collections/$id"
                    params={{ id: item.slug }}
                    className={cn(buttonVariants({ variant: "link" }))}
                  >
                    Xem tất cả
                    <ArrowRightIcon />
                  </Link>
                </CardAction>
              </CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-5 px-0">
                {item.products?.map((p) => (
                  <Card key={p.id} className="border-0 shadow-none p-0">
                    <div className="aspect-square bg-neutral-50 rounded-md relative group">
                      <Link to="/products/$id" params={{ id: p.slug }}>
                        <img
                          src={convertToFileUrl(p.files?.[0])}
                          alt=""
                          className="rounded object-contain group-hover:opacity-0 transition-opacity duration-150 w-full h-full"
                        />
                        <img
                          src={convertToFileUrl(p.files?.[1])}
                          alt=""
                          className="rounded object-contain opacity-0 group-hover:opacity-100 absolute inset-0 z-20 transition-opacity duration-150 h-full w-full"
                        />
                      </Link>
                      <Button
                        type="submit"
                        size="icon-sm"
                        variant="secondary"
                        className="absolute right-2 bottom-2 z-30"
                      >
                        <ShoppingCartIcon />
                      </Button>
                    </div>
                    <CardContent className="px-0 space-y-1">
                      <p className="line-clamp-2 text-sm font-light hover:underline">
                        <Link to="/products/$id" params={{ id: p.slug }}>
                          {p.name}
                        </Link>
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          -{calculateDiscount(p.origin_price, p.sale_price)}%
                        </Badge>
                        <p className="line-through text-xs text-neutral-700">
                          {formatVND(p.origin_price)}
                        </p>
                      </div>
                      <p className="text-lg font-bold">
                        {formatVND(p.sale_price)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      ))}
    </main>
  );
}
