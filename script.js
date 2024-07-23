document.addEventListener('DOMContentLoaded', () => {
    const apiKeyAlpha = 'YOUR_ALPHA_VANTAGE_API_KEY';
    const stocksSymbols = ['SAB.MC', 'TSLA', 'UDMY'];
    const cryptosSymbols = ['bitcoin'];
    const etfsSymbols = ['FGQC', 'BTCW', 'ISHEALTH'];

    async function fetchStockData(symbol) {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKeyAlpha}`);
        const data = await response.json();
        return data['Global Quote'] ? data['Global Quote']['05. price'] : 'N/A';
    }

    async function fetchCryptoData(symbol) {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
        const data = await response.json();
        return data[symbol] ? data[symbol].usd : 'N/A';
    }

    async function fetchDegiroData() {
        // Implement Degiro API logic here
        return {
            investments: [
                { name: 'Banco de Sabadell', ticker: 'SAB.MC', quantity: 100, buyPrice: 9.00, currentPrice: await fetchStockData('SAB.MC') },
                // Add more investments here
            ]
        };
    }

    function calculateGains(investments) {
        let monthlyGains = 0;
        let yearlyGains = 0;

        investments.forEach(investment => {
            const currentPrice = parseFloat(investment.currentPrice);
            const gain = (currentPrice - investment.buyPrice) * investment.quantity;
            monthlyGains += gain; // Placeholder logic
            yearlyGains += gain;  // Placeholder logic
        });

        document.getElementById('monthly-gains').innerText = `Monthly Gains: $${monthlyGains.toFixed(2)}`;
        document.getElementById('yearly-gains').innerText = `Yearly Gains: $${yearlyGains.toFixed(2)}`;
    }

    async function updateData() {
        const stockList = document.getElementById('stocks-list');
        const cryptoList = document.getElementById('cryptos-list');
        const etfList = document.getElementById('etfs-list');

        stockList.innerHTML = await Promise.all(stocksSymbols.map(async symbol => {
            const price = await fetchStockData(symbol);
            return `<li>${symbol}: $${price}</li>`;
        })).then(items => items.join(''));

        cryptoList.innerHTML = await Promise.all(cryptosSymbols.map(async symbol => {
            const price = await fetchCryptoData(symbol);
            return `<li>${symbol.charAt(0).toUpperCase() + symbol.slice(1)}: $${price}</li>`;
        })).then(items => items.join(''));

        const degiroData = await fetchDegiroData();
        calculateGains(degiroData.investments);

        const ctx = document.getElementById('portfolio-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: stocksSymbols.concat(cryptosSymbols).concat(etfsSymbols),
                datasets: [{
                    label: 'Price',
                    data: [
                        ...await Promise.all(stocksSymbols.map(fetchStockData)),
                        ...await Promise.all(cryptosSymbols.map(fetchCryptoData)),
                        ...await Promise.all(etfsSymbols.map(fetchStockData))
                    ].map(price => parseFloat(price))
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `$${tooltipItem.raw}`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateData();
    setInterval(updateData, 60000);
});
