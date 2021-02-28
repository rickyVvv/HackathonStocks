const search = document.getElementById('search');

const API_KEY = 'c3e5ac051c91625055817f29177089b5';

let stocks = [];
let stockNames = [];

document.getElementById('add-stocks-button').onclick = () => {
    document.getElementById('search-foreground').style.display = 'block';
    document.body.style.overflow = 'hidden';
    noMsg();
}

document.getElementById('search-stock-button').onclick = () => {
    doSearch(search.value);
    noMsg();
}

let showResults = true;

document.getElementById('x-out').onclick = () => {
    document.getElementById('search-foreground').style.display = 'none';
    document.body.style.overflow = 'auto';
}

doSearch('');
getNavBarInfo();

function doSearch(input) {
    if(showResults) {
        const table = document.getElementById('title-table');
        for (let x = table.childElementCount-1; x > 0; x--) {
            table.deleteRow(x);
        }
        doSearchResult(input);
    }
}

function doSearchResult(input) {
    const table = document.getElementById('stocks-table');
    showResults = false;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.marketstack.com/v1/tickers?search=' + input + '&access_key=' + API_KEY);
    xhr.onload = () => {
        const dataArr = JSON.parse(xhr.responseText).data;
        let counter = 0;
        for(const stock of dataArr) {
            if(counter >= 29) {
                break;
            }
            createRowAddButton(table, stock);
            counter++;
        }
        showResults = true;
    }
    xhr.send(null);
}

/**
 * @param table
 * @param stock
 * @param stock.symbol
 * @param stock.name
 * @param stock.stock_exchange
 * @param stock.stock_exchange.country
 * @param stock.mic
 */
function createRowAddButton(table, stock) {
    const row = table.insertRow();
    row.insertCell().appendChild(createAddButton(stock));
    appendRows(row, stock);
}

/**
 * @param table
 * @param stock
 * @param stock.symbol
 * @param stock.name
 * @param stock.stock_exchange
 * @param stock.stock_exchange.country
 * @param stock.mic
 */
function createRowMinusButton(table, stock) {
    const row = table.insertRow();
    row.insertCell().appendChild(createDeleteButton(stock));
    appendRowsNoDisable(row, stock);
}


/**
 * @param row
 * @param stock
 * @param stock.symbol
 * @param stock.name
 * @param stock.stock_exchange
 * @param stock.stock_exchange.country
 * @param stock.mic
 */
function appendRowsNoDisable(row, stock) {
    row.insertCell().appendChild(document.createTextNode(stock.symbol));
    row.insertCell().appendChild(document.createTextNode(stock.name));
    row.insertCell().appendChild(document.createTextNode(stock.stock_exchange.name));
    row.insertCell().appendChild(document.createTextNode(stock.stock_exchange.mic));
    row.insertCell().appendChild(document.createTextNode(stock.stock_exchange.country));
}

/**
 * @param row
 * @param stock
 * @param stock.symbol
 * @param stock.name
 * @param stock.stock_exchange
 * @param stock.stock_exchange.country
 * @param stock.mic
 */
function appendRows(row, stock) {
    row.insertCell().appendChild(document.createTextNode(stock.symbol));
    row.insertCell().appendChild(document.createTextNode(stock.name));
    const cell0 = row.insertCell();
    cell0.className = 'disable-cols-later';
    cell0.appendChild(document.createTextNode(stock.stock_exchange.name));
    const cell1 = row.insertCell();
    cell1.className = 'disable-cols';
    cell1.appendChild(document.createTextNode(stock.stock_exchange.mic));
    const cell2 = row.insertCell();
    cell2.className = 'disable-cols';
    cell2.appendChild(document.createTextNode(stock.stock_exchange.country));
}

/**
 * @param table
 * @param stock
 * @param stock.symbol
 * @param stock.name
 * @param stock.stock_exchange
 * @param stock.stock_exchange.country
 * @param stock.mic
 */
function createRow(table, stock) {
    appendRowsNoDisable(table.insertRow(), stock);
}

function createDeleteButton(stock) {
    const button = document.createElement('button');
    button.className = 'stock-button red-button small-text';
    button.innerText = '-';
    button.onclick = () => {
        console.log(stockNames);
        for(let i = 0; i < stockNames.length; i++) {
            if(stockNames[i] === stock.symbol) {
                stockNames.splice(i,1);
                stocks.splice(i,1);
                button.parentElement.parentElement.parentElement
                    .removeChild(button.parentElement.parentElement);
            }
        }
    }
    return button;
}

let adding = false;

function createAddButton(stock) {
    const button = document.createElement('button');
    button.className = 'stock-button small-text';
    button.innerText = '+';
    button.onclick = () => {
        console.log(stockNames);
        if(stockNames.includes(stock.symbol)) {
            noMsg();
            error('You already added that stock!');
        } else if(stocks.length >= 10) {
            noMsg();
            error('You can only compare a max of 10 stocks at once. Sorry!');
        } else if(adding) {
            noMsg();
        } else {
            createRowMinusButton(document.getElementById('comparison-table'), stock);
            adding = true;
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.marketstack.com/v1/eod?symbols=' + stock.symbol + '&access_key=' + API_KEY);
            xhr.onload = () => {
                stocks.push(JSON.parse(xhr.responseText));
                stockNames.push(stock.symbol);
                noMsg();
                success('Success! Added ' + stock.symbol + ' to comparison.');
                adding = false;
            }
            xhr.send(null);
        }
    }
    return button;
}

function success(msg) {
    document.getElementById('success-message').innerText = msg;
    document.getElementById('success-message').style.display = 'block';
}

function error(msg) {
    document.getElementById('error-message').innerText = msg;
    document.getElementById('error-message').style.display = 'block';
}

function noMsg() {
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
}

function clearStocks() {
    stocks = [];
}

function graphData(callback) {
    for(let i = 0; i < stocks.length; i++) {
        callback(stockNames[i], stocks[i]);
    }
}

function jsonToCsv(json) {
    const arr = json.data;
    let csv = 'date,volume,open,close,high,low,symbol\n';
    for(const point of arr) {
        csv += getRow(point) + '\n';
    }
    return csv;
}

/**
 * @param point
 * @param point.date
 * @param point.volume
 * @param point.open
 * @param point.close
 * @param point.high
 * @param point.low
 * @param point.symbol
 */
function getRow(point) {
    return point.date + ',' + point.volume + ',' + point.open + ',' + point.close + ',' + point.high + ','
        + point.low + ',' + point.symbol;
}

function getNavBarInfo() {
    const titleId = 'top-stock-title';
    const midDayId = 'top-stock-midday';
    const changeId = 'top-stock-change';
    for(let i = 0; i < 4; i++) {
        setTimeout(() => {
            const symbol = document.getElementById(titleId+i).innerText;
            const xhr = new XMLHttpRequest();

            xhr.open('GET', 'https://api.marketstack.com/v1/intraday/latest?symbols=' + symbol + '&access_key=' + API_KEY);
            xhr.onload = () => {
                const json = JSON.parse(xhr.responseText);
                const data = json.data;
                const point = data[0];
                const change = (point.open - point.close).toFixed(2);
                if(change > 0) {
                    document.getElementById(changeId+i).style.color = 'green';
                } else {
                    document.getElementById(changeId+i).style.color = 'red';
                }
                const middle = ((point.close + point.open)/2).toFixed(2);
                document.getElementById(midDayId+i).innerText = '$' + String(middle);
                document.getElementById(changeId+i).innerText = '$' + String(change);
            }
            xhr.send(null);
        }, 500);
    }
}