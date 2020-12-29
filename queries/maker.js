const pageResults = require('graph-results-pager');

const ws = require('isomorphic-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws'); 

const { request, gql } = require('graphql-request');

const { graphAPIEndpoints, graphWSEndpoints } = require('./../constants')
const { timestampToBlock } = require('./../utils')

module.exports = {
    async info({block = undefined, timestamp = undefined} = {}) {
        block = block ? block : timestamp ? (await timestampToBlock(timestamp)) : undefined;
        block = block ? `block: { number: ${block} }` : "";

        const result = await request(graphAPIEndpoints.maker,
            gql`{
                    makers(first: 1, ${block}) {
                        ${info.properties.toString()}
                    }
                }`
        );

        return info.callback(result.makers[0]);
    },

    servings({minTimestamp = undefined, maxTimestamp = undefined, minBlock = undefined, maxBlock = undefined} = {}) {
        return pageResults({
            api: graphAPIEndpoints.maker,
            query: {
                entity: 'servings',
                selection: {
                    orderBy: 'block',
                    orderDirection: 'desc',
                    where: {
                        block_gte: minBlock || undefined,
                        block_lte: maxBlock || undefined,
                        timestamp_gte: minTimestamp || undefined,
                        timestamp_lte: maxTimestamp || undefined,
                    }
                },
                properties: servings.properties
            }
        })
        .then(results => servings.callback(results))
        .catch(err => console.log(err));
    },

    async servers({block = undefined, timestamp = undefined} = {}) {
        return pageResults({
            api: graphAPIEndpoints.maker,
            query: {
                entity: 'servers',
                selection: {
                    orderBy: 'sushiServed',
                    orderDirection: 'desc',
                },
                block: block ? { number: block } : timestamp ? { number: await timestampToBlock(timestamp) } : undefined,
                properties: servers.properties
            }
        })
            .then(results => servers.callback(results))
            .catch(err => console.log(err));        
    },

    async pendingServings({block = undefined, timestamp = undefined} = {}) {
        return pageResults({
            api: graphAPIEndpoints.exchange,
            query: {
                entity: 'users',
                selection: {
                    where: {
                        id: `\\"0x280ac711bb99de7c73fb70fb6de29846d5e4207f\\"`,
                    },
                },
                block: block ? { number: block } : timestamp ? { number: await timestampToBlock(timestamp) } : undefined,
                properties: pendingServings.properties
            }
        })
            .then(results => pendingServings.callback(results))
            .catch(err => console.log(err));
    },

    observePendingServings() {
        const query = gql`
            subscription {
                users(first: 1000, where: {id: "0x280ac711bb99de7c73fb70fb6de29846d5e4207f"}) {
                    ${pendingServings.properties.toString()}
                }
        }`;

        const client = new SubscriptionClient(graphWSEndpoints.exchange, { reconnect: true, }, ws,);
        const observable = client.request({ query });

        return {
            subscribe({next, error, complete}) {
                return observable.subscribe({
                    next(results) {
                        next(pendingServings.callback(results.data.users));
                    },
                    error,
                    complete
                });
            }
        };
    },
}

const info = {
    properties: [
        'id',
        'sushiServed'
    ],

    callback(results) {
        return ({
            address: results.id,
            sushiServed: Number(results.sushiServed)
        });
    }
}

const servings = {
    properties: [
        'server { id }',
        'tx',
        'pair',
        'token0',
        'token1',
        'sushiServed',
        'block',
        'timestamp'
    ],

    callback(results) {
        return results.map(({ server, tx, pair, token0, token1, sushiServed, block, timestamp }) => ({
            serverAddress: server.id,
            tx: tx,
            pair: pair,
            token0: token0,
            token1: token1,
            sushiServed: Number(sushiServed),
            block: Number(block),
            timestamp: Number(timestamp * 1000),
            date: new Date(timestamp * 1000)
        }));
    }
};

const servers = {
    properties: [
        'id',
        'sushiServed',
        'servings { tx, block, pair, sushiServed }'
    ],

    callback(results) {
        return results.map(({ id, sushiServed, servings }) => ({
            serverAddress: id,
            sushiServed: Number(sushiServed),
            servings: servings.map(({ tx, block, pair, sushiServed}) => ({
                tx,
                block: Number(block),
                pair,
                sushiServed: Number(sushiServed)
            })),
        }));
    }
};

const pendingServings = {
    properties: [
        'liquidityPositions { id, liquidityTokenBalance, pair { id, totalSupply, reserveUSD, token0 { id, name, symbol }, token1 { id, symbol, name } } }'
    ],

    callback(results) {
        return results[0].liquidityPositions.map(({ liquidityTokenBalance, pair }) => ({
            address: pair.id,
            token0: pair.token0,
            token1: pair.token1,
            valueUSD: (liquidityTokenBalance / pair.totalSupply) * pair.reserveUSD
        })).sort((a, b) => b.valueUSD - a.valueUSD);
    }
};