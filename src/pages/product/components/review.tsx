import { Rating, RatingButton } from "@/components/kibo-ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, convertToFileUrl } from "@/lib/utils";
import {
  getOverviewByProductQueryOptions,
  getReviewsByProductQueryOptions,
} from "@/queries/review";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { memo, useState } from "react";

const ReviewOverview = ({ id }: { id: number }) => {
  const getOverviewQuery = useSuspenseQuery(
    getOverviewByProductQueryOptions(id),
  );
  return (
    <div className="flex flex-col lg:flex-row mb-4 gap-8">
      <div>
        <p className="font-medium text-sm mb-8">Tổng quan</p>
        <div className="flex gap-4">
          <p className="font-bold text-2xl">
            {getOverviewQuery.data.average_rating}
          </p>
          <Rating defaultValue={getOverviewQuery.data.average_rating} readOnly>
            {[1, 2, 3, 4, 5].map((value) => (
              <RatingButton key={value} className="text-yellow-300" />
            ))}
          </Rating>
        </div>
        <p className="text-neutral-400 font-light text-sm">
          ({getOverviewQuery.data.total_reviews} đánh giá)
        </p>
      </div>
      <div>
        <p className="font-medium text-sm mb-4">
          Tất cả hình ảnh ({getOverviewQuery.data.total_files})
        </p>
        <div className="flex gap-2">
          {getOverviewQuery.data.files?.map((f) => (
            <img
              src={convertToFileUrl(f)}
              alt=""
              className="size-20 rounded object-cover"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ListReview = ({ id }: { id: number }) => {
  const [params, setParams] = useState({
    sort_flag: 0,
    has_image: false,
    rating: 0,
  });

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => Boolean(value)),
  );

  const getReviewsQuery = useQuery(
    getReviewsByProductQueryOptions(id, filteredParams),
  );

  return (
    <div>
      <p className="text-sm font-medium mb-4">Lọc theo</p>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className={cn(params.sort_flag && "bg-neutral-100")}
          onClick={() =>
            setParams((prev) => ({
              ...prev,
              sort_flag: prev.sort_flag == 0 ? 1 : 0,
            }))
          }
        >
          Mới nhất
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(params.has_image && "bg-neutral-100")}
          onClick={() =>
            setParams((prev) => ({ ...prev, has_image: !prev.has_image }))
          }
        >
          Có hình ảnh
        </Button>
        {[5, 4, 3, 2, 1].map((i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className={cn(i == params.rating && "bg-neutral-100")}
            onClick={() => setParams((prev) => ({ ...prev, rating: i }))}
          >
            {i} sao
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className={cn(params.rating == 0 && "bg-neutral-100")}
          onClick={() => setParams((prev) => ({ ...prev, rating: 0 }))}
        >
          Tất cả
        </Button>
      </div>
      <div className="space-y-2">
        {getReviewsQuery.data?.data?.map((item) => (
          <div key={item.id} className="my-2">
            <div className="flex gap-2 items-center">
              <Avatar>
                <AvatarImage
                  src={convertToFileUrl(item?.customer?.avatar)}
                ></AvatarImage>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <p className="font-medium">{item?.customer?.name}</p>
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
            <div className="flex gap-2">
              {item.files.map(
                (f) =>
                  f && (
                    <img
                      key={f}
                      className="size-20 object-cover rounded"
                      src={convertToFileUrl(f)}
                    />
                  ),
              )}
            </div>
            <p className="text-sm">{item.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProductReview = memo(({ id }: { id: number }) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Khách hàng đánh giá</CardTitle>
      </CardHeader>
      <CardContent>
        <ReviewOverview id={id} />
        <ListReview id={id} />
      </CardContent>
    </Card>
  );
});
