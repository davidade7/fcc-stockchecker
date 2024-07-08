const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let likes
  test('Test 1 : Viewing one stock: GET request to /api/stock-prices/', function(done) {
    // Setup
    let query = "?stock=GOOG"
    // Test
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices'+ query)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.strictEqual(res.body.stockData.stock, "GOOG");
        done();
      })
  });
  test('Test 2 : Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
    // Setup
    let query = "?stock=GOOG&like=true"
    // Test
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices'+ query)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.strictEqual(res.body.stockData.stock, "GOOG");
        likes = res.body.stockData.likes
        assert.strictEqual(res.body.stockData.likes, likes);
        done();
      })
  });
  test('Test 3 : Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    // Setup
    let query = "?stock=GOOG&like=true"
    // Test
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices'+ query)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.strictEqual(res.body.stockData.stock, "GOOG");
        assert.strictEqual(res.body.stockData.likes, likes);
        done();
      })
  });
  test('Test 4 : Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    // Setup
    let query = "?stock=GOOG&stock=MSFT"
    // Test
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices'+ query)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.strictEqual(res.body.stockData[0].stock, "GOOG");
        assert.strictEqual(res.body.stockData[1].stock, "MSFT");
        done();
      })
  });
  test('Test 5 : Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
    // Setup
    let query = "?stock=GOOG&stock=MSFT&like=true"
    // Test
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices'+ query)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.strictEqual(res.body.stockData[0].stock, "GOOG");
        assert.strictEqual(res.body.stockData[0]['rel_likes'], 0);
        assert.strictEqual(res.body.stockData[1].stock, "MSFT");
        assert.strictEqual(res.body.stockData[1]['rel_likes'], 0);
        done();
      })
  });
});
