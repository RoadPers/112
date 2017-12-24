const database = require('./datbase');
loadPromotions = database.loadPromotions;
loadAllItems = database.loadAllItems;

module.exports = function printInventory(inputs) {
    let list = getCount(inputs)
    list = addInfo(list)
    list = addPromotions(list)
    list  = addPlusPrcie(list)
    //print
    let printStr = '***<没钱赚商店>购物清单***\n' +
        getListStr(list) +
        '----------------------\n' +
        getSaveStr(list) +
        '----------------------\n' +
        getSummaryStr(list) +
        '**********************';
    console.log(printStr)
};

function getCount(inputs) {
    //inputs 是 商品ID 的string数组
    let Reg = /(ITEM\d{6})[-](\d*)/
    //把特殊的更改为标准的输入，如“ITEM000001-2”->'ITEM000001' * 2
    for(let i = 0; i < inputs.length; i++) {
        if(Reg.test(inputs[i])){
            let groups = Reg.exec(inputs[i]);
            let id = groups[1];
            let s = parseInt(groups[2]);
            inputs.splice(i, 1);
            for(let n = 0; n<s; n++) {
                inputs.splice(i, 0, id);
            }
        }
    }
    //array -> list
    let set = new Set(inputs);
    let list = [];
    for(let id of set) {
        let count = {
            barcode:String,
            num:0
        }
        let num = 0;
        for(let x of inputs){
            if(x == id) {
                num++;
            }
        }
        count.barcode = id;
        count.num = num;
        list.push(count)
    }
    return list;
}

function addInfo(list) {
    let allItem = loadAllItems();
    for(let item of list) {
        for(let thing of allItem) {
            if(thing.barcode == item.barcode) {
                item.name = thing.name;
                item.unit = thing.unit;
                item.price = thing.price;
            }
        }
    }
    return list
}

function addPromotions(list) {
    let promotions = loadPromotions();
    for(var item of list) {
        for(let i = 0; i < promotions.length; i++) {
            for(let id of promotions[i].barcodes) {
                if(item.barcode == id) {
                    item.saleInfo = promotions[i].type;
                }
            }
        }
    }
    return list
}

function addPlusPrcie(list) {
    for(let item of list) {
        item.plusprice = item.price * item.num
        item.save = 0
        if(item.saleInfo == "BUY_TWO_GET_ONE_FREE") {
            item.plusprice -= item.price
            item.save += item.price
        }
    }
    return list
}

function getListStr(list) {
    let str = ''
    for(let item of list) {
        str += `名称：${item.name}，数量：${item.num}${item.unit}，单价：${item.price.toFixed(2)}(元)，小计：${item.plusprice.toFixed(2)}(元)\n`
    }
    return str
}

function getSaveStr(list) {
    let str = ''
    for(let item of list) {
        if(item.saleInfo == "BUY_TWO_GET_ONE_FREE") {
            str += `名称：${item.name}，数量：1${item.unit}\n`
        }
    }
    return '挥泪赠送商品：\n' + str;
}

function getSummaryStr(list) {
    let sum = 0
    let save = 0
    for(var item of list) {
        sum += item.plusprice
        save += item.save
    }
    return '总计：'+ sum.toFixed(2) +'(元)\n' + '节省：'+ save.toFixed(2) +'(元)\n'


}


