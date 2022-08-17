/* eslint-disable @typescript-eslint/naming-convention */

export interface Modified {
  time: Date;
}

export interface Category {
  name: string;
}

export interface Country {
  name: string;
}

export interface Movie {
  modified: Modified;
  _id: string;
  name: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  thumb_url: string;
  poster_url: string;
  is_copyright: string;
  sub_docquyen: string;
  chieurap: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  slug: string;
  year: number;
  actor: string[];
  director: string[];
  category: Category[];
  country: Country[];
}

export interface ServerData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface Episode {
  server_name: string;
  server_data: ServerData[];
}

export interface MovieResult {
  status: boolean;
  msg: string;
  movie: Movie;
  episodes: Episode[];
}
