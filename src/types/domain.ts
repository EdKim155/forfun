export interface Tool {
  id: string;
  slug: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Template {
  id: string;
  userId?: string | null;
  title: string;
  description: string;
  body: string;
  variables: string[];
  toolSlugs: string[];
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
}

export interface PromptGeneration {
  id: string;
  userId: string;
  templateId?: string | null;
  toolSlug: string;
  categoryId?: string | null;
  brief: string;
  result: string;
  createdAt: string;
  template?: Template | null;
  category?: Category | null;
  title?: string | null;
  notes?: string | null;
}

export interface GenerateRequest {
  toolSlug: string;
  categorySlug?: string;
  brief: string;
  templateId?: string;
}

export interface GenerateResponse {
  prompt: string;
  meta: {
    templateId?: string;
    toolSlug: string;
    categorySlug?: string;
    variables?: string[];
  };
}
