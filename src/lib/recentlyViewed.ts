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
    if (!Array.isArray(parsed)) {
      return [];
    }

    const unique: RecentlyViewedItem[] = [];
    const seen = new Set<string>();

    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const key = typeof item.key === "string" ? item.key : `${item.categoryKey}:${item.id}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      unique.push({ ...item, key });
    }

    return unique;
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
