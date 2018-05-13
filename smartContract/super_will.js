"use strict";

var WillItem = function (text) {
    console.log(text)
    if (text) {
        text = text.replace(/\\/g, "");
        var obj = JSON.parse(text);
        this.username = obj.username;
        this.userphone = obj.userphone;
        this.useraddress = obj.useraddress;
        this.usercontext = obj.usercontext;
        this.createdate = new Date();
    } else {
        this.from = "";
        this.username = "";
        this.userphone = "";
        this.useraddress = "";
        this.usercontext = "";
        this.createdate = new Date();
    }
};

WillItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var WillContract = function () {
    //遗言字典
    LocalContractStorage.defineMapProperty(this, "lastWrds");
    //index 到 字典key索引
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    //字典size
    LocalContractStorage.defineProperty(this, "size");
};

WillContract.prototype = {
    init: function () {
        this.size = 0;
    },

    // 保存
    save: function (value) {
        var from = Blockchain.transaction.from;
        var willArray = this.lastWrds.get(from);
        //生成遗言对象
        var willItem = new WillItem(value);
        //如果之前没有添加过遗言，初始化数组
        if (typeof(willArray) == "undefined" || willArray == null) {
            willArray = [];
            var index = this.size;
            this.arrayMap.set(index, from);
            this.size += 1;
        }

        //添加到数组
        willArray.push(willItem);
        //存储到发布遗言的链中
        // console.log(willArray);
        // console.log(from)
        this.lastWrds.set(from, willArray);
    },

    // 查询自己的遗言
    get: function () {
        var from = Blockchain.transaction.from;
        if (from === "") {
            throw new Error("empty from")
        }

        // console.log(this.lastWrds.get(from));
        // console.log(from)
        return this.lastWrds.get(from);
    },

    //管理员分页查询
    forEach: function (limit, offset) {
        var master = 'n1MWYwsAJQDBjGL7kY5fwkfPcoJUb2HoD58';
        var from = Blockchain.transaction.from;
        //如果不是管理员,拒绝×
        // 来自地址
        if (master != from) {
            throw new Error("您没有权限读取");
        }

        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = [];
        for (var i = offset; i < number; i++) {
            var from = this.arrayMap.get(i);
            var object = this.lastWrds.get(from);
            var temp = {
                index: i,
                key: from,
                value: object
            }
            result.push(temp);
        }
        return JSON.stringify(result);
    }

};
module.exports = WillContract;