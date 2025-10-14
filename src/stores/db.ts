import {
	createCollection,
	localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

const cartSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	price: z.number(),
	sale_price: z.number(),
	thumbnail: z.string(),
	quantity: z.number(),
	combos: z.string(),
	selected: z.boolean(),
	product: z.string(),
	variant: z.string(),
});

export const cartCollection = createCollection(
	localStorageCollectionOptions({
		id: "cart",
		storageKey: "cart",
		getKey: (item) => item.id,
		schema: cartSchema,
	}),
);

const orderSchema = z.object({
	id: z.number(),
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
	payment: z.enum(["cod"]).default("cod"),
	status: z.enum(["created"]).default("created"),
	note: z.string(),
	items: z.array(cartSchema),
});

export const orderCollection = createCollection(
	localStorageCollectionOptions({
		id: "order",
		storageKey: "order",
		getKey: (item) => item.id,
		schema: orderSchema,
	}),
);
