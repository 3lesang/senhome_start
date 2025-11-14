import { getMenuItemQueryOptions, getMenuQueryOptions } from "@/queries/menu";
import { getStoreQueryOptions } from "@/queries/store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

export function Footer() {
  const getStoreQuery = useSuspenseQuery(getStoreQueryOptions());
  const getFooterMenuQuery = useSuspenseQuery(getMenuQueryOptions("footer"));
  const getMenuItemQuery = useSuspenseQuery(
    getMenuItemQueryOptions(getFooterMenuQuery.data?.id ?? 0),
  );
  return (
    <footer className="py-8 lg:py-16 bg-neutral-50 px-4 lg:px-8">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2">
        <div>
          <div className="mb-8">
            <p className="font-bold text-xl">{getStoreQuery.data.name}</p>
            <p className="text-sm text-neutral-800">
              {getStoreQuery.data.description}
            </p>
          </div>
          <div className="space-y-2 text-neutral-800">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="size-4 inline" />
              <p className="text-sm">{getStoreQuery.data.address}</p>
            </div>
            <div className="flex items-center space-x-2">
              <MailIcon className="size-4 inline" />
              <p className="text-sm">{getStoreQuery.data.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon className="size-4 inline" />
              <p className="text-sm">{getStoreQuery.data.phone}</p>
            </div>
            <img
              src="/LnLVN_logoSaleNoti_240916.png"
              alt=""
              className="w-72 object-cover"
            />
            <p className="text-sm">
              © {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2">
          <div className="space-y-4">
            {getMenuItemQuery.data.map((i) => (
              <Link
                to="/contents/$id"
                params={{ id: i.url }}
                className="text-sm"
              >
                {i.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
