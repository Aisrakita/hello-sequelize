const Sequelize = require('sequelize');
const config = require('./config');

// sequelize实例，用它来建立模型
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
})

// 定义model，modelName, attribute, options
const Pet = sequelize.define('pet', {
    id: {
        type: Sequelize.STRING(50),
        primaryKey: true
    },
    name: Sequelize.STRING(100),
    gender: Sequelize.BOOLEAN,
    birth: Sequelize.STRING,
    createdAt: Sequelize.BIGINT,
    updatedAt: Sequelize.BIGINT,
    version: Sequelize.BIGINT
}, {
    timestamps: false
});

const now = Date.now();

// 读库操作是异步完成的，这里使用回调函数的方式
Pet.create({
    id: 'g-' + now,
    name: 'Gaffey',
    gender: false,
    birth: '2020-01-01',
    createdAt: now,
    updatedAt: now,
    version: 0,
}).then((p) => {
    console.log('created.' + JSON.stringify(p));
}).catch((err) => {
    console.log('failed:' + err);
});

// 这里使用同步的写法，await
(async () => {
    const dog = await Pet.create({
        id: 'd-' + now,
        name: 'Odie',
        gender: false,
        birth: '2008-08-08',
        createdAt: now,
        updatedAt: now,
        version: 0
    });
    console.log('created: ' + JSON.stringify(dog));
})();

async function createPet(id,name,gender,birth) {
    const p = await Pet.create({
        id: id + now,
        name: name,
        gender: gender,
        birth: birth,
        createdAt: now,
        updatedAt: now,
        version: 0
    })
    console.log('created:' + JSON.stringify(p));
}

createPet('c-','bubu',true,'2020-08-08');

// select * from pets where name = 'Gaffey';
(async () => {
    var pets = await Pet.findAll({
        where: {
            name: 'Gaffey'
        }
    });
    console.log(`find ${pets.length} pets:`);
    for (let p of pets) {
        console.log(JSON.stringify(p));
    }
})();

// (async () => {
//     var p = await queryFromSomewhere();
//     p.gender = true;
//     p.updatedAt = Date.now();
//     p.version++;
//     await p.save();
// })();

// (async () => {
//     var p = await queryFromSomewhere();
//     await p.destroy();
// })();
