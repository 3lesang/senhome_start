import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import axiosClient from "@/axios";
import { MENU_QUERY_KEY } from "@/constants";

type MenuData = {
	id: number;
	name: string;
	position: string;
};

export function getMenuQueryOptions(position: string) {
	return queryOptions({
		queryKey: [MENU_QUERY_KEY, position],
		queryFn: async () => {
			try {
				const res = await axiosClient.get<MenuData>(
					`/menus/position/${position}`,
				);
				return res?.data;
			} catch (error) {
				return {} as MenuData;
			}
		},
	});
}

type MenuItemData = {
	name: string;
	url: string;
	items: MenuItemData[];
};

export function getMenuItemQueryOptions(menuID: number) {
	return queryOptions({
		queryKey: [MENU_QUERY_KEY, menuID],
		queryFn: async () => {
			try {
				const res = await axios.get<MenuItemData[]>(
					`https://bucket.senhome.vn/menu/${menuID}`,
				);
				return res.data;
			} catch (error) {
				return [] as MenuItemData[];
			}
		},
		enabled: !!menuID,
	});
}
