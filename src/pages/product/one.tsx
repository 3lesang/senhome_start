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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  calculateDiscount,
  checkBrowserId,
  convertToFileUrl,
  formatVND,
} from "@/lib/utils";
import { getProductBySlugQueryOptions } from "@/queries/product";
import { getOverviewByProductQueryOptions } from "@/queries/review";
import { cartCollection, orderCollection } from "@/stores/db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import _ from "lodash";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductCarousel } from "./components/carousel";
import { ProductContent } from "./components/content";
import { ProductOptions } from "./components/option";
import { ProductReview } from "./components/review";

export function OneProductPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/(app)/products/$id" });
  const getProductQuery = useSuspenseQuery(getProductBySlugQueryOptions(id));
  const product = getProductQuery.data;
  const variants = product.variants;
  const getOverviewQuery = useSuspenseQuery(
    getOverviewByProductQueryOptions(product.id),
  );

  const [variant, setVariant] = useState(variants[0]);
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

  return (
    <main className="bg-neutral-50">
      <div className="container mx-auto">
        <Breadcrumb className="py-4 font-light">
          <BreadcrumbList className="text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{getProductQuery.data.name}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <ProductCarousel data={getProductQuery.data.files} />
              </div>
              <div className="lg:col-span-8 space-y-4">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>
                      <p className="text-xl font-semibold">
                        {getProductQuery.data.name}
                      </p>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Rating
                        defaultValue={getOverviewQuery.data.average_rating}
                        readOnly
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <RatingButton
                            key={value}
                            size={14}
                            className="text-yellow-300"
                          />
                        ))}
                      </Rating>
                      <p className="text-sm text-gray-500">
                        {getOverviewQuery.data?.total_reviews} đánh giá
                      </p>
                    </div>
                    <div className="space-x-2">
                      <span className="text-2xl font-bold">
                        {formatVND(sale_price)}
                      </span>
                      <Badge variant="secondary">-{discount}%</Badge>
                      <span className="text-sm line-through text-neutral-500">
                        {formatVND(price)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProductOptions
                      value={variant.options}
                      data={getProductQuery.data.options}
                      onChange={handleOptionsChange}
                    />
                  </CardContent>
                </Card>
                <ProductContent slug={product.slug} />
              </div>
              <div className="lg:col-span-12 space-y-4">
                <ProductReview id={product.id} />
              </div>
            </div>
          </div>
          <div className="fixed bottom-0 right-0 left-0 lg:static lg:col-span-3">
            <Card className="border-0 shadow-none sticky top-20">
              <CardContent className="hidden lg:block space-y-4">
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
                <div className="flex lg:flex-col w-full gap-2">
                  <div className="flex-1">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full"
                      onClick={handleCheckout}
                    >
                      Mua ngay
                    </Button>
                  </div>
                  <div className="flex-1">
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
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
