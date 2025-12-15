import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { cn, convertToFileUrl } from "@/lib/utils";
import {
	getHeroCollectionsQueryOptions,
	getHomeCollectionsQueryOptions,
} from "@/queries/collection";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";

function HomeHero() {
	const getHeroCollectionsQuery = useSuspenseQuery(
		getHeroCollectionsQueryOptions,
	);
	if (!getHeroCollectionsQuery.data?.length) return null;
	return (
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
							<Link to="/collection/$id" params={{ id: item.slug }}>
								<div className="bg-neutral-50 aspect-auto lg:h-[800px] h-56">
									<img
										src={convertToFileUrl(item?.file)}
										alt={item.slug}
										className="w-full h-full object-contain"
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
	);
}

function HomeContent() {
	const getHomeCollectionsQuery = useSuspenseQuery(
		getHomeCollectionsQueryOptions,
	);
	return getHomeCollectionsQuery.data?.map((item) => (
		<section key={item.id} className="mt-16 space-y-8">
			{item.file && (
				<img
					src={convertToFileUrl(item.file)}
					alt=""
					className="h-full w-full object-contain"
				/>
			)}
			<div className="lg:container lg:mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<p className="text-2xl font-bold">{item.name}</p>
					<Link
						to="/collection/$id"
						params={{ id: item.slug }}
						className={cn(buttonVariants({ variant: "link" }), "underline")}
					>
						Xem thêm
					</Link>
				</div>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 px-0">
					{item.products?.map((p) => (
						<ProductCard
							key={p.id}
							data={{
								id: p.id,
								name: p.name,
								slug: p.slug,
								files: p.files,
								originPrice: p.origin_price,
								salePrice: p.sale_price,
								options: p.options,
								variants: p.variants,
							}}
						/>
					))}
				</div>
			</div>
		</section>
	));
}

export function HomePage() {
	return (
		<main className="pb-16">
			<HomeHero />
			<HomeContent />
		</main>
	);
}
