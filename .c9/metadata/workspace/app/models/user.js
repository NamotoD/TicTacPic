{"filter":false,"title":"user.js","tooltip":"/app/models/user.js","undoManager":{"mark":15,"position":15,"stack":[[{"start":{"row":0,"column":0},"end":{"row":47,"column":0},"action":"insert","lines":["// app/models/user.js","// load the things we need","var mongoose = require('mongoose');","var bcrypt   = require('bcrypt-nodejs');","","// define the schema for our user model","var userSchema = mongoose.Schema({","","    local            : {","        email        : String,","        password     : String,","    },","    facebook         : {","        id           : String,","        token        : String,","        email        : String,","        name         : String","    },","    twitter          : {","        id           : String,","        token        : String,","        displayName  : String,","        username     : String","    },","    google           : {","        id           : String,","        token        : String,","        email        : String,","        name         : String","    }","","});","","// methods ======================","// generating a hash","userSchema.methods.generateHash = function(password) {","    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);","};","","// checking if password is valid","userSchema.methods.validPassword = function(password) {","    return bcrypt.compareSync(password, this.local.password);","};","","// create the model for users and expose it to our app","module.exports = mongoose.model('User', userSchema);","",""],"id":1}],[{"start":{"row":8,"column":24},"end":{"row":9,"column":30},"action":"insert","lines":["","        email        : String,"],"id":2}],[{"start":{"row":9,"column":8},"end":{"row":9,"column":13},"action":"remove","lines":["email"],"id":3},{"start":{"row":9,"column":8},"end":{"row":9,"column":16},"action":"insert","lines":["userName"]}],[{"start":{"row":9,"column":20},"end":{"row":9,"column":24},"action":"remove","lines":["    "],"id":4}],[{"start":{"row":9,"column":20},"end":{"row":9,"column":21},"action":"insert","lines":[" "],"id":5}],[{"start":{"row":11,"column":30},"end":{"row":12,"column":29},"action":"insert","lines":["","        password     : String"],"id":6}],[{"start":{"row":12,"column":8},"end":{"row":12,"column":16},"action":"remove","lines":["password"],"id":7},{"start":{"row":12,"column":8},"end":{"row":12,"column":12},"action":"insert","lines":["size"]}],[{"start":{"row":12,"column":17},"end":{"row":12,"column":20},"action":"insert","lines":["   "],"id":8}],[{"start":{"row":12,"column":20},"end":{"row":12,"column":21},"action":"insert","lines":[" "],"id":9}],[{"start":{"row":12,"column":23},"end":{"row":12,"column":29},"action":"remove","lines":["String"],"id":10},{"start":{"row":12,"column":23},"end":{"row":12,"column":24},"action":"insert","lines":["N"]}],[{"start":{"row":12,"column":24},"end":{"row":12,"column":25},"action":"insert","lines":["u"],"id":11}],[{"start":{"row":12,"column":25},"end":{"row":12,"column":26},"action":"insert","lines":["m"],"id":12}],[{"start":{"row":12,"column":26},"end":{"row":12,"column":27},"action":"insert","lines":["b"],"id":13}],[{"start":{"row":12,"column":27},"end":{"row":12,"column":28},"action":"insert","lines":["e"],"id":14}],[{"start":{"row":12,"column":28},"end":{"row":12,"column":29},"action":"insert","lines":["r"],"id":15}],[{"start":{"row":12,"column":23},"end":{"row":12,"column":29},"action":"remove","lines":["Number"],"id":16},{"start":{"row":12,"column":23},"end":{"row":12,"column":29},"action":"insert","lines":["String"]}]]},"ace":{"folds":[],"scrolltop":480,"scrollleft":0,"selection":{"start":{"row":7,"column":0},"end":{"row":7,"column":0},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":33,"state":"start","mode":"ace/mode/javascript"}},"timestamp":1485571426000,"hash":"db2a2587303163205ff60fd73c59f00f7353520c"}