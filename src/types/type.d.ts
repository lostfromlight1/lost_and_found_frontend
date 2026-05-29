// ─── Route / Page Utilities ───────────────────────────────────────────────────

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type Param = {
  [key: string]: string | string[] | undefined;
};

type PageProps<
  P extends Param = Param,
  S extends SearchParams = SearchParams,
> = {
  params: Promise<P>;
  searchParams: Promise<S>;
};

// ─── Roles ────────────────────────────────────────────────────────────────────

type Role = "USER" | "ADMIN";

