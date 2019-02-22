/**
 * service operations
 * status: passed
 */
// redis client
const redis = require('redis')
const bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const config = require('../config/config')

const crypto = require('crypto')
const logsys = require('../utils/log')

// root page(unused)
exports.index = function (req, res) {
  res.send('<h3 align="center">api server</h3>')
  logsys.log('root page visited')
}

// 404 page
exports.notfound = function (req, res) {
  res.status(404).send('<h3 align="center">Seems you\'ve found something unreal on this planet.</h3>')
  logsys.warn('404 warning omitted')
}

// init redis data
exports.init = async function () {
  var redisClient = redis.createClient(config.redis)
  // test redis service availability
  redisClient.on('error', function (err) {
    logsys.error('Error: ' + err)
  })
  await redisClient.onAsync('connect').then(function () {
    logsys.log('connected to redis successfully.')
  })
  logsys.seg('--------------------REDIS INITIALIZATION START--------------------')

  // set redis global variables
  await redisClient.msetAsync(
    'global:usrNum', config.global.usrNum,
    'global:txNum', config.global.txNum,
    'global:poolNum', config.global.poolNum,
    'global:blockHeight', config.global.blockHeight,
    'global:nonce', config.global.nonce,
    'global:powerUnit', config.global.powerUnit).then(function (reply) {
    logsys.action('redis global strings status: ' + reply)
  }).catch(function (err) {
    logsys.error('redis global strings error: ' + err)
  })
  await redisClient.saddAsync('global:usrList', 'default').then(function (reply) {
    logsys.action('redis global usrList set status: ' + reply)
  }).catch(function (err) {
    logsys.error('redis global usrList set error: ' + err)
  })
  await redisClient.saddAsync('global:txList', 'default').then(function (reply) {
    logsys.action('redis global txList set status: ' + reply)
  }).catch(function (err) {
    logsys.error('redis global txList set error: ' + err)
  })
  await redisClient.saddAsync('global:poolList', 'default').then(function (reply) {
    logsys.action('redis global poolList set status: ' + reply)
  }).catch(function (err) {
    logsys.error('redis global poolList set error: ' + err)
  })
  await redisClient.saddAsync('global:finishList', 'default').then(function (reply) {
    logsys.action('redis global finishList set status: ' + reply)
  }).catch(function (err) {
    logsys.error('redis global finishList set error: ' + err)
  })
  logsys.seg('---------------------REDIS INITIALIZATION END---------------------')
  await redisClient.quitAsync()
}

// show global variables
exports.show = async function (req, res) {
  var redisClient = redis.createClient(config.redis)
  var out = {
    'msg': 'failed'
  }
  if (req.body.msg === 'showData') {
    await redisClient.getAsync('global:usrNum').then(function (reply) {
      out['usrNum'] = reply
    }).catch(function (err) {
      logsys.error('get global usrNum error: ' + err)
    })
    await redisClient.getAsync('global:poolNum').then(function (reply) {
      out['poolNum'] = reply
    }).catch(function (err) {
      logsys.error('get global poolNum error: ' + err)
    })
    await redisClient.getAsync('global:txNum').then(function (reply) {
      out['txNum'] = reply
    }).catch(function (err) {
      logsys.error('get global txNum error: ' + err)
    })
    out['usrList'] = []
    await redisClient.smembersAsync('global:usrList').then(function (replies) {
      replies.forEach(async function (reply) {
        if (reply !== 'default') {
          out.usrList.push(reply)
        }
      })
    }).catch(function (err) {
      logsys.error('get global usr list error: ' + err)
    })
    out['poolList'] = []
    await redisClient.smembersAsync('global:poolList').then(function (replies) {
      replies.forEach(async function (reply) {
        if (reply !== 'default') {
          out.poolList.push(reply)
        }
      })
    }).catch(function (err) {
      logsys.error('get global pool list error: ' + err)
    })
    out['finishList'] = []
    await redisClient.smembersAsync('global:finishList').then(function (replies) {
      replies.forEach(async function (reply) {
        if (reply !== 'default') {
          out.finishList.push(reply)
        }
      })
    }).catch(function (err) {
      logsys.error('get global finish list error: ' + err)
    })
    out['txList'] = []
    await redisClient.smembersAsync('global:txList').then(function (replies) {
      replies.forEach(async function (reply) {
        if (reply !== 'default') {
          out.txList.push(reply)
        }
      })
    }).catch(function (err) {
      logsys.error('get global tx list error: ' + err)
    })
    await redisClient.getAsync('global:blockHeight').then(function (reply) {
      out['blockHeight'] = reply
    }).catch(function (err) {
      logsys.error('get global blockHeight error: ' + err)
    })
    await redisClient.getAsync('global:nonce').then(function (reply) {
      out['nonce'] = reply
    }).catch(function (err) {
      logsys.error('get global nonce error: ' + err)
    })
    await redisClient.getAsync('global:powerUnit').then(function (reply) {
      out['powerUnit'] = reply
    }).catch(function (err) {
      logsys.error('get global powerUnit error: ' + err)
    })
    delete out['msg']
    logsys.log('global data fetched.')
  }
  if (out.msg === 'failed') {
    logsys.warn('failed to fetch global data.')
  }
  await redisClient.quitAsync()
  res.send(out)
}

