let request = require('supertest');
let expect = require('chai').expect;
let rmdir = require('rmdir');
let fs = require('fs-extra');
let path = require('path');
let proxyquire =  require('proxyquire');

let index = proxyquire('../../server/index', {'../config': {
  PRODUCTS_FILE: 'products-test.json',
}});

let { app, server } = index;

// test the body
describe('index', () => {
  after(function (done) {
    server.close();
    let originalFile = path.join(__dirname, '../../server', 'products', 'products-bak.json');
    let testFile = path.join(__dirname, '../../server', 'products', 'products-test.json');
    fs.copy(originalFile, testFile, function (err) {
      if (err) return console.error(err);
      console.log('success!');
      done();
    });
  });

  describe('/api', () => {
    it('responds with a "Hello from prototypes"', (done) => {
      request(app)
        .get('/api')
        .end((err, res) => {
          expect(res.text).to.equal('Hello from prototypes api');
          done();
        });
    });

    describe('/api/products', () => {
      it('returns a json file with a list of products', (done) => {
        request(app)
          .get('/api/products')
          .end((err, res) => {
            expect(res.headers['content-type']).to.equal('application/json; charset=utf-8');
            expect(res.body).to.be.a('array');
            done();
          });
      });

      it('patches a product by id', (done) => {
        let expectedProduct = {
          'id': 3,
          'term': {
            'max': 15,
          },
          'amount': {
            'max': 5000000,
          },
          'fundingGap': {
            'max': 365,
          },
          'repayment': {},
          'name': 'Overdraft',
          'description': "<i class='material-icons'>done<\/i><p>Funds available up to an agreed limit at any time<\/p><i class='material-icons'>done<\/i><p>Easy to monitor<\/p><i class='material-icons'>done<\/i><p>No fixed drawdown / repayment dates<\/p><i class='material-icons'>done<\/i><p>Suitable for short-term financing<\/p><i class='material-icons'>done<\/i><p>The product is uncommitted and repayable on demand<\/p>",
        };

        request(app)
        .patch('/api/products/3')
        .send({ term: { max: 15 }})
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('updated');
          expect(res.body.product).to.deep.equal(expectedProduct);
          done();
        });
      });

      it('returns not found if the id doesn\'t exists', (done) => {
        request(app)
        .patch('/api/products/does-not-exists')
        .send({ term: { max: 15 }})
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.error).to.equal('product not found');
          done();
        });

      });
    });
  });

  describe('it serves a folder', () => {
    let dir = './dist';

    beforeEach((done) => {
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      fs.writeFile(`${dir}/test.js`, 'console.log("Hello Node.js");', function (err) {
        if (err) throw err;
        done();
      });
    });

    afterEach((done) => {
      rmdir(dir, done);
    });

    it('serves a file in the /dist folder', (done) => {
      request(app)
        .get('/test.js')
        .end((err, res) => {
          expect(res.headers['content-type']).to.equal('application/javascript');
          expect(res.text).to.equal('console.log("Hello Node.js");');
          done();
        });
    });
  });
});
