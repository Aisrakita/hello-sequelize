const Sequelize = require('sequelize');
const config = require('./config');
const uuid = require('node-uuid');

console.log('init sequelize...');

function generateId() {
    return uuid.v1();
}

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const ID_TYPE = Sequelize.STRING(50);

function defineModel(name, attributes) {
    const attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            // 所有字段默认为`NOT NULL`,除非显示指定
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            }

        }
    }

    // 统一主键，名称必须是`id`，类型必须是`STRING(50)` ;
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true
    };

    // 每个Model必须有`createdAt`、`updatedAt`和`version`，分别记录创建时间，修改时间和版本号。
    attrs.createdAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.updatedAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.version = {
        type: Sequelize.BIGINT,
        allowNull: false
    };

    console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, (k, v) => {
        if (k === 'type') {
            for (let key in Sequelize) {
                if (key === 'ABSTRACT' || key === 'NUMBER') {
                    continue;
                }
                let dbType = Sequelize[key];
                if (typeof dbType === 'function') {
                    if (v instanceof dbType) {
                        if (v._length) {
                            return `${dbType.key}(${dbType._length})`
                        } else {
                            return dbType.key;
                        }
                    }
                    if (v === dbType) {
                        return dbType.key;
                    }
                }
            }
        }
        return v;
    }, '  '));

    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: (obj) => {
                let now = Date.now();
                if (obj.isNewRecord) {
                    console.log('will create entity...' + obj);
                    if (!obj.id) {
                        obj.id = generateId();
                    }
                    obj.createdAt = now;
                    obj.updatedAt = now;
                    obj.version = 0;
                } else {
                    console.log('will update entity...');
                    obj.updatedAt = now;
                    obj.version++;
                }
            }
        }
    });
}

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];

const exp = {
    /**
     * 不要用Sequelize的API，而是通过`db.js`间接定义Model。强迫所有Model遵守同一个规范。
     * @param {string} name 表名
     * @param {*} attributes 表参数
     */
    defineModel: defineModel,
    sync: () => {
        if (process.env.NODE_ENV !== 'production') {
            sequelize.sync({ force: true });
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    },
    ID: ID_TYPE,
    generateId: generateId,
}

for (let type of TYPES) {
    exp[type] = Sequelize[type];
}

module.exports = exp;