// add alice and bob
exports.defaultUsr = async function () {
  var redisClient = redis.createClient(config.redis)
  var alice = {
    account: 'alice',
    password: '123456'
  }
  var bob = {
    account: 'bob',
    password: '123456'
  }
  await signup(redisClient, alice)
  await signup(redisClient, bob)
  await redisClient.quitAsync()
}

exports.clean = function () {
  // TODO close server, clean resources used and operate data persistance
}

exports.flushDb = async function () {
  // flush all
  // TODO check the existing data and persist them
  await redisClient.flushallAsync().then(function (reply) {
    logsys.action('redis flush status: ' + reply)
  })
}

// // for test
// exports.test = function (req, res) {
//   res.send(req.hostname + ' from ' + req.ip)
// }

async function signup (redisClient, usr) {
  var address = crypto.createHash('sha256').update(usr.account + usr.password).digest('hex')
  var password = crypto.createHash('sha256').update(usr.password).digest('hex')
  // write usr
  await redisClient.hmsetAsync('usr:' + usr.account, [
    'account', usr.account,
    'password', password,
    'balance', 100,
    'address', address,
    'deliveryNum', 0,
    'purchaseNum', 0
  ]).then(function (reply) {
    // console.log('usr main list status: ' + reply)
  }).catch(function (err) {
    logsys.error('usr main list error: ' + err)
  })
  await redisClient.saddAsync('usr:' + usr.account + ':delivery', 'default').then(function (reply) {
    // console.log('usr delivery list status: ' + reply)
  }).catch(function (err) {
    logsys.error('usr delivery list error: ' + err)
  })
  await redisClient.saddAsync('usr:' + usr.account + ':purchase', 'default').then(function (reply) {
    // console.log('usr purchase list status: ' + reply)
  }).catch(function (err) {
    logsys.error('usr purchase list error: ' + err)
  })
  // set index from address to account
  await redisClient.setAsync('addr:' + address, usr.account).then(function (reply) {
    // console.log('address-account k-v status: ' + reply)
  }).catch(function (err) {
    logsys.error('address-account k-v error: ' + err)
  })
  // change global
  await redisClient.incrAsync('global:usrNum').then(function (reply) {
    // console.log('usr number increment status: ' + reply)
  }).catch(function (err) {
    logsys.error('usr number increment error: ' + err)
  })
  await redisClient.saddAsync('global:usrList', usr.account).then(function (reply) {
    // console.log('usr added to global list status: ' + reply)
  }).catch(function (err) {
    logsys.error('usr added to global list error: ' + err)
  })
  logsys.action('default usr: ' + usr.account + ' write in.')
}