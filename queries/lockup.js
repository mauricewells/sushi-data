const pageResults = require('graph-results-pager');

const ws = require('isomorphic-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws'); 

const { request, gql } = require('graphql-request');

const { graphAPIEndpoints, graphWSEndpoints } = require('./../constants')
const { timestampToBlock } = require('./../utils')

module.exports = {
    async users({block = undefined, timestamp = undefined, user_address = undefined} = {}) {
        return pageResults({
            api: graphAPIEndpoints.lockup,
            query: {
                entity: 'users',
                selection: {
                    where: {
                        address: `\\"${user_address.toLowerCase()}\\"`
                    },
                },
                block: block ? { number: block } : timestamp ? { number: await timestampToBlock(timestamp) } : undefined,
                properties: users.properties
            }
        })
            .then(results => users.callback(results))
            .catch(err => console.log(err));
    }
}

const users = {
    properties: [
        'id',
        'address',
        'amount',
        'rewardDebt',
        'pool { id, balance, accSushiPerShare }',
        'sushiAtLockup',
        'sushiHarvestedSinceLockup',
        'sushiLocked',
    ],

    callback(results) {
        return results.map(entry => ({
            id: entry.id,
            address: entry.address,
            amount: Number(entry.amount),
            rewardDebt: Number(entry.rewardDebt),
            pool: {
                id: entry.pool.id,
                balance: Number(entry.pool.balance),
                accSushiPerShare: Number(entry.pool.accSushiPerShare)
            },
            sushiAtLockup: Number(entry.sushiAtLockup),
            sushiHarvestedSinceLockup: Number(entry.sushiHarvestedSinceLockup),
            sushiLocked: Number(entry.sushiLocked),
        }));
    }
};
