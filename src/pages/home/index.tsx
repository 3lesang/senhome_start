import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRightIcon } from "lucide-react";
import {
	getCollectionsHeroQueryOptions,
	getCollectionsHomeQueryOptions,
} from "@/api/collection/list";
import { buttonVariants } from "@/components/ui/button";
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
import { cn, convertToFileUrl } from "@/lib/utils";
import { CollectionProduct } from "./collection-product";

export function HomePage() {
	const { data: heroCollections } = useSuspenseQuery(
		getCollectionsHeroQueryOptions(),
	);

	const { data: homeCollections } = useSuspenseQuery(
		getCollectionsHomeQueryOptions(),
	);

	return (
		<main>
			<section>
				<ClientOnly>
					<Carousel
						plugins={[
							Autoplay({
								delay: 2000,
							}),
						]}
					>
						<CarouselContent>
							{heroCollections.items.map((item) => (
								<CarouselItem key={item.id}>
									<Link to="/collections/$id" params={{ id: item.slug }}>
										<div className="h-[800px] bg-neutral-50">
											<img
												src={convertToFileUrl(item.expand.file)}
												alt={item.slug}
												className="w-full h-full object-cover"
											/>
										</div>
									</Link>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious className="left-2" />
						<CarouselNext className="right-2" />
					</Carousel>
				</ClientOnly>
			</section>
			{homeCollections.items.map((item) => (
				<section key={item.id} className="mt-16">
					{item.expand.file.id && (
						<div className="h-96 my-8 relative">
							<img
								src={convertToFileUrl(item.expand.file)}
								alt=""
								className="h-full w-full object-cover"
							/>
						</div>
					)}
					<div className="max-w-6xl mx-auto">
						<Card className="border-0 shadow-none">
							<CardHeader className="">
								<CardTitle className="text-xl font-bold">{item.name}</CardTitle>
								<CardAction>
									<Link
										to="/"
										className={cn(buttonVariants({ variant: "link" }))}
									>
										Xem tất cả
										<ArrowRightIcon />
									</Link>
								</CardAction>
							</CardHeader>
							<CardContent className="">
								<CollectionProduct id={item.id} />
							</CardContent>
						</Card>
					</div>
				</section>
			))}
		</main>
	);
}
