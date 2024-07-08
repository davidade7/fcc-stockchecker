const mongoose = require('mongoose')

// Schema for the stock
const stockSchema = new mongoose.Schema({
  stock_symbol: { type: String, default: "" },
  ip_adresses: { type: [String], default: [] }
})

// Models
const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;