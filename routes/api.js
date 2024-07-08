'use strict';

require('dotenv').config()
const mongoose = require('mongoose')

// Connection to mongoose
mongoose.connect(process.env['MONGO_URI'])
  .then(() => console.log("Connected to DB"))
  .catch(console.error);;

// Schema for the stocks
const Stock = require('../models/stockSchema')



// Find Stock in the database with or without ip
const findStock = async (stock, ip) => {
  // Initialize query
  let query = { stock_symbol: stock }
  // Add ip to query if it is provided
  if (ip !== false) {
    query['ip_adresses'] = ip
  }
  // Perform the query
  let result = await Stock.findOne(query)
  console.log("finding stock in DB: ", result)
  // Return the result
  return result
}

// Add Stock to the database
const addStock = async (stock) => {
  let result = await Stock.create({ stock_symbol: stock })
  return result
}
// Add Stock with IP to the database
const addStockWithIP = async (stock, ip) => {
  let result = await Stock.create({ stock_symbol: stock})
  result['ip_adresses'].push(ip)
  result.save()
  return result
}

// Update Stock to add IP to the database
const addIP = async (stock, ip) => {
  let query = { stock_symbol: stock}

  let result = await Stock.findOneAndUpdate(query, { $push: { ip_adresses: ip } }, { new: true }) 
  result.save()
  return result
}

// Function to handle the API
const getStock = async (stock, like, ip) => {
  // API URL  
  const stockAPIUrl = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote'
  
  // Fetch the data from the API
  let response = await fetch(stockAPIUrl.replace('[symbol]', stock))
  const data = await response.json()
  let result
  if (data === "Unknown symbol") {
    result = {error: "invalid symbol"}
  } else {  
    result = {
      stock: data.symbol,
      price: data.latestPrice,
    }
  }
  // console.log("data >>", data)


  // Check if the stock_symbol is saved in the database
  let isStockInDB = await findStock(stock, false)
  // If the stock is not in the database
  if (!isStockInDB) {
    console.log("Stock not in DB, adding it...")
    // If the like is false, the create the stock without ip
    if (like === "false") {
      console.log("...without like")
      await addStock(stock)
    } 
    // If the like is true, create the stock with ip
    else {
      console.log("...with like")
      await addStockWithIP(stock, ip)
    }
  } 
  // The stock_symbol is already in the database
  else {
    console.log("Stock is in DB")
    // If stock symbol is liked, check if the ip is in the database
    if (like === "true") {
      let checkIPInDB = await findStock(stock, ip)
      if (!checkIPInDB) {
        console.log("IP is not in DB, adding it...")
        await addIP(stock, ip)
      }
    }
  }

  // Now count the likes
  let stockSearch = await Stock.findOne({ stock_symbol: stock })
  
  // Check the first array element to see if it is null
  if (!stockSearch['ip_adresses'][0]) {
    result['likes'] = 0
  } 
  // This means that the array has at least one ip saved
  else {
    let countLikes = stockSearch['ip_adresses'].length
    result['likes'] = countLikes
  }
  

  console.log("result >>", result)

  // Return the result
  return result
}


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      // retrieve stock and like from query
      let stock = req.query.stock
      let like = req.query.like
      // retrieve ip
      let ip = req.ip;

      let result = []
      
      // Check if stock is an array or a string
      if (typeof(stock) === 'string') {
        let response = await getStock(stock, like, ip)
        result = response
      } else if (typeof(stock) === 'object') {
        for (let i=0; i<stock.length; i++) {
          let response = await getStock(stock[i])
          result.push(response)
        }

        // Once we have the two stocks, we can compare the likes
        let likes1 = result[0]['likes']
        let likes2 = result[1]['likes']

        // Add the rel_likes to the result
        result[0]['rel_likes'] = likes1 - likes2
        result[1]['rel_likes'] = likes2 - likes1

        // Remove the likes from the result
        delete result[0]['likes']
        delete result[1]['likes'] 

      } else {
        console.log("not a string or an array")
        return
      }

      res.json({
        stockData: result
      })      
    });
    
};
