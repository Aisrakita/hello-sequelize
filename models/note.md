#### 每个Model必须遵守以下规范  
1. 统一主键，名称必须是`id`，类型必须是`STRING(50)` ;
2. 主键可以自己指定，也可以由框架自动生成 ；
3. 所有字段默认为`NOT NULL`,除非显示指定 ；
4. 统一timestamp机制，每个Model必须有`createdAt`、`updatedAt`和`version`，分别记录创建时间，修改时间和版本号。其中`createdAt`和`updatedAt`以`BIGINT`存储时间戳，无需处理时区，排序方便。`version`每次更改自增。

--- 
不要用Sequelize的API，而是通过`db.js`间接定义Model。强迫所有Model遵守同一个规范。