// src/constants/books.ts

export type BookFormat = "pdf" | "hardcopy";

export type BookMeta = {
  id: number;
  title: string;
  subtitle?: string;
  author: string;
  cover: string;
  tags: string[];
  pdfPrice?: number;
  hardcopyPrice?: number;
  hasPdf: boolean;
  hasHardcopy: boolean;
  pdfUrl?: string; // NEW
};

export const BOOKS: BookMeta[] = [
  {
    id: 1,
    title: "Thinking Clearly",
    subtitle: "Foundations of Critical Inquiry",
    author: "Studio Perennis",
    cover: "/books/thinking-clearly.jpg",
    tags: ["Critical thinking", "Foundations"],
    pdfPrice: 399,
    hardcopyPrice: 799,
    hasPdf: true,
    hasHardcopy: true,
    pdfUrl: "http://localhost:5000/api/books/1/pdf", // best: backend URL
  },
  {
    id: 2,
    title: "Cognitive Bias Field Guide",
    author: "Studio Perennis",
    cover: "/books/cognitive-bias-field-guide.jpg",
    tags: ["Biases", "Everyday reasoning"],
    pdfPrice: 299,
    hasPdf: true,
    hasHardcopy: false,
  },
  {
    id: 3,
    title: "Argument Forms in Practice",
    author: "Studio Perennis",
    cover: "/books/argument-forms.jpg",
    tags: ["Logic", "Exercises"],
    hardcopyPrice: 899,
    hasPdf: false,
    hasHardcopy: true,
  },
];

// Convenience map for lookups by id
export const BOOKS_BY_ID: Record<number, BookMeta> = Object.fromEntries(
  BOOKS.map((b) => [b.id, b])
);
