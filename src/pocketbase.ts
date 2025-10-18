import PocketBase from "pocketbase";

export const PRODUCT_COLLECTION = "sen_products";
export const PRODUCT_VARIANT_COLLECTION = "sen_product_variants";
export const PRODUCT_OPTION_COLLECTION = "sen_product_options";
export const PRODUCT_OPTION_VALUE_COLLECTION = "sen_product_option_values";
export const PRODUCT_REVIEW_COLLECTION = "sen_product_reviews";
export const CATEGORY_COLLECTION = "sen_categories";
export const COLLECTION_COLLECTION = "sen_collections";
export const COLLECTION_PRODUCT_COLLECTION = "sen_collection_products";
export const ORDER_COLLECTION = "sen_orders";
export const ORDER_ITEM_COLLECTION = "sen_order_items";
export const USER_COLLECTION = "sen_users";
export const FILE_COLLECTION = "sen_files";
export const STORE_COLLECTION = "sen_store";
export const MENU_COLLECTION = "sen_menus";
export const STORE_PAGE_COLLECTION = "sen_pages";

export const API_KEY = "https://b0m772h91854471.pocketbasecloud.com";

const pocketClient = new PocketBase(API_KEY);
pocketClient.autoCancellation(false);
export { pocketClient };
