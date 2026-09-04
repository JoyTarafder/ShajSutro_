import { Product } from "@/types";
import ProductCard from "./ProductCard";
import { PackageOpen } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  title?: string;
  subtitle?: string;
}

export default function ProductGrid({
  products,
  columns = 4,
  title,
  subtitle,
}: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <section>
      {(title || subtitle) && (
        <div className="mb-10">
          {title && <h2 className="section-title">{title}</h2>}
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      )}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <PackageOpen
            className="w-12 h-12 text-charcoal-200 mb-5"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-medium text-charcoal-900">No products found</h3>
          <p className="text-charcoal-400 mt-1.5 text-sm font-light">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className={`grid ${gridCols[columns]} gap-x-5 gap-y-10 sm:gap-x-7`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
