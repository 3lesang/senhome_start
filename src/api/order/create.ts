import z from "zod";
import { checkBrowserId } from "@/lib/utils";
import pocketClient, {
	ORDER_COLLECTION,
	ORDER_ITEM_COLLECTION,
} from "@/pocketbase";

const schema = z.object({
	name: z.string(),
	phone: z.string(),
	email: z.string(),
	street: z.string(),
	province: z.object({
		value: z.string(),
		label: z.string(),
	}),
	district: z.object({
		value: z.string(),
		label: z.string(),
	}),
	ward: z.object({
		value: z.string(),
		label: z.string(),
	}),
	payment: z.enum(["cod"]),
	status: z.enum(["created"]),
	note: z.string(),
	items: z.array(
		z.object({
			price: z.number(),
			sale_price: z.number(),
			product: z.string(),
			variant: z.string(),
			quantity: z.number(),
		}),
	),
});

type CreateOrderPayload = z.infer<typeof schema>;

export async function createOrderHandler(values: CreateOrderPayload) {
	const orderSumary = values?.items.reduce(
		(acc, cur) => {
			return {
				totalPrice: acc.totalPrice + cur.price * cur.quantity,
				finalPrice: acc.finalPrice + cur.sale_price * cur.quantity,
			};
		},
		{ totalPrice: 0, finalPrice: 0 },
	);
	const res = await pocketClient.collection(ORDER_COLLECTION).create({
		customer: {
			name: values.name,
			phome: values.phone,
			email: values.email,
			address: {
				street: values.street,
				province: values.province,
				district: values.district,
				ward: values.ward,
			},
			browser_id: checkBrowserId(),
		},
		payment: values.payment,
		status: values.status,
		note: values.note,
		total_price: orderSumary.totalPrice,
		final_price: orderSumary.finalPrice,
		total_discount: orderSumary.totalPrice - orderSumary.finalPrice,
	});

	if (values.items.length) {
		const batch = pocketClient.createBatch();
		for (const item of values.items) {
			batch.collection(ORDER_ITEM_COLLECTION).create({
				price: item.price,
				sale_price: item.sale_price,
				product: item.product,
				variant: item.variant,
				quantity: item.quantity,
				order: res.id,
			});
		}
		await batch.send();
	}
	return res;
}
