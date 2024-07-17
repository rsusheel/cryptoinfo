import mongoose from 'mongoose'

const StockSchema = new mongoose.Schema({
    serial: {
        type: Number,
        required: true
    },
    id: {
        type: String,
        required: true
    }
})

const StockDetailSchema = new mongoose.Schema({
    serial: {
        type: Number,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    lastUpdated: {
        type: Number,
        required: true
    }
})

const Stock = mongoose.model("Stock", StockSchema)
const StockDetail = mongoose.model("StockDetail", StockDetailSchema)

export { Stock, StockDetail }