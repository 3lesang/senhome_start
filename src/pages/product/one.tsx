import { contentExtensions } from "@/components/content";
import { Rating, RatingButton } from "@/components/kibo-ui/rating";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  calculateDiscount,
  checkBrowserId,
  cn,
  convertToFileUrl,
  formatVND,
} from "@/lib/utils";
import {
  getProductBySlugQueryOptions,
  getProductContentQueryOptions,
} from "@/queries/product";
import { cartCollection, orderCollection } from "@/stores/db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { renderToReactElement } from "@tiptap/static-renderer";
import _ from "lodash";
import { MinusIcon, PlusIcon } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProductOptionsProps {
  data: { id: string; name: string; values: { id: string; name: string }[] }[];
  onChange?: (value: Record<string, string>) => void;
  value?: Record<string, string>;
}

function ProductOptions({ value, data, onChange }: ProductOptionsProps) {
  const [options, setOptions] = useState<Record<string, string>>(
    value ? value : {},
  );
  function handleSelect(optionName: string, value: string) {
    const nextOptions = { ...options, [optionName]: value };
    setOptions(nextOptions);
    onChange?.(nextOptions);
  }
  return (
    <div className="space-y-2">
      {data.map((o) => {
        return (
          <div key={o.id} className="space-y-2">
            <p className="text-sm font-medium">{o.name}</p>
            <div className="flex flex-wrap gap-2">
              {o.values.map((v) => (
                <Button
                  key={v.id}
                  variant="outline"
                  size="sm"
                  className={cn(
                    options[o.name] === v.name && "ring-2 ring-primary",
                  )}
                  onClick={() => handleSelect(o.name, v.name)}
                >
                  {v.name}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ProductContent = memo(({ slug }: { slug: string }) => {
  const [collapse, setCollapse] = useState(true);
  const getProductContentQuery = useSuspenseQuery(
    getProductContentQueryOptions(slug),
  );
  return (
    <div>
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
    </div>
  );
});

export function OneProductPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/(app)/products/$id" });
  const getProductQuery = useSuspenseQuery(getProductBySlugQueryOptions(id));
  const product = getProductQuery.data;
  const variants = product.variants;

  const [variant, setVariant] = useState(variants[0]);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const price = variant?.origin_price ?? getProductQuery.data.origin_price;
  const sale_price = variant?.sale_price ?? getProductQuery.data.sale_price;
  const discount = calculateDiscount(price, sale_price);

  function handleOptionsChange(value: Record<string, string>) {
    const index = variants.findIndex((v) => _.isEqual(v.options, value));
    if (index === -1) return;
    setVariant(variants[index]);
  }

  function handleAddToCart() {
    const product = getProductQuery.data;
    const data = {
      id: variant.id.toString() ?? product.id.toString(),
      name: product.name,
      slug: product.slug,
      price: variant.origin_price,
      sale_price: variant.sale_price,
      thumbnail: variant.file,
      quantity,
      combos: Object.values(variant.options).join(", "),
      selected: true,
      product: product.id.toString(),
      variant: variant?.id.toString(),
    };
    const addToCart = createClientOnlyFn(() => {
      const exist = cartCollection.get(data.id);
      if (exist?.id) {
        return cartCollection.update(exist.id, (cart) => {
          cart.quantity += 1;
        });
      }
      cartCollection.insert(data);
    });
    addToCart();
    toast.success("Đã thêm vào giỏ hàng", {
      action: {
        label: "Xem giỏ hàng",
        onClick: () => navigate({ to: "/cart" }),
      },
      position: "bottom-center",
    });
  }

  function handleCheckout() {
    const id = checkBrowserId();
    const product = getProductQuery.data;

    const addOrder = createClientOnlyFn(() => {
      const item = {
        id: variant.id.toString() ?? product.id.toString(),
        name: product.name,
        slug: product.slug,
        price: variant.origin_price,
        sale_price: variant.sale_price,
        thumbnail: variant.file,
        quantity,
        combos: Object.values(variant.options).join(", "),
        selected: true,
        product: product.id.toString(),
        variant: variant?.id.toString(),
      };
      const order = orderCollection.get(id);
      if (order?.id) {
        orderCollection.update(order.id, (order) => {
          order.items = [item];
        });
        return;
      }
      orderCollection.insert({
        id,
        name: "",
        phone: "",
        email: "",
        street: "",
        province: { label: "", value: "" },
        district: { label: "", value: "" },
        ward: { label: "", value: "" },
        status: "created",
        payment: "cod",
        items: [item],
        note: "",
      });
    });
    addOrder();
    navigate({ to: "/checkout" });
  }

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
    <main className="bg-neutral-50">
      <div className="container mx-auto">
        <Breadcrumb className="py-4 font-light">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <p>{getProductQuery.data.name}</p>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-9">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <Card className="border-0 shadow-none sticky top-20">
                  <CardContent>
                    <Carousel setApi={setApi}>
                      <CarouselContent>
                        {getProductQuery.data.files.map((f) => (
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
                        {getProductQuery.data.files.map((f, index) => (
                          <div
                            key={f}
                            className={cn(
                              "size-12 aspect-square bg-neutral-50 border-2 relative",
                              current === index
                                ? "border-primary"
                                : "border-transparent",
                            )}
                          >
                            <button
                              type="button"
                              className="absolute inset-0 hover:cursor-pointer"
                              onClick={() => api?.scrollTo(index)}
                            />
                            {f && (
                              <img
                                src={convertToFileUrl(f)}
                                alt="file"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-8 space-y-4">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>
                      <p className="text-xl font-semibold">
                        {getProductQuery.data.name}
                      </p>
                    </CardTitle>
                    <CardDescription>
                      <Rating defaultValue={5} readOnly>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <RatingButton
                            key={value}
                            size={14}
                            className="text-primary"
                          />
                        ))}
                      </Rating>
                      <div className="space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatVND(sale_price)}
                        </span>
                        <Badge variant="secondary">-{discount}%</Badge>
                        <span className="text-sm line-through text-neutral-500">
                          {formatVND(price)}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProductOptions
                      value={variant.options}
                      data={getProductQuery.data.options}
                      onChange={handleOptionsChange}
                    />
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Mô tả sản phẩm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductContent slug={product.slug} />
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-12 space-y-4">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Khách hàng đánh giá</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-4 gap-8">
                      <div>
                        <p className="font-medium text-sm mb-8">Tổng quan</p>
                        <div className="flex gap-4">
                          <p className="font-bold text-2xl">4.8</p>
                          <Rating defaultValue={5} readOnly>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <RatingButton
                                key={value}
                                className="text-yellow-300"
                              />
                            ))}
                          </Rating>
                        </div>
                        <p className="text-neutral-400 font-light text-sm">
                          {/*({reviews.totalItems} đánh giá)*/}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-4">
                          Tất cả hình ảnh (73)
                        </p>
                        <div>
                          <img
                            src="https://salt.tikicdn.com/cache/w200/ts/review/a3/55/43/44e002c9222d65f099f830a5440385b0.jpg"
                            alt=""
                            className="size-20 rounded"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-8">
                      <p className="text-sm font-medium mb-4">Lọc theo</p>
                      <div className="flex gap-2">
                        <Button
                          className="rounded-full font-light"
                          variant="outline"
                          size="sm"
                        >
                          Mới nhất
                        </Button>
                        <Button
                          className="rounded-full font-light"
                          variant="outline"
                          size="sm"
                        >
                          Có hình ảnh
                        </Button>
                        <Button
                          className="rounded-full font-light"
                          variant="outline"
                          size="sm"
                        >
                          5 sao
                        </Button>
                        <Button
                          className="rounded-full font-light"
                          variant="outline"
                          size="sm"
                        >
                          4 sao
                        </Button>
                        <Button
                          className="rounded-full font-light"
                          variant="outline"
                          size="sm"
                        >
                          3 sao
                        </Button>
                        <Button
                          className="rounded-full font-light"
                          variant="outline"
                          size="sm"
                        >
                          2 sao
                        </Button>
                        <Button
                          className="rounded-full font-light"
                          variant="outline"
                          size="sm"
                        >
                          1 sao
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {/*											{reviews.items.map((item) => (
												<div key={item.id} className="my-2">
													<div className="flex gap-2 items-center">
														<Avatar>
															<AvatarImage
																src={convertToFileUrl(
																	item.expand.user.expand.avatar,
																)}
															></AvatarImage>
															<AvatarFallback>
																{item.expand.user.name[0]}
															</AvatarFallback>
														</Avatar>
														<p className="font-medium">
															{item.expand.user.name}
														</p>
													</div>
													<Rating defaultValue={item.rating} readOnly>
														{[1, 2, 3, 4, 5].map((value) => (
															<RatingButton
																key={value}
																size={16}
																className="text-yellow-300"
															/>
														))}
													</Rating>
													<p className="text-sm">{item.content}</p>
												</div>
											))}*/}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Sản phẩm tương tự</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-6 gap-4">
                    {/*										{productsCategory?.items.map((item) => (
											<Card key={item.id} className="border-0 shadow-none p-0">
												<div className="aspect-square bg-neutral-50 rounded-md relative group">
													<Link to="/products/$id" params={{ id: item.slug }}>
														<img
															src={convertToFileUrl(item.expand.file[0])}
															alt=""
															className="rounded object-contain group-hover:opacity-0 transition-opacity duration-150 w-full h-full"
														/>
														<img
															src={convertToFileUrl(item.expand.file[1])}
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
														<Link to="/products/$id" params={{ id: item.slug }}>
															{item.name}
														</Link>
													</p>
													<div className="flex items-center space-x-2">
														<Badge variant="secondary">
															-{calculateDiscount(item.price, item.sale_price)}%
														</Badge>
														<p className="line-through text-xs text-neutral-700">
															{formatVND(item.price)}
														</p>
													</div>
													<p className="text-lg font-bold">
														{formatVND(item.sale_price)}
													</p>
												</CardContent>
											</Card>
										))}*/}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <Card className="border-0 shadow-none sticky top-20">
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-center">
                  <img
                    src={convertToFileUrl(variant?.file)}
                    alt=""
                    className="size-10"
                  />
                  {Object.values(variant?.options).map((o) => (
                    <span key={o}>{o}</span>
                  ))}
                </div>
                <div className="space-y-4">
                  <p className="font-semibold">Số lượng</p>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                    >
                      <MinusIcon />
                    </Button>
                    <div className="w-16 text-center">{quantity}</div>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="font-semibold">Tạm tính</p>
                  <p className="font-bold text-xl">
                    {formatVND(Number(variant?.sale_price) * quantity)}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-2">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    Mua ngay
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={handleAddToCart}
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
