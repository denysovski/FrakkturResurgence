import type { CategoryKey } from "@/lib/catalog";

const RECENTLY_VIEWED_COOKIE = "frakktur_recently_viewed";

export type RecentlyViewedItem = {
  key: string;
  id: string;
  categoryKey: CategoryKey;
  categoryTitle: string;
  name: string;
  price: string;
  image: string;
};

export const readRecentlyViewed = (): RecentlyViewedItem[] => {
  if (typeof document === "undefined") {
    return [];
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${RECENTLY_VIEWED_COOKIE}=`));

  if (!cookieValue) {
    return [];
  }

  const serialized = cookieValue.split("=").slice(1).join("=");

  try {
    const parsed = JSON.parse(decodeURIComponent(serialized));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeRecentlyViewed = (items: RecentlyViewedItem[]) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${RECENTLY_VIEWED_COOKIE}=${encodeURIComponent(JSON.stringify(items))}; path=/; max-age=2592000; SameSite=Lax`;
};

export const pushRecentlyViewed = (item: Omit<RecentlyViewedItem, "key">) => {
  const current = readRecentlyViewed();
  const key = `${item.categoryKey}:${item.id}`;
  const updated = [{ ...item, key }, ...current.filter((entry) => entry.key !== key)].slice(0, 8);
  writeRecentlyViewed(updated);
  return updated;
};
