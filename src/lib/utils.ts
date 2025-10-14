import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_KEY } from "@/pocketbase";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatVND(n: number = 0) {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(n);
}

export function convertToFileUrl(record: {
	id: string;
	collectionName: string;
	file: string;
}) {
	if (!record?.id) return "";
	return `${API_KEY}/api/files/${record?.collectionName}/${record?.id}/${record?.file}?thumb=100x0`;
}
