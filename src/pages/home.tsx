import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRightIcon } from "lucide-react";
import {
	getCollectionsHeroQueryOptions,
	getCollectionsHomeQueryOptions,
} from "@/api/collection/list";
import { Badge } from "@/components/ui/badge";
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
import { cn, convertToFileUrl, formatVND } from "@/lib/utils";

export function HomePage() {
	const { data: heroCollections } = useSuspenseQuery(
		getCollectionsHeroQueryOptions(),
	);

	const { data: collections } = useSuspenseQuery(
		getCollectionsHomeQueryOptions(),
	);

	return (
		<main>
			<section>
				<Carousel
					plugins={[
						Autoplay({
							delay: 2000,
						}),
					]}
				>
					<CarouselContent>
						{heroCollections.map((item) => (
							<CarouselItem key={item.id}>
								<div className="h-[800px] bg-neutral-50">
									<Link to="/collections/$id" params={{ id: item.slug }}>
										<img
											src={convertToFileUrl(item.expand.file)}
											alt={item.slug}
											className="w-full h-full object-cover"
										/>
									</Link>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="left-2" />
					<CarouselNext className="right-2" />
				</Carousel>
			</section>
			<section>
				{collections.map((item) => (
					<div key={item.id}>
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
								<CardHeader>
									<CardTitle>{item.name}</CardTitle>
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
								<CardContent className="grid grid-cols-4 gap-8">
									{item?.products.map((item) => (
										<Card key={item.id} className="border-0 shadow-none p-0">
											<Link to="/products/$id" params={{ id: item.slug }}>
												<div className="aspect-square bg-neutral-50 rounded-md">
													<img
														src={convertToFileUrl(item.expand.thumbnail)}
														alt=""
														className="rounded-md object-contain"
													/>
												</div>
											</Link>
											<CardContent className="p-0">
												<Link to="/products/$id" params={{ id: item.slug }}>
													<p className="line-clamp-2">{item.name}</p>
												</Link>
												<p>
													<span className="font-bold">
														{formatVND(item.sale_price)}
													</span>
													<span className="line-through">
														{formatVND(item.price)}
													</span>
												</p>
												<div className="">
													{item.options.map((item) => {
														return (
															<div key={item.id} className="space-x-0.5">
																{item.values.map((v) => (
																	<Badge
																		key={v.id}
																		variant="secondary"
																		className="rounded-full"
																	>
																		{v.name}
																	</Badge>
																))}
															</div>
														);
													})}
												</div>
											</CardContent>
										</Card>
									))}
								</CardContent>
							</Card>
						</div>
					</div>
				))}
			</section>
		</main>
	);
}
