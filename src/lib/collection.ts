import { museumGalleryItems } from "@/lib/museumCatalog";

export type Piece = {
  url: string;
  title: string;
  category: string;
  period: string;
  description: string;
};

export const collection: Piece[] = museumGalleryItems.map((item) => ({
  url: item.image,
  title: item.title,
  category: item.category,
  period: "Acervo permanente",
  description: item.description,
}));
