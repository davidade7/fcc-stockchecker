'use strict';

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
