import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import { fetchCurrentUser } from "@/lib/auth";
import {
  deleteAdminProduct,
  fetchAdminOptions,
  fetchAdminProducts,
  resolveImageUrl,
  saveAdminProduct,
  type AdminProduct,
} from "@/lib/productsApi";
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

const getSizesForCategory = (categoryKey: CategoryKey) => {
  if (categoryKey === "caps" || categoryKey === "belts") {
    return ["UNI"];
  }

  return ["XS", "S", "M", "L", "XL", "XXL"];
};

type FormState = {
  dbId?: number;
  id: string;
  categoryKey: CategoryKey;
  name: string;
  description: string;
  material: string;
  sustainability: string;
  imageKey: string;
  isActive: boolean;
  priceCents: number;
  sizeStocks: Record<string, number>;
};

const emptyForm = (): FormState => ({
  dbId: undefined,
  id: "",
  categoryKey: "tshirts",
  name: "",
  description: "",
  material: "",
  sustainability: "",
  imageKey: "",
  isActive: true,
  priceCents: 0,
  sizeStocks: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
});

const toImagePreviewUrl = (imageKey: string, categoryKey: CategoryKey) => {
  if (!imageKey) {
    return "";
  }

  return resolveImageUrl(imageKey, categoryKey, "preview");
};

