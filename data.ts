
import { PageResult } from './models/page';
import { Movie, MovieResult } from './models/movie';
import * as fs from 'fs';
import axios from 'axios';
import https from 'https';
import path from 'path';
import { dataPath } from './const';

let category: string[] = [];
let country: string[] = [];
let type: string[] = [];
let status: string[] = [];
let quality: string[] = [];
let lang: string[] = [];
let year: number[] = [];
const data: Movie[] = [];
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

export const url = 'https://ophim1.com';
export const checkRawData = async () => {
  try {
    const time = Date.now();

    let totalPages = 669;
    for (let i = 1; i <= totalPages; i++) {
      console.log(i, (Date.now() - time) / 1000);
      const moviesURL = encodeURI(`${url}/danh-sach/phim-moi-cap-nhat?page=${i}`);
      const movies = await (await axios.get(moviesURL)).data as PageResult;
      totalPages = movies.pagination.totalPages;
      for (const m of movies.items) {
        const movieURL = encodeURI(`${url}/phim/${m.slug.replaceAll('‑', '-')}`);
        const request = await axios.get(movieURL, {
          validateStatus: function (status) {
            return status < 500; // Resolve only if the status code is less than 500
          }
        });
        if (request.status > 299 || !request.data.status) {
          continue;
        }
        const movie = (request.data as MovieResult).movie;
        data.push(movie);
        if (movie.category) {
          for (const c of movie.category) {
            category = addToArray(category, c.name) as string[];
          }
        }

        if (movie.country) {
          for (const c of movie.country) {
            country = addToArray(country, c.name) as string[];
          }
        }

        type = addToArray(type, movie.type) as string[];
        status = addToArray(status, movie.status) as string[];
        quality = addToArray(quality, movie.quality) as string[];
        lang = addToArray(lang, movie.lang) as string[];
        year = addToArray(year, movie.year) as number[];
      }
    }

    console.log((Date.now() - time) / 3600000);
    if (fs.existsSync(dataPath)) {
      fs.readdir(dataPath, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          fs.unlink(path.join(dataPath, file), () => { });
        }
      });
    } else {
      fs.mkdirSync(dataPath);
    }
    fs.writeFileSync(`${path.join(dataPath, 'data.json')}`, JSON.stringify(data));
    fs.writeFileSync(`${path.join(dataPath, 'category.json')}`, JSON.stringify(category));
    fs.writeFileSync(`${path.join(dataPath, 'country.json')}`, JSON.stringify(country));
    fs.writeFileSync(`${path.join(dataPath, 'type.json')}`, JSON.stringify(type));
    fs.writeFileSync(`${path.join(dataPath, 'status.json')}`, JSON.stringify(status));
    fs.writeFileSync(`${path.join(dataPath, 'quality.json')}`, JSON.stringify(quality));
    fs.writeFileSync(`${path.join(dataPath, 'lang.json')}`, JSON.stringify(lang));
    fs.writeFileSync(`${path.join(dataPath, 'year.json')}`, JSON.stringify(year));
  } catch (error) {
    return false;
  }
  return true;
};

const addToArray = (arr: (string | number)[], item: string | number): (string | number)[] => {
  if (item && !arr.includes(item)) {
    arr.push(item);
  }
  return arr;
};