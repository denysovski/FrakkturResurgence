import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import { fetchCurrentUser } from "@/lib/auth";
import {
  deleteAdminProduct,
  fetchAdminOptions,
  fetchAdminProducts,
  saveAdminProduct,
  type AdminProduct,
  uploadAdminProductImage,
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

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [descriptionOptions, setDescriptionOptions] = useState<string[]>([]);
  const [sustainabilityOptions, setSustainabilityOptions] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sizeKeys = useMemo(() => getSizesForCategory(form.categoryKey), [form.categoryKey]);

  const refresh = async () => {
    const [productsResponse, optionsResponse] = await Promise.all([fetchAdminProducts(), fetchAdminOptions()]);
    setProducts(productsResponse.products);
    setDescriptionOptions(optionsResponse.descriptions);
    setSustainabilityOptions(optionsResponse.sustainability);
  };

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
  }, [navigate]);

  const fillFromProduct = (product: AdminProduct) => {
    setForm({
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
  };

  const onCategoryChange = (categoryKey: CategoryKey) => {
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
  };

  const onUploadImage = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadAdminProductImage(file);
      setForm((prev) => ({ ...prev, imageKey: response.imageKey }));
      toast({ title: "Image uploaded", description: "Image key set on product form." });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter product name." });
      return;
    }

    try {
      setIsSaving(true);
      await saveAdminProduct({
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
      toast({ title: "Saved", description: "Product saved successfully." });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (id: string) => {
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
  };

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
              placeholder="Image key (uploads/products/...)"
              className="w-full border border-border px-3 py-2 text-sm bg-background"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(event) => void onUploadImage(event.target.files?.[0] || null)}
              className="w-full border border-border px-3 py-2 text-sm bg-background"
            />

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
                disabled={isSaving || isUploading}
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
            <h2 className="text-lg font-medium mb-3">Products</h2>
            <div className="space-y-2 max-h-[72vh] overflow-auto pr-1">
              {products.map((product) => (
                <div key={product.dbId} className="border border-border p-3 rounded-sm">
                  <p className="text-sm font-medium">{product.id} · {product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.categoryTitle} · €{(product.priceCents / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Stock total: {product.stockTotal}</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => fillFromProduct(product)} className="text-xs underline">Edit</button>
                    <button type="button" onClick={() => void onDelete(product.id)} className="text-xs underline text-destructive">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminProductsPage;
