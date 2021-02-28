import requests
from flask import Flask, request

app = Flask(__name__)

API_KEY = 'c3e5ac051c91625055817f29177089b5'


@app.route('/')
def hello():
    return "Hello World!"


@app.route('/stockData', methods=['GET'])
def stock_data():
    symbols = request.args.get('symbols')
    r = requests.get('http://api.marketstack.com/v1/eod?symbols=' + symbols + '&access_key=' + API_KEY)
    return r.text


@app.route('/searchStocks', methods=['GET'])
def search_stock():
    search = request.args.get('search')
    r = requests.get('http://api.marketstack.com/v1/tickers?search=' + search + '&access_key=' + API_KEY)
    return r.text


if __name__ == '__main__':
    app.run()
