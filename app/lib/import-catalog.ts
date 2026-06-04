import catalog from "../data/import-catalog.json";

export type ImportedCatalogItem = {
  alternateName: string;
  category: string;
  cost: number;
  description: string;
  name: string;
  price: number;
  productCode: string;
  quantity: number;
  row: number;
  sku: string;
  variantAttribute: string;
  variantOption: string;
};

const importedCatalog = catalog as ImportedCatalogItem[];

export function lookupImportedCatalog(code: string) {
  const normalizedCode = code.trim().toLowerCase();

  if (!normalizedCode) return [];

  return importedCatalog.filter(
    (item) =>
      item.productCode.trim().toLowerCase() === normalizedCode ||
      item.sku.trim().toLowerCase() === normalizedCode,
  );
}

export function getImportedCatalogCount() {
  return importedCatalog.length;
}
