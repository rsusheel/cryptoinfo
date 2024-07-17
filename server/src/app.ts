require('dotenv').config();

import express from 'express';
const app = express();
import axios from 'axios';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3002;

import { Stock, StockDetail } from './model';

interface StockData {
    "usd": Number,
    "last_updated_at": Number
}

app.get('/', (req, res) => {
    res.send('Hello!!');
})

app.get('/api/reset', async (req, res) => {
    try {
        
        await Stock.deleteMany();
        await StockDetail.deleteMany();

        const headers = {
            'x-cg-demo-api-key': process.env.API_KEY
        }

        const ids = 'bitcoin,ethereum,tether,binancecoin,solana,staked-ether,usd-coin,ripple,the-open-network,dogecoin,cardano,tron,shiba-inu,avalanche-2,wrapped-bitcoin,polkadot,chainlink,bitcoin-cash,near,uniswap';
        const id_array = ids.split(',');

        let serial = 0;

        let resData = [];

        for(const id of id_array){
            serial++;

            let params = {
                ids: id,
                vs_currencies: 'usd',
                include_last_updated_at: true
            }
            const response = await axios.get(process.env.API_URL+'/simple/price', { headers, params });

            const otherData = await axios.get(process.env.API_URL+'/coins/'+id, { headers });

            const stockData = Object.entries(response.data).map(([id, data]) => {
                return {
                    serial: serial,
                    id
                }
            });

            const stockDetailsData = Object.entries(response.data).map(([id, data]) => {
                const stockDataItem = data as StockData;
                return {
                    serial: serial,
                    id,
                    name: otherData.data.name,
                    symbol: otherData.data.symbol,
                    price: stockDataItem.usd,
                    lastUpdated: stockDataItem.last_updated_at
                }
            });

            const newStock = new Stock({ ...stockData[0] });
            await newStock.save();

            const newStockDetails = new StockDetail({ ...stockDetailsData[0] });
            await newStockDetails.save();

            resData.push(stockDetailsData[0]);
        }
        
        return res.status(201).json(resData);
    } catch(err) {
        console.error(err);
    }
})

app.get("/api/list", async (req, res) => {
    try {
        const headers = {
            'x-cg-demo-api-key': process.env.API_KEY
        }
        const response = await axios.get(process.env.API_URL+'/coins/list', { headers });
        return res.status(201).json(response.data)
    } catch(err) {
        console.error(err);
    }
})

app.post("/api/change", async (req, res) => {
    try {
        const headers = {
            'x-cg-demo-api-key': process.env.API_KEY
        }
        const params = {
            ids: req.body.new_id,
            vs_currencies: 'usd',
            include_last_updated_at: true
        }
        const response = await axios.get(process.env.API_URL+'/simple/price', { headers, params });

        const otherData = await axios.get(process.env.API_URL+'/coins/'+req.body.new_id, { headers });

        const stockData = Object.entries(response.data).map(([id, data]) => ({
            serial: req.body.serial,
            id
        }));

        const stockDetailsData = Object.entries(response.data).map(([id, data]) => {
            const stockDataItem = data as StockData
            return {
                serial: req.body.serial,
                id,
                name: otherData.data.name,
                symbol: otherData.data.symbol,
                price: stockDataItem.usd,
                lastUpdated: stockDataItem.last_updated_at
            }
        });

        const newStock = new Stock({ ...stockData[0] });
        await newStock.save();

        const newStockDetails = new StockDetail({ ...stockDetailsData[0] });
        await newStockDetails.save();

        await Stock.deleteOne({id: req.body.old_id});
        await StockDetail.deleteOne({id: req.body.old_id});
        fetchAndUpdate();
        return res.status(201).json(response.data)
    } catch(err) {
        console.error(err);
    }
})

// app.get('/api/add', async (req, res) => {
//     try {
//         const headers = {
//             'x-cg-demo-api-key': process.env.API_KEY
//         }
//         const params = {
//             ids: req.body.id,
//             vs_currencies: 'usd'
//         }
//         const response = await axios.get(process.env.API_URL+'/simple/price', { headers, params });

//         const stockData = Object.entries(response.data).map(([id, data]) => ({
//             id
//         }));

//         const stockDetailsData = Object.entries(response.data).map(([id, data]) => {
//             const stockDataItem = data as StockData;
//             return {
//                 id,
//                 price: stockDataItem.usd
//             }
//         });

//         const newStock = new Stock({ ...stockData[0] });
//         const insertedStock = await newStock.save();

//         const newStockDetails = new StockDetail({ ...stockDetailsData[0] });
//         const insertedStockDetails = await newStockDetails.save();
//         return res.status(201).json({insertedStock, insertedStockDetails});
//     } catch(err) {
//         console.error(err);
//     }
// })

async function fetchAndUpdate() {
    try {
        const headers = {
            'x-cg-demo-api-key': process.env.API_KEY
        }

        const stockIds = await Stock.find();
        let stock_list = '';
        stockIds.forEach(item => {
            stock_list += ','
            stock_list += item.id;
        });
        stock_list = stock_list.slice(1);

        const params = {
            ids: stock_list,
            vs_currencies: 'usd',
            include_last_updated_at: true
        }
        const response = await axios.get(process.env.API_URL+'/simple/price', { headers, params });

        function findSerialById(id: String) {
            for (const item of stockIds) {
              if (item.id === id) {
                return item.serial;
              }
            }
            return null;
        }
        const stockDetailsData = Object.entries(response.data).map(([id, data]) => {
            const stockDataItem = data as StockData;
            const serial = findSerialById(id);
            return {
                id,
                price: stockDataItem.usd,
                lastUpdated: stockDataItem.last_updated_at
            }
        });

        

        for(const item of stockDetailsData){
            await StockDetail.updateOne({ id: item.id }, { $set: {price: item.price, lastUpdate: item.lastUpdated} }, { upsert: true });
        }

        function sortBySerial(array: any[]) {
            return array.sort((a, b) => {
              if (a.serial < b.serial) return -1;
              if (a.serial > b.serial) return 1;
              return 0;
            });
        }
        let res = await StockDetail.find();
        const sortedRes = sortBySerial(res);

        return res;
    } catch(err) {
        console.error(err);
    }
}

app.get('/api/refresh', async (req, res) => {
    try {
        const response = await fetchAndUpdate();
        res.status(201).json(response);
    } catch(err) {
        console.error(err);
    }
})

app.get('/api/ping', async (req, res) => {
    try {
        const headers = {
            'x-cg-demo-api-key': process.env.API_KEY
        }
        const api_url = process.env.API_URL as string;
        const response = await axios.get(api_url, { headers });
        res.json(response.data);
    } catch(err) {
        console.error(err);
        res.status(500).send('Error making API call');
    }
})

async function start() {
    try {
        const db_uri = process.env.DB_URI as string;
        await mongoose.connect(db_uri);
        console.log("DB is connected successfully");
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        })
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

start();