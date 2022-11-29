import path from 'path';
import * as fs from 'fs';
import express from 'express';
import slugify from 'slugify';
import { dataPath, type } from '../const';
import { Movie } from '../models/movie';
import { MovieSchema } from '../mongoose/movie';
export const movieRouters = express.Router();

const limit = 6;
let dataMovies = JSON.parse(fs.readFileSync(path.join(dataPath, 'data.json'), 'utf8')) as Movie[];
let filterType = JSON.parse(fs.readFileSync(path.join(dataPath, 'type.json'), 'utf8')) as string[];
let filterStatus = JSON.parse(fs.readFileSync(path.join(dataPath, 'status.json'), 'utf8')) as string[];
let filterCountry = JSON.parse(fs.readFileSync(path.join(dataPath, 'country.json'), 'utf8')) as string[];
let filterCategory = JSON.parse(fs.readFileSync(path.join(dataPath, 'category.json'), 'utf8')) as string[];

movieRouters.get("/data", (_req, res) => {
  const data: any = {};
  fs.readdir(dataPath, (err, files) => {
    if (err) {
      res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
    }
    for (const file of files) {
      if (!file.includes('data')) {
        data[file.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
      }
    }
    // res.status(200).json({ message: "Fetch successfully", data: [] });
    res.status(200).json({ message: "Fetch successfully", data });
  });
});

movieRouters.get("/tim-kiem", (req, res) => {
  const page = +(req.query.page || 1) - 1;
  const limit = +(req.query.limit || 10);
  const str = (req.query.str as string).trim().toLowerCase();
  const type = parseQuery(req.query.type, 'type');
  const genre = parseQuery(req.query.genre, 'category');
  const status = parseQuery(req.query.status, 'status');
  const country = parseQuery(req.query.country, 'country');
  const from = +(req.query.from as string);
  const to = +(req.query.to as string);
  try {
    // const data = dataMovies.filter(m =>
    //   (
    //     m.name?.toLowerCase().includes(str) ||
    //     m.slug?.toLowerCase().includes(str) ||
    //     m.origin_name?.toLowerCase().includes(str) ||
    //     m.director.map(d => d.toLowerCase()).includes(str) ||
    //     m.actor.map(a => a.toLowerCase()).includes(str)
    //   ) &&
    //   type.includes(m.type || '') &&
    //   status.includes(m.status || '') &&
    //   m.category.some(c => genre.includes(c.name || '')) &&
    //   m.country.some(c => country.includes(c.name || '')) &&
    //   from <= (m.year || from) && (m.year || to) <= to
    // );
    // console.log(data.length);
    const match: any = {
      $and: [{ year: { $gte: from } }, { year: { $lte: to } }],
      type: { $in: type },
      status: { $in: status },
      'category.name': { $in: genre },
      'country.name': { $in: country },
      $where: function () {
        return this.director.join().toLowerCase().includes(str) || this.actor.join().toLowerCase().includes(str)
      }
    }
    if (str) {
      match['$text'] = { $search: `\"${str}\"` };
    }
    MovieSchema.aggregate(
      [
        { $match: match },
        { $sort: { createdAt: -1 } },
        facet(limit, page)
      ]
    // ).then((_result: any) => res.status(200).json({ message: "Fetch successfully", data: [] }));
    ).then(result => res.status(200).json({ message: "Fetch successfully", data: result[0] }));
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
  }
});

movieRouters.get("/quoc-gia/:url", (req, res) => { // phim-bo
  const url = req.params.url;
  const page = +(req.query.page || 1) - 1;
  const limit = +(req.query.limit || 10);
  const prefer = parseQuery(req.query.prefer, 'category');
  const country = filterCountry.find(c => slugify(c) === url);
  try {
    MovieSchema.aggregate(
      [
        { $match: { 'country.name': country } },
        { $sort: { createdAt: -1 } },
        facet(limit, page)
      ]
    ).then((_result: any) => res.status(200).json({ message: "Fetch successfully", data: [] }));
    // ).then(result => res.status(200).json({ message: "Fetch successfully", data: result[0] }));
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
  }
});

movieRouters.get("/the-loai/:url", (req, res) => { // phim-bo
  const url = req.params.url;
  const page = +(req.query.page || 1) - 1;
  const limit = +(req.query.limit || 10);
  const prefer = parseQuery(req.query.prefer, 'category');
  const country = parseQuery(req.query.country, 'country');
  const category = filterCategory.find(c => slugify(c) === url);
  try {
    MovieSchema.aggregate(
      [
        { $match: { 'category.name': category, 'country.name': { $in: country } } },
        { $sort: { createdAt: -1 } },
        facet(limit, page)
      ]
    ).then((_result: any) => res.status(200).json({ message: "Fetch successfully", data: [] }));
    // ).then(result => res.status(200).json({ message: "Fetch successfully", data: result[0] }));
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
  }
});

movieRouters.get("/danh-sach/:url", (req, res) => { // phim-bo
  const url = req.params.url;
  const page = +(req.query.page || 1) - 1;
  const limit = +(req.query.limit || 10);
  const prefer = parseQuery(req.query.prefer, 'category');
  const selectedType = type.find(t => t.url === url)?.key;
  const country = parseQuery(req.query.country, 'country');
  try {
    let match: any = { type: selectedType, 'country.name': { $in: country } };
    let sort: any = { createdAt: -1 };
    if (url === 'chieu-rap') {
      match = { chieurap: true, 'country.name': { $in: country } };
    } else if (url === 'moi-nhat') {
      match = { 'country.name': { $in: country } };
    } else if (!selectedType) {
      match = { year: { $lte: 1 }, 'country.name': { $in: country } };
      sort = { 'modified.time': -1 };
    }
    MovieSchema.aggregate(
      [
        { $match: match },
        { $sort: sort },
        facet(limit, page)
      ]
    // ).then((_result: any) => res.status(200).json({ message: "Fetch successfully", data: [] }));
    ).then(result => res.status(200).json({ message: "Fetch successfully", data: result[0] }));
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
  }
});

movieRouters.get("/home", async (req, res) => {
  const prefer = parseQuery(req.query.prefer, 'category');
  const country = parseQuery(req.query.country, 'country');
  try {
    let data: any = {};
    for (const t of type) {
      data[t.key] = await MovieSchema.find({ type: t.key, 'country.name': { $in: country } }, null, { limit }).sort({ 'modified.time': -1 });
    }
    data['cinema'] = await MovieSchema.find({ chieurap: true, 'country.name': { $in: country } }, null, { limit }).sort({ 'modified.time': -1 });
    data['latest'] = await MovieSchema.find({ 'country.name': { $in: country } }, null, { limit }).sort({ 'modified.time': -1 });
    // res.status(200).json({ message: "Fetch successfully", data: [] })
    res.status(200).json({ message: "Fetch successfully", data })
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
  }
});

movieRouters.get("/de-xuat", (req, res) => {
  const prefer = parseQuery(req.query.prefer, 'category');
  const country = parseQuery(req.query.country, 'country');
  const currentCategory = parseQuery(req.query.category, 'category');
  const mixPrefer = [...new Set(prefer.concat(currentCategory))];
  const limit = +(req.query.limit || 10);
  try {
    MovieSchema.find({ 'category.name': { $in: mixPrefer }, 'country.name': { $in: country } }, null, { limit }).sort({ 'modified.time': -1 })
      // .then((_data: any) => res.status(200).json({ message: "Fetch successfully", data: [] }));
    .then(data => res.status(200).json({ message: "Fetch successfully", data }));
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
  }
});

movieRouters.get("/high-light", (req, res) => {
  const prefer = parseQuery(req.query.prefer, 'category');
  const country = parseQuery(req.query.country, 'country');
  try {
    const day = new Date();
    MovieSchema.findOne({
      'country.name': { $in: country },
      chieurap: true,
      status: 'completed',
      poster_url: { $ne: null },
      $or: [{ year: day.getFullYear() }, { year: day.getFullYear() - 1 }],
    }, (err: Error, data: Movie) => {
      if (err) {
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
      } else {
        // res.status(200).json({ message: "Fetch successfully", data: [] });
        res.status(200).json({ message: "Fetch successfully", data: data || dataMovies[0] });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
  }
});

const facet = (limit: number, page: number) => {
  return {
    $facet: {
      totalRecords: [{ $count: "total" }],
      movies: [
        { $skip: limit * page },
        { $limit: limit }
      ]
    }
  }
}

const parseQuery = (q: any, statement: string) => {
  if (q) return q.split(',');
  switch (statement) {
    case 'type':
      return filterType;
    case 'status':
      return filterStatus;
    case 'country':
      return filterCountry;
    case 'category':
      return filterCategory;
  }
}