import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateDiscount, convertToFileUrl, formatVND } from "@/lib/utils";
import { getCollectionQueryOptions } from "@/queries/collection";
import { getProductsByCollectionIDQueryOptions } from "@/queries/product";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { PercentIcon, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";

export function CollectionPage() {
  const [sort, setSort] = useState("-product.created");
  const { id } = useParams({ from: "/(app)/collections/$id" });
  const getCollectionQuery = useSuspenseQuery(getCollectionQueryOptions(id));
  const getProductsQuery = useSuspenseQuery(
    getProductsByCollectionIDQueryOptions(getCollectionQuery.data.id),
  );

  function handleSortChange(value: string) {
    setSort(value);
  }

  return (
    <main className="">
      <div className="container mx-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0">
            <CardTitle className="text-2xl font-bold">
              {getCollectionQuery.data.name}
            </CardTitle>
            <CardAction>
              <Label>
                Sắp xếp theo
                <Select defaultValue={sort} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-product.created">Mới nhất</SelectItem>
                    <SelectItem value="product.price">
                      Giá thấp đến cao
                    </SelectItem>
                    <SelectItem value="-product.price">
                      Giá cao đến thấp
                    </SelectItem>
                    <SelectItem value="-product.discount">
                      %Giảm giá nhiều
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Label>
            </CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-4 px-0">
            {getProductsQuery.data?.map((item) => (
              <Card key={item.id} className="border-0 shadow-none p-0">
                <div className="aspect-square bg-neutral-50 rounded-md relative group">
                  <Link to="/products/$id" params={{ id: item.slug }}>
                    <img
                      src={convertToFileUrl(item.files[0])}
                      alt=""
                      className="rounded-lg object-contain group-hover:opacity-0 transition-opacity duration-150 w-full h-full"
                    />
                    <img
                      src={convertToFileUrl(item.files[1])}
                      alt=""
                      className="rounded-lg object-contain opacity-0 group-hover:opacity-100 absolute inset-0 z-20 transition-opacity duration-150 w-full h-full"
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
                      {calculateDiscount(item.origin_price, item.sale_price)}
                      <PercentIcon />
                    </Badge>
                    <p className="line-through text-xs text-neutral-700">
                      {formatVND(item.origin_price)}
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {formatVND(item.sale_price)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
