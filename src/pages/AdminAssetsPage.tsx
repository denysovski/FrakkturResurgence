import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import PageLayout from "@/pages/PageLayout";
import { fetchCurrentUser } from "@/lib/auth";
import { deleteAdminAsset, fetchAdminAssets, resolveImageUrl, uploadAdminAsset, type AdminAssetItem } from "@/lib/productsApi";
import type { CategoryKey } from "@/lib/catalog";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_OPTIONS: Array<{ key: CategoryKey; title: string }> = [
  { key: "tshirts", title: "T-Shirts" },
  { key: "hoodies", title: "Hoodies" },
  { key: "caps", title: "Caps" },
  { key: "belts", title: "Belts" },
  { key: "pants", title: "Pants" },
  { key: "knitwear", title: "Knitwear" },
  { key: "leather-jackets", title: "Leather Jackets" },
];

const parseCategoryFromImageKey = (imageKey: string): CategoryKey | null => {
  const [candidate] = imageKey.split("/");
  const hit = CATEGORY_OPTIONS.find((item) => item.key === candidate);
  return hit ? hit.key : null;
};

const AdminAssetsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const pickMode = searchParams.get("pick") === "1";
  const initialCategory = (searchParams.get("category") as CategoryKey | null) || "tshirts";

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<AdminAssetItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"all" | CategoryKey>(pickMode ? initialCategory : "all");
  const [uploadCategory, setUploadCategory] = useState<CategoryKey>(initialCategory);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async (category: "all" | CategoryKey) => {
    const response = await fetchAdminAssets(category);
    setItems(response.items);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const ensureAdmin = async () => {
      try {
        const user = await fetchCurrentUser();
        if (!user.isAdmin) {
          navigate("/", { replace: true });
          return;
        }

        if (!cancelled) {
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          navigate("/auth/login", { replace: true });
        }
      }
    };

    void ensureAdmin();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    let cancelled = false;
    const loadItems = async () => {
      try {
        await refresh(selectedCategory);
      } catch {
        if (!cancelled) {
          toast({ title: "Load failed", description: "Could not load assets." });
        }
      }
    };

    void loadItems();
    return () => {
      cancelled = true;
    };
  }, [isLoading, selectedCategory, refresh, toast]);

  const onUpload = async () => {
    if (!selectedFile) {
      toast({ title: "File required", description: "Choose image file first." });
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadAdminAsset(uploadCategory, selectedFile);
      toast({ title: "Uploaded", description: `${result.imageKey} created.` });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await refresh(selectedCategory);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDeleteItem = async (imageKey: string) => {
    if (!window.confirm(`Delete image ${imageKey}?`)) {
      return;
    }
    if (!window.confirm("This cannot be undone. Delete permanently?")) {
      return;
    }

    try {
      await deleteAdminAsset(imageKey);
      await refresh(selectedCategory);
      toast({ title: "Deleted", description: imageKey });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const visibleItems = useMemo(
    () => items.filter((item) => selectedCategory === "all" || item.category === selectedCategory),
    [items, selectedCategory],
  );

  const selectImage = (imageKey: string) => {
    if (!pickMode) {
      navigator.clipboard.writeText(imageKey).catch(() => undefined);
      toast({ title: "Copied", description: imageKey });
      return;
    }

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: "frakktur:asset-selected", imageKey }, window.location.origin);
    }
    window.close();
  };

  if (isLoading) {
    return (
      <PageLayout forceBlackNavbar={true}>
        <div className="pt-28 px-6 md:px-10 pb-16">Loading assets...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout forceBlackNavbar={true}>
      <div className="pt-28 px-6 md:px-10 pb-16">
        <h1 className="text-3xl font-light mb-6">Admin Assets</h1>

        <section className="border border-border p-4 rounded-sm space-y-3 mb-6">
          <h2 className="text-lg font-medium">Upload image</h2>
          <div className="grid sm:grid-cols-3 gap-3 items-center">
            <select
              value={uploadCategory}
              onChange={(event) => setUploadCategory(event.target.value as CategoryKey)}
              className="border border-border px-3 py-2 text-sm bg-background"
            >
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.key} value={item.key}>{item.title}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-border text-sm hover:bg-secondary"
            >
              Browse
            </button>

            <button
              type="button"
              onClick={() => void onUpload()}
              disabled={isUploading}
              className="px-4 py-2 bg-foreground text-background text-sm disabled:opacity-60"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground truncate">{selectedFile?.name || "No file selected"}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
        </section>

        <section className="border border-border p-4 rounded-sm">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-lg font-medium">Library</h2>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as "all" | CategoryKey)}
              className="border border-border px-3 py-1.5 text-sm bg-background"
            >
              {!pickMode && <option value="all">All categories</option>}
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.key} value={item.key}>{item.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {visibleItems.map((item) => {
              const category = parseCategoryFromImageKey(item.imageKey) || item.category;
              const imageUrl = resolveImageUrl(item.imageKey, category, item.fileName);

              return (
                <div
                  key={item.imageKey}
                  className="group relative border border-border rounded-sm overflow-hidden text-left hover:bg-secondary transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => selectImage(item.imageKey)}
                    className="w-full text-left"
                  >
                    <div className="aspect-square bg-secondary overflow-hidden">
                      <img src={imageUrl} alt={item.fileName} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 pr-9">
                      <p className="text-[11px] text-muted-foreground truncate">{item.category}</p>
                      <p className="text-xs truncate">{item.fileName}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteItem(item.imageKey)}
                    className="absolute bottom-1.5 right-1.5 rounded-full border border-border bg-background/90 p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:border-destructive hover:text-destructive"
                    aria-label={`Delete ${item.fileName}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default AdminAssetsPage;
