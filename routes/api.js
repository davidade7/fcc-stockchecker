'use strict';

require('dotenv').config()
const mongoose = require('mongoose')

// Connection to mongoose
mongoose.connect(process.env['MONGO_URI'])
  .then(() => console.log("Connected to DB"))
  .catch(console.error);;

// Schema for the stocks
const Stock = require('../models/stockSchema')


module.exports = function (app) {

const stockAPIUrl = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote'


  app.route('/api/stock-prices')
    .get(async (req, res) => {
      // retrieve stock and like from query
      let stock = req.query.stock
      let like = req.query.like
      
      let result = []
      
      try {
        if (typeof(stock) === 'string') {
          let response = await fetch(stockAPIUrl.replace('[symbol]', stock))
          const data = await response.json()
          result = {
            stock: data.symbol,
            price: data.latestPrice,
            likes: data.likes
          }

        } else if (typeof(stock) === 'object') {
          for (let i=0; i<stock.length; i++) {
            let response = await fetch(stockAPIUrl.replace('[symbol]', stock[i]))
            const data = await response.json()
            
            result.push({
              stock: data.symbol,
              price: data.latestPrice,
              likes: data.likes
            })
          }
        }
        
        
        res.json({
          stockData: result
        })
    
        
      } 
      catch (error) {
        console.error(error)
      }
    });
    
};
