export const CATEGORY_TINTS = ['green', 'amber', 'blue', 'purple', 'slate', 'rose', 'teal', 'orange'] as const;
export type CategoryTint = (typeof CATEGORY_TINTS)[number];

export enum TransactionSource {
  Manual = 'manual',
  Voice = 'voice',
  Shortcut = 'shortcut',
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  tint: CategoryTint;
  description: string;
  keywords: string;
  sortOrder: number;
  archived: boolean;
}

export interface Transaction {
  id: string;
  amountPaise: number;
  categoryId: string;
  note: string;
  source: TransactionSource;
  rawText: string | null;
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
}

// A transaction joined with the fields of its category that lists need.
export interface TransactionRow extends Transaction {
  categoryName: string;
  categoryIcon: string;
  categoryTint: CategoryTint;
}

export interface CategoryTotal {
  categoryId: string;
  name: string;
  icon: string;
  tint: CategoryTint;
  totalPaise: number;
}

export interface MonthTotal {
  monthKey: string; // YYYY-MM, local time
  totalPaise: number;
}