const extractImageFileName = (imageKey?: string) => {
  if (!imageKey) {
    return "";
  }

  return imageKey.trim().replace(/[?#].*$/, "").split("/").pop() || "";
};

const ProductListItem = memo(
  ({
    product,
    onEdit,
    onDelete,
  }: {
    product: AdminProduct;
    onEdit: (product: AdminProduct) => void;
    onDelete: (id: string) => void;
  }) => (
    <div className="border border-border p-3 rounded-sm">
      <div className="flex items-start gap-3">
        <div className="w-[100px] h-[100px] border border-border overflow-hidden bg-secondary rounded-sm shrink-0">
          {product.imageKey ? (
            <img
              src={resolveImageUrl(product.imageKey, product.categoryKey, "preview")}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{product.id} · {product.name}</p>
          <p className="text-xs text-muted-foreground">{product.categoryTitle} · €{(product.priceCents / 100).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Stock total: {product.stockTotal}</p>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => onEdit(product)} className="text-xs underline">
          Edit
        </button>
        <button type="button" onClick={() => onDelete(product.id)} className="text-xs underline text-destructive">
          Delete
        </button>
      </div>
    </div>
  )
);
ProductListItem.displayName = "ProductListItem";

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [descriptionOptions, setDescriptionOptions] = useState<string[]>([]);
  const [sustainabilityOptions, setSustainabilityOptions] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<"all" | CategoryKey>("all");

  const sizeKeys = useMemo(() => getSizesForCategory(form.categoryKey), [form.categoryKey]);
  const currentImageFileName = useMemo(() => extractImageFileName(form.imageKey), [form.imageKey]);
  const filteredProducts = useMemo(
    () => products.filter((item) => selectedCategoryFilter === "all" || item.categoryKey === selectedCategoryFilter),
    [products, selectedCategoryFilter],
  );

  const refresh = useCallback(async () => {
    const [productsResponse, optionsResponse] = await Promise.all([fetchAdminProducts(), fetchAdminOptions()]);
    setProducts(productsResponse.products);
    setDescriptionOptions(optionsResponse.descriptions);
    setSustainabilityOptions(optionsResponse.sustainability);
  }, []);

  const fillFromProduct = useCallback((product: AdminProduct) => {
    setForm({
      dbId: product.dbId,
      id: product.id,
      categoryKey: product.categoryKey,
      name: product.name,
      description: product.description,
      material: product.material,
      sustainability: product.sustainability,
      imageKey: product.imageKey || "",
      isActive: product.isActive,
      priceCents: product.priceCents,
      sizeStocks: product.sizeStocks,
    });
  }, []);

  const onCategoryChange = useCallback((categoryKey: CategoryKey) => {
    const nextSizes = getSizesForCategory(categoryKey);
    const nextStocks: Record<string, number> = {};
    nextSizes.forEach((size) => {
      nextStocks[size] = form.sizeStocks[size] ?? 0;
    });

    setForm((prev) => ({
      ...prev,
      categoryKey,
      sizeStocks: nextStocks,
    }));
  }, [form.sizeStocks]);

  const onDelete = useCallback(async (id: string) => {
    if (!window.confirm(`Delete product ${id}?`)) {
      return;
    }

    try {
      await deleteAdminProduct(id);
      await refresh();
      if (form.id === id) {
        setForm(emptyForm());
      }
      toast({ title: "Deleted", description: `${id} was removed.` });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [form.id, refresh, toast]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const user = await fetchCurrentUser();
        if (!user.isAdmin) {
          navigate("/", { replace: true });
          return;
        }

        await refresh();
        if (!cancelled) {
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          navigate("/auth/login", { replace: true });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [navigate, refresh]);

  const openImageSelector = useCallback(() => {
    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const url = `${window.location.origin}${normalizedBase}admin/assets?pick=1&category=${encodeURIComponent(form.categoryKey)}`;
    window.open(url, "frakktur-asset-picker", "width=1280,height=850");
  }, [form.categoryKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const payload = event.data as { type?: string; imageKey?: string };
      if (payload?.type !== "frakktur:asset-selected" || !payload.imageKey) {
        return;
      }

      setForm((prev) => ({ ...prev, imageKey: payload.imageKey }));
      toast({ title: "Image selected", description: payload.imageKey });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [toast]);

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter product name." });
      return;
    }

    try {
      setIsSaving(true);
      const isEditing = Boolean(form.dbId);
      await saveAdminProduct({
        dbId: form.dbId,
        id: form.id || undefined,
        categoryKey: form.categoryKey,
        name: form.name.trim(),
        description: form.description.trim(),
        material: form.material.trim(),
        sustainability: form.sustainability.trim(),
        imageKey: form.imageKey.trim(),
        isActive: form.isActive,
        priceCents: Math.max(0, form.priceCents),
        sizeStocks: sizeKeys.reduce<Record<string, number>>((acc, size) => {
          acc[size] = Math.max(0, Math.min(100, Number(form.sizeStocks[size] || 0)));
          return acc;
        }, {}),
      });

      await refresh();
      setForm(emptyForm());
      toast({
        title: isEditing ? "Edited successfully" : "Saved",
        description: isEditing ? "Product updated successfully." : "Product saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [form, sizeKeys, toast, refresh]);

  if (isLoading) {
    return (
      <PageLayout forceBlackNavbar={true}>
        <div className="pt-28 px-6 md:px-10 pb-16">Loading admin panel...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout forceBlackNavbar={true}>
      <div className="pt-28 px-6 md:px-10 pb-16">
        <h1 className="text-3xl font-light mb-6">Admin Products</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <section className="border border-border p-4 rounded-sm space-y-3">
            <h2 className="text-lg font-medium">Create / Edit Product</h2>

            {form.imageKey ? (
              <div className="w-[100px] h-[100px] border border-border overflow-hidden bg-secondary rounded-sm">
                <img
                  src={toImagePreviewUrl(form.imageKey, form.categoryKey)}
                  alt="Product preview"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            <input
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
              placeholder="Product code (e.g. ts_171)"
              className="w-full border border-border px-3 py-2 text-sm bg-background"
            />

            <select
              value={form.categoryKey}
              onChange={(event) => onCategoryChange(event.target.value as CategoryKey)}
              className="w-full border border-border px-3 py-2 text-sm bg-background"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>{option.title}</option>
              ))}
            </select>

            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Product name"
              className="w-full border border-border px-3 py-2 text-sm bg-background"
            />

            <input
              type="number"
              min={0}
              value={form.priceCents}
              onChange={(event) => setForm((prev) => ({ ...prev, priceCents: Number(event.target.value) || 0 }))}
              placeholder="Price cents"
              className="w-full border border-border px-3 py-2 text-sm bg-background"
            />

            <input
              value={form.material}
              onChange={(event) => setForm((prev) => ({ ...prev, material: event.target.value }))}
              placeholder="Material"
              className="w-full border border-border px-3 py-2 text-sm bg-background"
            />

            <div>
              <input
                list="desc-options"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description"
                className="w-full border border-border px-3 py-2 text-sm bg-background"
              />
              <datalist id="desc-options">
                {descriptionOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <div>
              <input
                list="sustainability-options"
                value={form.sustainability}
                onChange={(event) => setForm((prev) => ({ ...prev, sustainability: event.target.value }))}
                placeholder="Sustainability"
                className="w-full border border-border px-3 py-2 text-sm bg-background"
              />
              <datalist id="sustainability-options">
                {sustainabilityOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <input
              value={form.imageKey}
              onChange={(event) => setForm((prev) => ({ ...prev, imageKey: event.target.value }))}
              placeholder="Image key or filename (example.jpg)"
              className="w-full border border-border px-3 py-2 text-sm bg-background"
            />

            <div className="flex items-center gap-3 border border-border px-3 py-2 text-sm bg-background">
              <button
                type="button"
                onClick={openImageSelector}
                className="px-3 py-1 border border-border rounded-sm hover:bg-secondary"
              >
                Select images
              </button>
              <span className="text-xs text-muted-foreground truncate">
                {currentImageFileName || "No image selected"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {sizeKeys.map((size) => (
                <label key={size} className="text-xs">
                  <span className="block mb-1">{size}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.sizeStocks[size] ?? 0}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        sizeStocks: {
                          ...prev.sizeStocks,
                          [size]: Number(event.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full border border-border px-2 py-1 text-sm bg-background"
                  />
                </label>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              Active
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void onSave()}
                disabled={isSaving}
                className="px-4 py-2 bg-foreground text-background text-sm disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setForm(emptyForm())}
                className="px-4 py-2 border border-border text-sm"
              >
                Reset
              </button>
            </div>
          </section>

          <section className="border border-border p-4 rounded-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-medium">Products</h2>
              <select
                value={selectedCategoryFilter}
                onChange={(event) => setSelectedCategoryFilter(event.target.value as "all" | CategoryKey)}
                className="border border-border px-3 py-1.5 text-sm bg-background"
              >
                <option value="all">All categories</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>{option.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 max-h-[72vh] overflow-auto pr-1">
              {filteredProducts.map((product) => (
                <ProductListItem
                  key={product.dbId}
                  product={product}
                  onEdit={fillFromProduct}
                  onDelete={onDelete}
                />
              ))}

              {filteredProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products in this category.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminProductsPage;
