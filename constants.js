module.exports = {
    graphAPIEndpoints: {
        masterchef: 'https://api.thegraph.com/subgraphs/name/sushiswap/master-chef',
        bar: 'https://api.thegraph.com/subgraphs/name/sushiswap/sushi-bar',
        timelock: 'https://api.thegraph.com/subgraphs/name/sushiswap/sushi-timelock',
        maker: 'https://api.thegraph.com/subgraphs/name/sushiswap/sushi-maker',
        exchange: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
        exchange_v1: 'https://api.thegraph.com/subgraphs/name/jiro-ono/sushiswap-v1-exchange',
        blocklytics: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
        lockup: 'https://api.thegraph.com/subgraphs/name/matthewlilley/lockup',
    },

    graphWSEndpoints: {
        bar: 'wss://api.thegraph.com/subgraphs/name/sushiswap/sushi-bar',
        exchange: 'wss://api.thegraph.com/subgraphs/name/sushiswap/exchange',
        blocklytics: 'wss://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'
    },

    barAddress: "0x8798249c2e607446efb7ad49ec89dd1865ff4272",
    makerAddress: "0x95c69c3220b31b843f1cf20bee5c53fcde7fc12e",
    chefAddress: "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd",
    sushiAddress: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
}