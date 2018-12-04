/**
 * global redisClient
 */
var redis = require('redis')
// const crypto = require('crypto')
const config = require('./config/config')

redisClient = redis.createClient(config.redis)
redisClient.on('error', function (err) {
  console.log('error:' + err)
})

redisClient.get('a', function (err, reply) {
  console.log('123 is ' + reply)
})
console.log('this is end')

// // js date time
// var time = new Date().getTime()
// console.log(time)

// // hash the string
// const secret = 'abcdefg'
// const hash = crypto.createHash('sha256').update('abcdefg').digest('hex')
// console.log(hash)

// // promise way
// promise.promisifyAll(redis.RedisClient.prototype)
// promise.promisifyAll(redis.Multi.prototype)
//
// function getfoo () {
//   return client.getAsync('foo').then(function (res) {
//     console.log(res) // => 'bar'
//   })
// }

// // redis data existing problem
// var existing = false
// console.log('before: ' + existing)
// redisClient.exists('a', function (err, reply) {
//   if (reply) {
//     this.existing = true
//     console.log('reply is: ' + reply)
//   } else {
//     console.log('error is: ' + err)
//   }
// })
// console.log('after: ' + existing)

// // view package vaiables
// console.log(process.env.npm_package_name)
// console.log(process.env.npm_package_version)

// // fetch data back from server
// redisClient.hgetall('usr:bob', function (err, reply) {
//   console.log(reply)
//   console.log('----------')
//   console.dir(reply)
// })
// redisClient.smembers('global:usrList', function (err, reply) {
//   console.log(reply)
//   console.log('----------')
//   console.dir(reply)
// })

redisClient.quit()
