import { type ClassValue, clsx } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatVND(n: number = 0) {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(n);
}

export function convertToFileUrl(file: string) {
	return `https://bucket.senhome.vn/${file}`;
}

export function calculateDiscount(originPrice: number, salePrice: number) {
	if (originPrice <= 0) return 0;
	const discount = ((originPrice - salePrice) / originPrice) * 100;
	return Math.round(discount);
}

export function checkBrowserId() {
	const key = "browser_id";
	const id = localStorage.getItem(key);
	if (id) return id;
	const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
	const nanoid = customAlphabet(alphabet, 6);
	const newId = nanoid();
	localStorage.setItem(key, newId);
	return newId;
}
