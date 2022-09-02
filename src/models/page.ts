/* eslint-disable @typescript-eslint/naming-convention */
export interface Modified {
  time: Date;
}

export interface Item {
  modified: Modified;
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  year: number;
}

export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface PageResult {
  status: boolean;
  items: Item[];
  pagination: Pagination;
}
