const fs = require('fs')
const path = require('path')
const rootPath = path.join(__dirname, '..')
const arango = require(path.join(rootPath, 'arango'))
const {
  importAllDocs
} = require(path.join(__dirname, 'migrations'))
require('colors')

arango.events.on('connected', () => {
  console.log('Arango is connected!'.green)
})

function readFiles(dir) {
  let files = fs.readdirSync(dir)
  for (var i = 0; i < files.length; i++) {
    require(dir + '/' + files[i])
  }
}

async function main() {
  // Initialize models
  // Note: This can be done before or after the connection
  readFiles(path.join(__dirname, 'models'))

  // // Create connection
  await arango.connect({
    name: 'demo'
  })

  // // Import migration docs
  await importAllDocs()

  const User = arango.model('User')
  let user = await User.findById('rob', {
    noDefaults: false
  })
  console.log('#user', user)
}

async function main_update_user() {
  require('./models/User')

  // Create connection
  await arango.connect({
    name: 'demo'
  })

  const User = arango.model('User')
  User.updateById('rob', {
    desc: "This is a test"
  })
}

async function main_update_users() {
  require('./models/User')

  // Create connection
  await arango.connect({
    name: 'demo'
  })

  const User = arango.model('User')

  User.update({
    _key: 'rob',
    // role: 'admin'
    $or: [{
      role: 'admin'
    }]
  }, {
    junk: 123,
    desc: 'Test #8',
    stats: {
      friends: {
        $inc: -1
      },
      // followers: {
      //   $inc: 1
      // },
      followers: '-=2'
      // friends: 'EXPR( stats.friends + 1 )'
    }
  }, {
    printAQL: true
  })
  /*
  // console.log(qb.filter(qb.eq('_key', 'rob')).toAQL())
  console.log(qb.filter(qb.eq('a', qb.str('b'))).toAQL())
  User.update([qb.eq('_key', 'rob').toAQL()], {
    desc: "desc #5 update users"
  })
  */

  // User.update(['_key == "rob"'], {
  //   desc: "desc #5 update users"
  // })

  // User.update({
  //   _key: 'rob',
  //   $or: {}
  // })

  /*
  FOR doc in {}
    FILTER doc._key == 'rob'

  */
}

async function main_delete_users() {
  require('./models/User')

  // Create connection
  await arango.connect({
    name: 'demo'
  })

  const User = arango.model('User')
  User.deleteOne({
    _key: 'jane'
  })
}

async function main_find_users() {
  require('./models/User')

  // Create connection
  await arango.connect({
    name: 'demo'
  })

  const User = arango.model('User')
  let users = await User.find({
    _key: 'jane'
  }, {
    printAQL: true
  })

  console.log(users)
}

async function main_find_user() {
  require('./models/User')

  // Create connection
  await arango.connect({
    name: 'demo'
  })

  const User = arango.model('User')
  // let user = await User.findById('jane', {
  //   printAQL: true
  // })
  const user = await User.find({
    firstName: 'Chase',
    role: {
      $ne: 'admin'
    },
    stats: {
      friends: null
    }
  }, {
    computed: true,
    printAQL: true,
    limit: 2
  })

  console.log(user)
}

async function main_new_user() {
  require('./models/User')

  // Create connection
  await arango.connect({
    name: 'demo'
  })

  const User = arango.model('User')

  let user = new User({
    firstName: 'Lori',
    lastName: "Taylor",
    devices: [{
      _key: 'chrome',
      token: 'abc'
    }]
  })
  await user.save()
}

main()
// main_update_user()
// main_update_users()
// main_delete_users()
// main_find_users()
// main_find_user()
// main_new_user()