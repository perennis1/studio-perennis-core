export type StorefrontVariant = {
  id: string;
  type: "PDF" | "HARDCOPY";
  pricePaise: number;
  currency: string;
  inStock: boolean;
  owned: boolean;
};

export type StorefrontBook = {
  id: number;
  title: string;
  slug: string;
  author: string | null;
  description: string | null;
  pages: number | null;
  coverImage: string | null;
  variants: StorefrontVariant[];
};
