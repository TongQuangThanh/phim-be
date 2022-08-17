import express from 'express';
import dotenv from 'dotenv';
import { checkRawData } from './data';
import * as fs from 'fs';
import { dataPath, type } from './const';
import path from 'path';
import http from 'http';
import mongoose from 'mongoose';
import { MovieSchema } from './mongoose/movie';
import { Movie } from './models/movie';
import { resolveSoa } from 'dns';
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin");
  res.setHeader("Accept", "Content-Type");
  res.setHeader("X-Requested-With", "Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS, PATCH");
  next();
});

let dataMovies = JSON.parse(fs.readFileSync(path.join(dataPath, 'data.json'), 'utf8')) as Movie[];
console.log('[source:json]:', dataMovies[0].slug);
mongoose.connect("mongodb+srv://tongquangthanh:tongquangthanh@cluster0.80gcgnc.mongodb.net/phim?retryWrites=true&w=majority")
  .then(async (db) => {
    console.log('[database]: Connected to database!');
    dataMovies = await MovieSchema.find();
    console.log('[source:db]:', dataMovies[0].slug);
  });

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

const port = normalizePort(process.env.PORT || "3080");
app.set('port', port);
const server = http.createServer(app);
server.on("error", (error: any) => {
  if (error.syscall !== "listen") throw error;
});

app.get("/data", (req, res, next) => {
  const data: any = {};
  fs.readdir(dataPath, (err, files) => {
    if (err) {
      res.status(500).json({ message: "Unexpected error occur. Please try again later" });
      throw err;
    }
    for (const file of files) {
      if (!file.includes('data')) {
        data[file.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
      }
    }
    res.status(200).json({ message: "Fetch successfully", data });
  });
});

app.get("/tim-kiem", (req, res, next) => {
  const page = +(req.query.page || 1) - 1;
  const limit = +(req.query.limit || 10);
  const str = (req.query.str as string).trim().toLowerCase();
  const type = (req.query.type as string).trim().toLowerCase();
  const genre = (req.query.genre as string).trim().toLowerCase();
  const country = (req.query.country as string).trim().toLowerCase();
  const status = (req.query.status as string).trim().toLowerCase();
  const from = +(req.query.from as string);
  const to = +(req.query.to as string);
  try {
    const data = dataMovies.filter(m =>
      (
        m.name?.toLowerCase().includes(str) ||
        m.origin_name?.toLowerCase().includes(str) ||
        m.director.map(d => d.toLowerCase()).includes(str) ||
        m.actor.map(a => a.toLowerCase()).includes(str)
      ) &&
      (!type || type.includes(m.type || '')) &&
      (!status || status.includes(m.status || '')) &&
      (!genre || m.category.some(c => genre.includes((c.name || '').trim().toLowerCase()))) &&
      (!country || m.country.some(c => country.includes((c.name || '').trim().toLowerCase()))) &&
      from <= (m.year || from) && (m.year || to) <= to
    ).slice(limit * page, limit);
    res.status(200).json({ message: "Fetch successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Unexpected error occur. Please try again later" });
  }
});

app.get("/danh-sach/:url", (req, res, next) => { // phim-bo
  const url = req.params.url;
  const page = +(req.query.page || 1) - 1;
  const limit = +(req.query.limit || 10);
  const selectedType = type.find(t => t.url === url)?.key;
  try {
    let data;
    if (selectedType) {
      data = dataMovies.filter(m => m.type === selectedType).slice(limit * page, limit);
    } else {
      if (url === 'chieu-rap') {
        data = dataMovies.filter(m => m.chieurap).slice(limit * page, limit);
      } else {
        dataMovies.sort((a, b) => new Date(a.modified?.time || new Date()).getTime() - new Date(b.modified?.time || new Date()).getTime());
        data = dataMovies.slice(limit * page, limit);
      }
    }

    res.status(200).json({ message: "Fetch successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Unexpected error occur. Please try again later" });
  }
});

app.get("/high-light", (req, res, next) => {
  try {
    const day = new Date();
    const data = dataMovies.find(
      m => m.chieurap && m.status === 'completed' && m.poster_url && (m.year === day.getFullYear() || m.year === day.getFullYear() - 1)
    ) || dataMovies[0];
    res.status(200).json({ message: "Fetch successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Unexpected error occur. Please try again later" });
  }
});

app.get("/", (req, res, next) => {
  res.send('Welcome!!!');
});

server.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  setInterval(async () => {
    const success = await checkRawData();
    if (success) {
      dataMovies = await MovieSchema.find();
      console.log('[source:db]:', dataMovies[0].slug);
    }
  }, 1000 * 60 * 60 * 24 * 7);
});