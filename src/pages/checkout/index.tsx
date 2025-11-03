import axiosClient from "@/axios";
import { DistrictSelect } from "@/components/address/district";
import { ProvinceSelect } from "@/components/address/province";
import { WardSelect } from "@/components/address/ward";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { checkBrowserId, cn, formatVND } from "@/lib/utils";
import { orderCollection } from "@/stores/db";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

type CreateOrderAddressRequest = {
  address_line: string;
  full_name: string;
  phone: string;
};

type CreateOrderItemsRequest = {
  product_id: number;
  quantity: number;
  sale_price: number;
  variant_id: number;
};

type CreateOrderRequest = {
  address: CreateOrderAddressRequest;
  total_amount: number;
  discount_amount: number;
  items: CreateOrderItemsRequest[];
};

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
  email: z.email("Email không hợp lệ"),
  street: z.string(),
  province: z.object({
    value: z.string(),
    label: z.string().min(1, "Name is required"),
  }),
  district: z.object({
    value: z.string(),
    label: z.string().min(1, "Name is requied"),
  }),
  ward: z.object({
    value: z.string(),
    label: z.string().min(1, "Name is requied"),
  }),
  payment: z.string(),
  status: z.enum(["created"]),
  note: z.string(),
  items: z.array(
    z.object({
      origin_price: z.number(),
      sale_price: z.number(),
      product_id: z.number(),
      variant_id: z.number(),
      quantity: z.number(),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: order } = useLiveQuery((q) =>
    q
      .from({ order: orderCollection })
      .where(({ order }) => eq(order.id, checkBrowserId()))
      .findOne(),
  );

  const orderSumary = order?.items.reduce(
    (acc, cur) => {
      return {
        totalPrice: acc.totalPrice + cur.price * cur.quantity,
        totalSalePrice: acc.totalSalePrice + cur.sale_price * cur.quantity,
        totalQuantiy: acc.totalQuantiy + cur.quantity,
      };
    },
    { totalPrice: 0, totalSalePrice: 0, totalQuantiy: 0 },
  );

  const orderMutation = useMutation({
    mutationFn: (value: FormValues) => {
      const request: CreateOrderRequest = {
        total_amount: Number(orderSumary?.totalSalePrice),
        discount_amount: 0,
        address: {
          address_line: `${value.street}, ${value.ward.label}, ${value.district.label}, ${value.province.label}`,
          full_name: value.name,
          phone: value.phone,
        },
        items: value.items,
      };
      return axiosClient.post<{ id: number }>("/orders", request);
    },
    onSuccess: ({ data }) => {
      navigate({ to: "/checkout/success", search: { id: data.id } });
      toast.success("Order created");
    },
  });

  const defaultValues: FormValues = {
    name: order?.name ?? "",
    phone: order?.phone ?? "",
    email: order?.email ?? "",
    street: order?.street ?? "",
    province: order?.province ?? { label: "", value: "" },
    district: order?.district ?? { label: "", value: "" },
    ward: order?.ward ?? { label: "", value: "" },
    payment: "cod",
    status: "created",
    note: "",
    items:
      order?.items.map((i) => ({
        origin_price: Number(i.price) ?? 0,
        sale_price: i.sale_price ?? 0,
        quantity: i.quantity ?? 0,
        product_id: Number(i.product) ?? 0,
        variant_id: Number(i.variant) ?? 0,
      })) ?? [],
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value }) => orderMutation.mutateAsync(value),
    onSubmitInvalid: ({ formApi }) => {
      console.log(formApi.getAllErrors());
    },
  });

  const provinceID = useStore(
    form.store,
    (state) => state.values.province.value,
  );
  const districtID = useStore(
    form.store,
    (state) => state.values.district.value,
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <main className="lg:bg-neutral-50 min-h-screen py-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-12 px-4 lg:px-0">
              <Item variant="muted">
                <ItemMedia>
                  <Button type="button" variant="ghost" size="icon-sm">
                    <InfoIcon />
                  </Button>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Chưa có tài khoản?</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Link to="/signup" className={cn(buttonVariants())}>
                    Đăng ký
                  </Link>
                </ItemActions>
              </Item>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>Thông tin giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-12 gap-4">
                  <form.Field name="name">
                    {(field) => (
                      <Field
                        data-invalid={!field.state.meta.isValid}
                        className="col-span-6"
                      >
                        <FieldLabel>Họ và tên</FieldLabel>
                        <Input
                          aria-invalid={!field.state.meta.isValid}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.currentTarget.value)
                          }
                        />
                        {!field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="phone">
                    {(field) => (
                      <Field
                        data-invalid={!field.state.meta.isValid}
                        className="col-span-6"
                      >
                        <FieldLabel>Số điện thoại</FieldLabel>
                        <Input
                          aria-invalid={!field.state.meta.isValid}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.currentTarget.value)
                          }
                        />
                        {!field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="email">
                    {(field) => (
                      <Field
                        data-invalid={!field.state.meta.isValid}
                        className="col-span-12"
                      >
                        <FieldLabel>Email</FieldLabel>
                        <Input
                          aria-invalid={!field.state.meta.isValid}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.currentTarget.value)
                          }
                        />
                        {!field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="street">
                    {(field) => (
                      <Field
                        aria-invalid={!field.state.meta.isValid}
                        className="col-span-12"
                      >
                        <FieldLabel>Địa chỉ, tên đường</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.currentTarget.value)
                          }
                        />
                        {!field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="province">
                    {(field) => (
                      <Field
                        aria-invalid={!field.state.meta.isValid}
                        className="col-span-12 lg:col-span-4"
                      >
                        <FieldLabel>Tỉnh/TP</FieldLabel>
                        <ProvinceSelect
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                        {!field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="district">
                    {(field) => (
                      <Field
                        aria-invalid={!field.state.meta.isValid}
                        className="col-span-12 lg:col-span-4"
                      >
                        <FieldLabel>Quận/Huyện</FieldLabel>
                        <DistrictSelect
                          value={field.state.value}
                          onChange={field.handleChange}
                          id={provinceID}
                        />
                        {!field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="ward">
                    {(field) => (
                      <Field
                        aria-invalid={!field.state.meta.isValid}
                        className="col-span-12 lg:col-span-4"
                      >
                        <FieldLabel>Phường/Xã</FieldLabel>
                        <WardSelect
                          value={field.state.value}
                          onChange={field.handleChange}
                          id={districtID}
                        />
                        {!field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="note">
                    {(field) => (
                      <Field className="col-span-12">
                        <FieldLabel>Ghi chú đơn hàng</FieldLabel>
                        <Textarea
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.currentTarget.value)
                          }
                          className="resize-none"
                        />
                      </Field>
                    )}
                  </form.Field>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="payment">
                    {(field) => (
                      <Field className="col-span-12">
                        <RadioGroup
                          value={field.state.value}
                          onValueChange={field.handleChange}
                        >
                          <Label>
                            <RadioGroupItem value="cod" />
                            Thanh toán khi giao hàng (COD)
                          </Label>
                        </RadioGroup>
                      </Field>
                    )}
                  </form.Field>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-4 pb-64 lg:pb-0">
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>Giỏ hàng</CardTitle>
                  <CardDescription>
                    {orderSumary?.totalQuantiy} sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {order?.items.map((item) => (
                    <Item key={item.id} variant="muted">
                      <ItemMedia>
                        <Avatar className="rounded-md">
                          <AvatarImage src={item.thumbnail} />
                          <AvatarFallback />
                        </Avatar>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="line-clamp-2">
                          <Link
                            to="/products/$id"
                            params={{ id: item.slug }}
                            className="hover:underline"
                          >
                            {item.name}
                          </Link>
                        </ItemTitle>
                        <ItemDescription className="space-x-2">
                          {item.combos.split(",").map((item) => (
                            <Badge key={item} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                          <Badge>Số lượng {item.quantity}</Badge>
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <div>
                          <p className="font-bold">
                            {formatVND(item.sale_price)}
                          </p>
                          <p className="text-xs text-neutral-500 line-through">
                            {formatVND(item.price)}
                          </p>
                        </div>
                      </ItemActions>
                    </Item>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none fixed bottom-0 right-0 left-0 lg:static">
                <CardHeader>
                  <CardTitle>Chi tiết thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-600 text-sm space-y-2">
                  <div className="flex justify-between mb-4">
                    <p>Tổng tiền hàng</p>
                    <p>{formatVND(orderSumary?.totalSalePrice)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Giảm giá</p>
                    <p></p>
                  </div>
                  <div className="flex justify-between">
                    <p>Phí giao hàng</p>
                    <p>Miễn phí</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <p className="font-bold">Thành tiền</p>
                    <p className="font-bold text-lg">
                      {formatVND(orderSumary?.totalSalePrice)}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" size="lg" className="w-full">
                    {orderMutation.isPending && <Spinner />}
                    Đặt hàng
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </form>
  );
}
