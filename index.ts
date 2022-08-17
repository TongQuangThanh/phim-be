import express from 'express';
import dotenv from 'dotenv';
import { checkRawData } from './data';
import * as fs from 'fs';
import { dataPath, type } from './const';
import path from 'path';
import http from 'http';
import { Movie } from './models/movie';
const debug = require('debug')("node-angular");
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
  const a = new Date().getMilliseconds();
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
    const data: Movie[] = dataMovies.filter(m =>
      (
        m.name.toLowerCase().includes(str) ||
        m.origin_name.toLowerCase().includes(str) ||
        m.director.map(d => d.toLowerCase()).includes(str) ||
        m.actor.map(a => a.toLowerCase()).includes(str)
      ) &&
      (!type || type.includes(m.type)) &&
      (!status || status.includes(m.status)) &&
      (!genre || m.category.some(c => genre.includes(c.name.trim().toLowerCase()))) &&
      (!country || m.country.some(c => country.includes(c.name.trim().toLowerCase()))) &&
      from <= m.year && m.year <= to
    ).slice(limit * page, limit);
    res.status(200).json({ message: "Fetch successfully", data });
    console.log(new Date().getMilliseconds() - a);
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
        dataMovies.sort((a, b) => new Date(a.modified.time).getTime() - new Date(b.modified.time).getTime());
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

const normalizePort = (val: string) => {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }
  return false;
}

const onError = (error: any) => {
  if (error.syscall !== "listen") {
    throw error;
  }
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  console.log('Listening on ' + port);
  debug("Listening on " + bind);
}

const port = normalizePort(process.env.PORT || "3080");
app.set('port', port);
const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  // checkRawData();
  setInterval(async () => {
    const success = await checkRawData();
    if (success) {
      dataMovies = JSON.parse(fs.readFileSync(path.join(dataPath, 'data.json'), 'utf8')) as Movie[];
    }
  }, 1000 * 60 * 60 * 24 * 7);
});