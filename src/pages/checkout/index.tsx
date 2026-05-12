import { eq, useLiveQuery } from "@tanstack/react-db";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import {
	customerAtom,
	SIGN_IN_TYPE,
	SIGN_UP_TYPE,
	setAuthTypeAtom,
	setOpenAtom,
	tokenAtom,
} from "@/atom/auth";
import axiosClient from "@/axios";
import { ProvinceSelect } from "@/components/province-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldTitle,
} from "@/components/ui/field";
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
import { WardSelect } from "@/components/ward-select";
import { checkBrowserId, cn, convertToFileUrl, formatVND } from "@/lib/utils";
import { getDiscountsQueryOptions } from "@/queries/discount";
import { orderCollection } from "@/stores/db";

type CreateOrderAddressRequest = {
	address_line: string;
	full_name: string;
	phone: string;
	email: string;
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
	shipping_fee_amount: number;
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

type DiscountState = {
	id: number;
	code: string;
	effect: { value: string };
	per_customer_limit: number;
};

interface CheckoutDiscountProps {
	orderSalePrice?: number;
	onSubmit?: (value: DiscountState) => void;
	onInvalid?: () => void;
}

function CheckoutDiscount({
	orderSalePrice,
	onSubmit,
	onInvalid,
}: CheckoutDiscountProps) {
	const getDiscountsQuery = useSuspenseQuery(getDiscountsQueryOptions());

	const discounts = getDiscountsQuery.data?.filter(
		(d) => d.discount_type === "code",
	);

	const [code, setCode] = useState("");

	function handleSelect(value: string) {
		const discount = discounts?.[Number(value)];
		const [effect] = discount.effects;
		const next: DiscountState = {
			id: discount.id,
			code: discount.code ?? "",
			effect: { value: effect.value },
			per_customer_limit: discount.per_customer_limit,
		};
		onSubmit?.(next);
		setCode(next.code);
	}

	function handleCodeInput(value: string) {
		setCode(value);
	}

	function handleCodeApply() {
		const [discount] = discounts.filter((d) => d.code === code);
		if (!discount?.id) {
			onInvalid?.();
			toast.warning("Mã không hợp lệ", { position: "top-center" });
			return;
		}
		const [condition] = discount.conditions;
		const [effect] = discount.effects;

		const isValid =
			condition?.condition_type === "order_amount" &&
			Number(orderSalePrice) >= Number(condition.value);
		if (!isValid) {
			onInvalid?.();
			toast.warning("Chưa đủ điều kiện", { position: "top-center" });
			return;
		}
		const next: DiscountState = {
			id: discount.id,
			code: discount.code ?? "",
			effect: { value: effect.value },
			per_customer_limit: discount.per_customer_limit,
		};
		onSubmit?.(next);
	}

	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<CardTitle>Mã khuyến mãi</CardTitle>
			</CardHeader>
			<CardContent className="">
				{discounts?.length > 0 && (
					<RadioGroup
						className="flex gap-2 overflow-x-auto mb-4"
						onValueChange={handleSelect}
					>
						{discounts?.map((d, index) => {
							const [condition] = d.conditions;
							const isValid =
								condition?.condition_type === "order_amount" &&
								Number(orderSalePrice) >= Number(condition.value);

							return (
								<div key={d.id} className="space-y-1">
									<FieldLabel
										key={d.id}
										className="border-none overflow-hidden"
									>
										<Field
											orientation="horizontal"
											className="w-80 h-20 bg-neutral-50"
										>
											<FieldContent>
												<FieldTitle>{d.code}</FieldTitle>
												<FieldDescription className="line-clamp-2 text-xs">
													{d.description}
												</FieldDescription>
											</FieldContent>
											<RadioGroupItem
												disabled={!isValid}
												value={index.toString()}
											/>
										</Field>
									</FieldLabel>
									{!isValid && (
										<p className="text-xs">
											Đơn hàng chưa thỏa mãn điều kiện áp dụng mã
										</p>
									)}
								</div>
							);
						})}
					</RadioGroup>
				)}

				<div className="flex justify-between w-full gap-4">
					<Input
						placeholder="Nhập mã khuyến mãi"
						value={code}
						onChange={(e) => handleCodeInput(e.currentTarget.value)}
					/>
					<Button
						type="button"
						className="rounded-full cursor-pointer"
						onClick={handleCodeApply}
					>
						Áp dụng
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

type ShippingFeeData = {
	id: number;
	min_weight: number;
	max_weight: number;
	fee_amount: number;
	min_order_value: number;
	free_shipping: boolean;
};

export function CheckoutPage() {
	const navigate = useNavigate();
	const { data: order } = useLiveQuery((q) =>
		q
			.from({ order: orderCollection })
			.where(({ order }) => eq(order.id, checkBrowserId()))
			.findOne(),
	);

	const [, setAuthOpen] = useAtom(setOpenAtom);
	const [, setAuthType] = useAtom(setAuthTypeAtom);
	const [token] = useAtom(tokenAtom);
	const [customer] = useAtom(customerAtom);

	const [discount, setDiscount] = useState<DiscountState | null>(null);
	const discountPrice = Number(discount?.effect.value) | 0;

	const orderSumary = order?.items.reduce(
		(acc, cur) => {
			return {
				totalPrice: acc.totalPrice + cur.price * cur.quantity,
				totalSalePrice: acc.totalSalePrice + cur.sale_price * cur.quantity,
				totalQuantiy: acc.totalQuantiy + cur.quantity,
				totalWeight: acc.totalWeight + cur.quantity * cur.weight,
			};
		},
		{ totalPrice: 0, totalSalePrice: 0, totalQuantiy: 0, totalWeight: 0 },
	);

	const getShippingFeeQuery = useQuery({
		queryKey: ["shipping-fee", orderSumary?.totalWeight],
		queryFn: () => {
			return axiosClient.get<ShippingFeeData>(
				`/shipping-fees/weight/${orderSumary?.totalWeight}`,
			);
		},
		enabled: !!orderSumary?.totalWeight,
	});

	const shippingFeeData = getShippingFeeQuery.data?.data;
	let shippingFeeAmount = shippingFeeData?.fee_amount ?? 0;

	if (
		Number(orderSumary?.totalSalePrice) >=
			Number(shippingFeeData?.min_order_value) &&
		shippingFeeData?.free_shipping
	) {
		shippingFeeAmount = 0;
	}

	const finalPrice =
		Number(orderSumary?.totalSalePrice) - discountPrice + shippingFeeAmount;

	const orderMutation = useMutation({
		mutationFn: (value: FormValues) => {
			const request: CreateOrderRequest = {
				total_amount: Number(orderSumary?.totalSalePrice),
				discount_amount: discountPrice,
				shipping_fee_amount: shippingFeeAmount,
				address: {
					address_line: `${value.street}, ${value.ward.label}, ${value.province.label}`,
					full_name: value.name,
					phone: value.phone,
					email: value.email,
				},
				items: value.items,
			};
			if (discount?.id && customer?.id) {
				axiosClient.post("/discounts/usage", {
					discount_id: discount?.id,
					customer_id: customer?.id,
				});
			}
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
						{!token && (
							<div className="lg:col-span-12 px-4 lg:px-0 sticky top-4">
								<Item variant="muted" className="">
									<ItemMedia>
										<Button type="button" variant="ghost" size="icon-sm">
											<InfoIcon />
										</Button>
									</ItemMedia>
									<ItemContent>
										<ItemTitle>Chưa có tài khoản?</ItemTitle>
									</ItemContent>
									<ItemActions>
										<Button
											type="button"
											className="cursor-pointer"
											onClick={() => {
												setAuthType(SIGN_UP_TYPE);
												setAuthOpen(true);
											}}
										>
											Đăng ký
										</Button>
									</ItemActions>
								</Item>
							</div>
						)}
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
													placeholder="Họ và tên"
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
													placeholder="Số điện thoại"
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
													placeholder="Email"
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
													placeholder="Địa chỉ, tên đường"
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
												className="col-span-12 lg:col-span-6"
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
									<form.Field name="ward">
										{(field) => (
											<Field
												aria-invalid={!field.state.meta.isValid}
												className="col-span-12 lg:col-span-6"
											>
												<FieldLabel>Phường/Xã</FieldLabel>
												<WardSelect
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
									<form.Field name="note">
										{(field) => (
											<Field className="col-span-12">
												<FieldLabel>Ghi chú đơn hàng</FieldLabel>
												<Textarea
													placeholder="Ghi chú đơn hàng"
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
														Thanh toán khi nhận hàng (COD)
													</Label>
												</RadioGroup>
											</Field>
										)}
									</form.Field>
								</CardContent>
							</Card>
						</div>
						<div className="lg:col-span-5 space-y-4 pb-8 lg:pb-0">
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
													<AvatarImage src={convertToFileUrl(item.thumbnail)} />
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
													{item.combos.split(",").map(
														(item) =>
															item && (
																<Badge key={item} variant="secondary">
																	{item}
																</Badge>
															),
													)}
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
							<CheckoutDiscount
								orderSalePrice={orderSumary?.totalSalePrice}
								onSubmit={async (value) => {
									if (!token) {
										setAuthType(SIGN_IN_TYPE);
										setAuthOpen(true);
										return;
									}
									const res = await axiosClient.get<number>(
										`/discounts/${value.id}/customers/${customer?.id}/usage`,
									);
									const count_usage = res.data;
									if (value.per_customer_limit === null) {
										toast.success("Áp mã thành công!", {
											position: "top-center",
										});
										setDiscount(value);
										return;
									}
									if (count_usage < value.per_customer_limit) {
										toast.success("Áp mã thành công!", {
											position: "top-center",
										});
										setDiscount(value);
									} else {
										toast.success(
											"Bạn đã dùng mã này, vui lòng chọn mã khác!",
											{
												position: "top-center",
											},
										);
									}
								}}
								onInvalid={() => setDiscount(null)}
							/>
							<Card className="border-0 shadow-none">
								<CardHeader>
									<CardTitle>Chi tiết thanh toán</CardTitle>
								</CardHeader>
								<CardContent className="text-neutral-600 text-sm space-y-2">
									<div className="flex justify-between mb-4">
										<p>Tổng tiền hàng</p>
										<p>{formatVND(orderSumary?.totalSalePrice)}</p>
									</div>
									{discountPrice > 0 && (
										<div className="flex justify-between">
											<p>Voucher giảm giá</p>
											<p>-{formatVND(discountPrice)}</p>
										</div>
									)}
									<div className="flex justify-between">
										<p>Phí giao hàng</p>
										<p>
											{shippingFeeAmount > 0
												? formatVND(shippingFeeAmount)
												: "Miễn phí"}
										</p>
									</div>
								</CardContent>
								<Separator />
								<CardFooter>
									<div className="flex justify-between w-full">
										<p className="font-bold">Thành tiền</p>
										<p className="font-bold text-lg">{formatVND(finalPrice)}</p>
									</div>
								</CardFooter>
							</Card>
							<div className="fixed bottom-4 left-1/2 -translate-x-1/2">
								<ButtonGroup>
									<p
										className={cn(
											buttonVariants(),
											"rounded-full h-14 text-lg font-bold",
										)}
									>
										{formatVND(finalPrice)}
									</p>
									<Button
										type="submit"
										className="cursor-pointer rounded-full h-14 w-56 uppercase font-bold"
									>
										{orderMutation.isPending && <Spinner />}
										Đặt hàng
									</Button>
								</ButtonGroup>
							</div>
						</div>
					</div>
				</div>
			</main>
		</form>
	);
}
