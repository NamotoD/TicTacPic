{"filter":false,"title":"passport.js","tooltip":"/config/passport.js","undoManager":{"mark":100,"position":100,"stack":[[{"start":{"row":46,"column":19},"end":{"row":46,"column":20},"action":"insert","lines":["e"],"id":209}],[{"start":{"row":46,"column":20},"end":{"row":46,"column":21},"action":"insert","lines":[" "],"id":210}],[{"start":{"row":46,"column":21},"end":{"row":46,"column":22},"action":"insert","lines":["="],"id":211}],[{"start":{"row":46,"column":22},"end":{"row":46,"column":23},"action":"insert","lines":[" "],"id":212}],[{"start":{"row":46,"column":23},"end":{"row":46,"column":24},"action":"insert","lines":["f"],"id":213}],[{"start":{"row":46,"column":24},"end":{"row":46,"column":25},"action":"insert","lines":["a"],"id":214}],[{"start":{"row":46,"column":25},"end":{"row":46,"column":26},"action":"insert","lines":["l"],"id":215}],[{"start":{"row":46,"column":26},"end":{"row":46,"column":27},"action":"insert","lines":["s"],"id":216}],[{"start":{"row":46,"column":27},"end":{"row":46,"column":28},"action":"insert","lines":["e"],"id":217}],[{"start":{"row":46,"column":28},"end":{"row":46,"column":29},"action":"insert","lines":[";"],"id":218}],[{"start":{"row":57,"column":20},"end":{"row":72,"column":19},"action":"remove","lines":["","","                // if there is no user with that email","                // create the user","                var newUser            = new User();","","                // set the user's local credentials","                newUser.local.email    = email;","                newUser.local.password = newUser.generateHash(password);","","                // save the user","                newUser.save(function(err) {","                    if (err)","                        throw err;","                    return done(null, newUser);","                });"],"id":219}],[{"start":{"row":57,"column":20},"end":{"row":58,"column":0},"action":"insert","lines":["",""],"id":220},{"start":{"row":58,"column":0},"end":{"row":58,"column":16},"action":"insert","lines":["                "]}],[{"start":{"row":58,"column":16},"end":{"row":58,"column":24},"action":"insert","lines":["username"],"id":221}],[{"start":{"row":58,"column":24},"end":{"row":58,"column":25},"action":"insert","lines":[" "],"id":222}],[{"start":{"row":58,"column":25},"end":{"row":58,"column":26},"action":"insert","lines":["="],"id":223}],[{"start":{"row":58,"column":26},"end":{"row":58,"column":27},"action":"insert","lines":[" "],"id":224}],[{"start":{"row":58,"column":27},"end":{"row":58,"column":28},"action":"insert","lines":["t"],"id":225}],[{"start":{"row":58,"column":28},"end":{"row":58,"column":29},"action":"insert","lines":["r"],"id":226}],[{"start":{"row":58,"column":29},"end":{"row":58,"column":30},"action":"insert","lines":["u"],"id":227}],[{"start":{"row":58,"column":30},"end":{"row":58,"column":31},"action":"insert","lines":["e"],"id":228}],[{"start":{"row":58,"column":31},"end":{"row":58,"column":32},"action":"insert","lines":[";"],"id":229}],[{"start":{"row":46,"column":12},"end":{"row":46,"column":20},"action":"remove","lines":["username"],"id":230},{"start":{"row":46,"column":12},"end":{"row":46,"column":13},"action":"insert","lines":["n"]}],[{"start":{"row":46,"column":13},"end":{"row":46,"column":14},"action":"insert","lines":["a"],"id":231}],[{"start":{"row":46,"column":14},"end":{"row":46,"column":15},"action":"insert","lines":["m"],"id":232}],[{"start":{"row":46,"column":15},"end":{"row":46,"column":16},"action":"insert","lines":["e"],"id":233}],[{"start":{"row":46,"column":16},"end":{"row":46,"column":17},"action":"insert","lines":["t"],"id":234},{"start":{"row":46,"column":17},"end":{"row":46,"column":18},"action":"insert","lines":["a"]}],[{"start":{"row":46,"column":18},"end":{"row":46,"column":19},"action":"insert","lines":["k"],"id":235}],[{"start":{"row":46,"column":19},"end":{"row":46,"column":20},"action":"insert","lines":["e"],"id":236}],[{"start":{"row":46,"column":20},"end":{"row":46,"column":21},"action":"insert","lines":["n"],"id":237}],[{"start":{"row":58,"column":16},"end":{"row":58,"column":32},"action":"remove","lines":["username = true;"],"id":238},{"start":{"row":58,"column":16},"end":{"row":58,"column":34},"action":"insert","lines":["nametaken = false;"]}],[{"start":{"row":46,"column":24},"end":{"row":46,"column":29},"action":"remove","lines":["false"],"id":239},{"start":{"row":46,"column":24},"end":{"row":46,"column":25},"action":"insert","lines":["t"]}],[{"start":{"row":46,"column":25},"end":{"row":46,"column":26},"action":"insert","lines":["r"],"id":240}],[{"start":{"row":46,"column":26},"end":{"row":46,"column":27},"action":"insert","lines":["u"],"id":241}],[{"start":{"row":46,"column":27},"end":{"row":46,"column":28},"action":"insert","lines":["e"],"id":242}],[{"start":{"row":46,"column":16},"end":{"row":46,"column":21},"action":"remove","lines":["taken"],"id":243},{"start":{"row":46,"column":16},"end":{"row":46,"column":17},"action":"insert","lines":["a"]}],[{"start":{"row":46,"column":17},"end":{"row":46,"column":18},"action":"insert","lines":["v"],"id":244}],[{"start":{"row":46,"column":18},"end":{"row":46,"column":19},"action":"insert","lines":["a"],"id":245}],[{"start":{"row":46,"column":19},"end":{"row":46,"column":20},"action":"insert","lines":["i"],"id":246}],[{"start":{"row":46,"column":20},"end":{"row":46,"column":21},"action":"insert","lines":["l"],"id":247}],[{"start":{"row":46,"column":21},"end":{"row":46,"column":22},"action":"insert","lines":["a"],"id":248}],[{"start":{"row":46,"column":22},"end":{"row":46,"column":23},"action":"insert","lines":["b"],"id":249}],[{"start":{"row":46,"column":23},"end":{"row":46,"column":24},"action":"insert","lines":["l"],"id":250}],[{"start":{"row":46,"column":24},"end":{"row":46,"column":25},"action":"insert","lines":["e"],"id":251}],[{"start":{"row":58,"column":16},"end":{"row":58,"column":25},"action":"remove","lines":["nametaken"],"id":252},{"start":{"row":58,"column":16},"end":{"row":58,"column":29},"action":"insert","lines":["nameavailable"]}],[{"start":{"row":57,"column":20},"end":{"row":58,"column":38},"action":"remove","lines":["","                nameavailable = false;"],"id":253}],[{"start":{"row":55,"column":23},"end":{"row":56,"column":38},"action":"insert","lines":["","                nameavailable = false;"],"id":254}],[{"start":{"row":58,"column":13},"end":{"row":59,"column":13},"action":"remove","lines":[" else {","            }"],"id":255}],[{"start":{"row":69,"column":20},"end":{"row":70,"column":0},"action":"insert","lines":["",""],"id":256},{"start":{"row":70,"column":0},"end":{"row":70,"column":16},"action":"insert","lines":["                "]}],[{"start":{"row":70,"column":16},"end":{"row":70,"column":17},"action":"insert","lines":["i"],"id":257}],[{"start":{"row":70,"column":17},"end":{"row":70,"column":18},"action":"insert","lines":["f"],"id":258}],[{"start":{"row":70,"column":18},"end":{"row":70,"column":19},"action":"insert","lines":[" "],"id":259}],[{"start":{"row":70,"column":19},"end":{"row":70,"column":21},"action":"insert","lines":["()"],"id":260}],[{"start":{"row":70,"column":20},"end":{"row":70,"column":33},"action":"insert","lines":["nameavailable"],"id":261}],[{"start":{"row":71,"column":0},"end":{"row":71,"column":4},"action":"insert","lines":["    "],"id":262},{"start":{"row":72,"column":0},"end":{"row":72,"column":4},"action":"insert","lines":["    "]},{"start":{"row":73,"column":0},"end":{"row":73,"column":4},"action":"insert","lines":["    "]},{"start":{"row":74,"column":0},"end":{"row":74,"column":4},"action":"insert","lines":["    "]},{"start":{"row":75,"column":0},"end":{"row":75,"column":4},"action":"insert","lines":["    "]},{"start":{"row":76,"column":0},"end":{"row":76,"column":4},"action":"insert","lines":["    "]},{"start":{"row":77,"column":0},"end":{"row":77,"column":4},"action":"insert","lines":["    "]},{"start":{"row":78,"column":0},"end":{"row":78,"column":4},"action":"insert","lines":["    "]},{"start":{"row":79,"column":0},"end":{"row":79,"column":4},"action":"insert","lines":["    "]},{"start":{"row":80,"column":0},"end":{"row":80,"column":4},"action":"insert","lines":["    "]},{"start":{"row":81,"column":0},"end":{"row":81,"column":4},"action":"insert","lines":["    "]},{"start":{"row":82,"column":0},"end":{"row":82,"column":4},"action":"insert","lines":["    "]},{"start":{"row":83,"column":0},"end":{"row":83,"column":4},"action":"insert","lines":["    "]},{"start":{"row":84,"column":0},"end":{"row":84,"column":4},"action":"insert","lines":["    "]},{"start":{"row":85,"column":0},"end":{"row":85,"column":4},"action":"insert","lines":["    "]},{"start":{"row":86,"column":0},"end":{"row":86,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":70,"column":34},"end":{"row":70,"column":35},"action":"insert","lines":[" "],"id":263}],[{"start":{"row":70,"column":35},"end":{"row":70,"column":36},"action":"insert","lines":["{"],"id":264}],[{"start":{"row":86,"column":23},"end":{"row":87,"column":0},"action":"insert","lines":["",""],"id":265},{"start":{"row":87,"column":0},"end":{"row":87,"column":20},"action":"insert","lines":["                    "]}],[{"start":{"row":87,"column":16},"end":{"row":87,"column":20},"action":"remove","lines":["    "],"id":266}],[{"start":{"row":87,"column":16},"end":{"row":87,"column":17},"action":"insert","lines":["}"],"id":267}],[{"start":{"row":57,"column":74},"end":{"row":57,"column":79},"action":"remove","lines":["email"],"id":268},{"start":{"row":57,"column":74},"end":{"row":57,"column":75},"action":"insert","lines":["u"]}],[{"start":{"row":57,"column":75},"end":{"row":57,"column":76},"action":"insert","lines":["s"],"id":269}],[{"start":{"row":57,"column":76},"end":{"row":57,"column":77},"action":"insert","lines":["e"],"id":270}],[{"start":{"row":57,"column":77},"end":{"row":57,"column":78},"action":"insert","lines":["r"],"id":271}],[{"start":{"row":57,"column":78},"end":{"row":57,"column":79},"action":"insert","lines":[" "],"id":272}],[{"start":{"row":57,"column":79},"end":{"row":57,"column":80},"action":"insert","lines":["n"],"id":273}],[{"start":{"row":57,"column":80},"end":{"row":57,"column":81},"action":"insert","lines":["a"],"id":274}],[{"start":{"row":57,"column":81},"end":{"row":57,"column":82},"action":"insert","lines":["m"],"id":275}],[{"start":{"row":57,"column":82},"end":{"row":57,"column":83},"action":"insert","lines":["e"],"id":276}],[{"start":{"row":61,"column":0},"end":{"row":61,"column":4},"action":"insert","lines":["    "],"id":277},{"start":{"row":62,"column":0},"end":{"row":62,"column":4},"action":"insert","lines":["    "]},{"start":{"row":63,"column":0},"end":{"row":63,"column":4},"action":"insert","lines":["    "]},{"start":{"row":64,"column":0},"end":{"row":64,"column":4},"action":"insert","lines":["    "]},{"start":{"row":65,"column":0},"end":{"row":65,"column":4},"action":"insert","lines":["    "]},{"start":{"row":66,"column":0},"end":{"row":66,"column":4},"action":"insert","lines":["    "]},{"start":{"row":67,"column":0},"end":{"row":67,"column":4},"action":"insert","lines":["    "]},{"start":{"row":68,"column":0},"end":{"row":68,"column":4},"action":"insert","lines":["    "]},{"start":{"row":69,"column":0},"end":{"row":69,"column":4},"action":"insert","lines":["    "]},{"start":{"row":70,"column":0},"end":{"row":70,"column":4},"action":"insert","lines":["    "]},{"start":{"row":71,"column":0},"end":{"row":71,"column":4},"action":"insert","lines":["    "]},{"start":{"row":72,"column":0},"end":{"row":72,"column":4},"action":"insert","lines":["    "]},{"start":{"row":73,"column":0},"end":{"row":73,"column":4},"action":"insert","lines":["    "]},{"start":{"row":74,"column":0},"end":{"row":74,"column":4},"action":"insert","lines":["    "]},{"start":{"row":75,"column":0},"end":{"row":75,"column":4},"action":"insert","lines":["    "]},{"start":{"row":76,"column":0},"end":{"row":76,"column":4},"action":"insert","lines":["    "]},{"start":{"row":77,"column":0},"end":{"row":77,"column":4},"action":"insert","lines":["    "]},{"start":{"row":78,"column":0},"end":{"row":78,"column":4},"action":"insert","lines":["    "]},{"start":{"row":79,"column":0},"end":{"row":79,"column":4},"action":"insert","lines":["    "]},{"start":{"row":80,"column":0},"end":{"row":80,"column":4},"action":"insert","lines":["    "]},{"start":{"row":81,"column":0},"end":{"row":81,"column":4},"action":"insert","lines":["    "]},{"start":{"row":82,"column":0},"end":{"row":82,"column":4},"action":"insert","lines":["    "]},{"start":{"row":83,"column":0},"end":{"row":83,"column":4},"action":"insert","lines":["    "]},{"start":{"row":84,"column":0},"end":{"row":84,"column":4},"action":"insert","lines":["    "]},{"start":{"row":85,"column":0},"end":{"row":85,"column":4},"action":"insert","lines":["    "]},{"start":{"row":86,"column":0},"end":{"row":86,"column":4},"action":"insert","lines":["    "]},{"start":{"row":87,"column":0},"end":{"row":87,"column":4},"action":"insert","lines":["    "]},{"start":{"row":88,"column":0},"end":{"row":88,"column":4},"action":"insert","lines":["    "]},{"start":{"row":89,"column":0},"end":{"row":89,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":45,"column":37},"end":{"row":46,"column":33},"action":"remove","lines":["","        var nameavailable = true;"],"id":278}],[{"start":{"row":54,"column":23},"end":{"row":55,"column":38},"action":"remove","lines":["","                nameavailable = false;"],"id":279}],[{"start":{"row":56,"column":13},"end":{"row":56,"column":14},"action":"insert","lines":[" "],"id":280}],[{"start":{"row":56,"column":14},"end":{"row":56,"column":15},"action":"insert","lines":["e"],"id":281}],[{"start":{"row":56,"column":15},"end":{"row":56,"column":16},"action":"insert","lines":["l"],"id":282}],[{"start":{"row":56,"column":16},"end":{"row":56,"column":17},"action":"insert","lines":["s"],"id":283}],[{"start":{"row":56,"column":17},"end":{"row":56,"column":18},"action":"insert","lines":["e"],"id":284}],[{"start":{"row":56,"column":18},"end":{"row":56,"column":19},"action":"insert","lines":["{"],"id":285}],[{"start":{"row":56,"column":19},"end":{"row":56,"column":20},"action":"insert","lines":["}"],"id":286}],[{"start":{"row":56,"column":18},"end":{"row":56,"column":19},"action":"insert","lines":[" "],"id":287}],[{"start":{"row":58,"column":11},"end":{"row":87,"column":16},"action":"remove","lines":[" ","            User.findOne({ 'local.email' :  email }, function(err, user) {","                // if there are any errors, return the error","                if (err)","                    return done(err);","    ","                // check to see if theres already a user with that email","                if (user) {","                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));","                } else {","                    if (nameavailable) {","        ","                        // if there is no user with that email","                        // create the user","                        var newUser            = new User();","        ","                        // set the user's local credentials","                        newUser.local.userName = req.body.userName;","                        newUser.local.email    = email;","                        newUser.local.password = newUser.generateHash(password);","        ","                        // save the user","                        newUser.save(function(err) {","                            if (err)","                                throw err;","                            return done(null, newUser);","                        });","                    }","                }","            }); "],"id":288}],[{"start":{"row":56,"column":20},"end":{"row":85,"column":16},"action":"insert","lines":[" ","            User.findOne({ 'local.email' :  email }, function(err, user) {","                // if there are any errors, return the error","                if (err)","                    return done(err);","    ","                // check to see if theres already a user with that email","                if (user) {","                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));","                } else {","                    if (nameavailable) {","        ","                        // if there is no user with that email","                        // create the user","                        var newUser            = new User();","        ","                        // set the user's local credentials","                        newUser.local.userName = req.body.userName;","                        newUser.local.email    = email;","                        newUser.local.password = newUser.generateHash(password);","        ","                        // save the user","                        newUser.save(function(err) {","                            if (err)","                                throw err;","                            return done(null, newUser);","                        });","                    }","                }","            }); "],"id":289}],[{"start":{"row":85,"column":16},"end":{"row":87,"column":12},"action":"insert","lines":["","                ","            "],"id":290}],[{"start":{"row":86,"column":16},"end":{"row":87,"column":0},"action":"remove","lines":["",""],"id":291}],[{"start":{"row":86,"column":12},"end":{"row":86,"column":16},"action":"remove","lines":["    "],"id":292}],[{"start":{"row":86,"column":8},"end":{"row":86,"column":12},"action":"remove","lines":["    "],"id":293}],[{"start":{"row":86,"column":4},"end":{"row":86,"column":8},"action":"remove","lines":["    "],"id":294}],[{"start":{"row":86,"column":0},"end":{"row":86,"column":4},"action":"remove","lines":["    "],"id":295}],[{"start":{"row":65,"column":24},"end":{"row":66,"column":40},"action":"remove","lines":["","                    if (nameavailable) {"],"id":296}],[{"start":{"row":81,"column":27},"end":{"row":82,"column":21},"action":"remove","lines":["","                    }"],"id":297}],[{"start":{"row":48,"column":0},"end":{"row":48,"column":4},"action":"insert","lines":["    "],"id":298},{"start":{"row":49,"column":0},"end":{"row":49,"column":4},"action":"insert","lines":["    "]},{"start":{"row":50,"column":0},"end":{"row":50,"column":4},"action":"insert","lines":["    "]},{"start":{"row":51,"column":0},"end":{"row":51,"column":4},"action":"insert","lines":["    "]},{"start":{"row":52,"column":0},"end":{"row":52,"column":4},"action":"insert","lines":["    "]},{"start":{"row":53,"column":0},"end":{"row":53,"column":4},"action":"insert","lines":["    "]},{"start":{"row":54,"column":0},"end":{"row":54,"column":4},"action":"insert","lines":["    "]},{"start":{"row":55,"column":0},"end":{"row":55,"column":4},"action":"insert","lines":["    "]},{"start":{"row":56,"column":0},"end":{"row":56,"column":4},"action":"insert","lines":["    "]},{"start":{"row":57,"column":0},"end":{"row":57,"column":4},"action":"insert","lines":["    "]},{"start":{"row":58,"column":0},"end":{"row":58,"column":4},"action":"insert","lines":["    "]},{"start":{"row":59,"column":0},"end":{"row":59,"column":4},"action":"insert","lines":["    "]},{"start":{"row":60,"column":0},"end":{"row":60,"column":4},"action":"insert","lines":["    "]},{"start":{"row":61,"column":0},"end":{"row":61,"column":4},"action":"insert","lines":["    "]},{"start":{"row":62,"column":0},"end":{"row":62,"column":4},"action":"insert","lines":["    "]},{"start":{"row":63,"column":0},"end":{"row":63,"column":4},"action":"insert","lines":["    "]},{"start":{"row":64,"column":0},"end":{"row":64,"column":4},"action":"insert","lines":["    "]},{"start":{"row":65,"column":0},"end":{"row":65,"column":4},"action":"insert","lines":["    "]},{"start":{"row":66,"column":0},"end":{"row":66,"column":4},"action":"insert","lines":["    "]},{"start":{"row":67,"column":0},"end":{"row":67,"column":4},"action":"insert","lines":["    "]},{"start":{"row":68,"column":0},"end":{"row":68,"column":4},"action":"insert","lines":["    "]},{"start":{"row":69,"column":0},"end":{"row":69,"column":4},"action":"insert","lines":["    "]},{"start":{"row":70,"column":0},"end":{"row":70,"column":4},"action":"insert","lines":["    "]},{"start":{"row":71,"column":0},"end":{"row":71,"column":4},"action":"insert","lines":["    "]},{"start":{"row":72,"column":0},"end":{"row":72,"column":4},"action":"insert","lines":["    "]},{"start":{"row":73,"column":0},"end":{"row":73,"column":4},"action":"insert","lines":["    "]},{"start":{"row":74,"column":0},"end":{"row":74,"column":4},"action":"insert","lines":["    "]},{"start":{"row":75,"column":0},"end":{"row":75,"column":4},"action":"insert","lines":["    "]},{"start":{"row":76,"column":0},"end":{"row":76,"column":4},"action":"insert","lines":["    "]},{"start":{"row":77,"column":0},"end":{"row":77,"column":4},"action":"insert","lines":["    "]},{"start":{"row":78,"column":0},"end":{"row":78,"column":4},"action":"insert","lines":["    "]},{"start":{"row":79,"column":0},"end":{"row":79,"column":4},"action":"insert","lines":["    "]},{"start":{"row":80,"column":0},"end":{"row":80,"column":4},"action":"insert","lines":["    "]},{"start":{"row":81,"column":0},"end":{"row":81,"column":4},"action":"insert","lines":["    "]},{"start":{"row":82,"column":0},"end":{"row":82,"column":4},"action":"insert","lines":["    "]},{"start":{"row":83,"column":0},"end":{"row":83,"column":4},"action":"insert","lines":["    "]},{"start":{"row":84,"column":0},"end":{"row":84,"column":4},"action":"insert","lines":["    "]},{"start":{"row":85,"column":0},"end":{"row":85,"column":4},"action":"insert","lines":["    "]},{"start":{"row":86,"column":0},"end":{"row":86,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":57,"column":0},"end":{"row":57,"column":4},"action":"insert","lines":["    "],"id":299},{"start":{"row":58,"column":0},"end":{"row":58,"column":4},"action":"insert","lines":["    "]},{"start":{"row":59,"column":0},"end":{"row":59,"column":4},"action":"insert","lines":["    "]},{"start":{"row":60,"column":0},"end":{"row":60,"column":4},"action":"insert","lines":["    "]},{"start":{"row":61,"column":0},"end":{"row":61,"column":4},"action":"insert","lines":["    "]},{"start":{"row":62,"column":0},"end":{"row":62,"column":4},"action":"insert","lines":["    "]},{"start":{"row":63,"column":0},"end":{"row":63,"column":4},"action":"insert","lines":["    "]},{"start":{"row":64,"column":0},"end":{"row":64,"column":4},"action":"insert","lines":["    "]},{"start":{"row":65,"column":0},"end":{"row":65,"column":4},"action":"insert","lines":["    "]},{"start":{"row":66,"column":0},"end":{"row":66,"column":4},"action":"insert","lines":["    "]},{"start":{"row":67,"column":0},"end":{"row":67,"column":4},"action":"insert","lines":["    "]},{"start":{"row":68,"column":0},"end":{"row":68,"column":4},"action":"insert","lines":["    "]},{"start":{"row":69,"column":0},"end":{"row":69,"column":4},"action":"insert","lines":["    "]},{"start":{"row":70,"column":0},"end":{"row":70,"column":4},"action":"insert","lines":["    "]},{"start":{"row":71,"column":0},"end":{"row":71,"column":4},"action":"insert","lines":["    "]},{"start":{"row":72,"column":0},"end":{"row":72,"column":4},"action":"insert","lines":["    "]},{"start":{"row":73,"column":0},"end":{"row":73,"column":4},"action":"insert","lines":["    "]},{"start":{"row":74,"column":0},"end":{"row":74,"column":4},"action":"insert","lines":["    "]},{"start":{"row":75,"column":0},"end":{"row":75,"column":4},"action":"insert","lines":["    "]},{"start":{"row":76,"column":0},"end":{"row":76,"column":4},"action":"insert","lines":["    "]},{"start":{"row":77,"column":0},"end":{"row":77,"column":4},"action":"insert","lines":["    "]},{"start":{"row":78,"column":0},"end":{"row":78,"column":4},"action":"insert","lines":["    "]},{"start":{"row":79,"column":0},"end":{"row":79,"column":4},"action":"insert","lines":["    "]},{"start":{"row":80,"column":0},"end":{"row":80,"column":4},"action":"insert","lines":["    "]},{"start":{"row":81,"column":0},"end":{"row":81,"column":4},"action":"insert","lines":["    "]},{"start":{"row":82,"column":0},"end":{"row":82,"column":4},"action":"insert","lines":["    "]},{"start":{"row":83,"column":0},"end":{"row":83,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":66,"column":0},"end":{"row":66,"column":4},"action":"remove","lines":["    "],"id":300},{"start":{"row":67,"column":0},"end":{"row":67,"column":4},"action":"remove","lines":["    "]},{"start":{"row":68,"column":0},"end":{"row":68,"column":4},"action":"remove","lines":["    "]},{"start":{"row":69,"column":0},"end":{"row":69,"column":4},"action":"remove","lines":["    "]},{"start":{"row":70,"column":0},"end":{"row":70,"column":4},"action":"remove","lines":["    "]},{"start":{"row":71,"column":0},"end":{"row":71,"column":4},"action":"remove","lines":["    "]},{"start":{"row":72,"column":0},"end":{"row":72,"column":4},"action":"remove","lines":["    "]},{"start":{"row":73,"column":0},"end":{"row":73,"column":4},"action":"remove","lines":["    "]},{"start":{"row":74,"column":0},"end":{"row":74,"column":4},"action":"remove","lines":["    "]},{"start":{"row":75,"column":0},"end":{"row":75,"column":4},"action":"remove","lines":["    "]},{"start":{"row":76,"column":0},"end":{"row":76,"column":4},"action":"remove","lines":["    "]},{"start":{"row":77,"column":0},"end":{"row":77,"column":4},"action":"remove","lines":["    "]},{"start":{"row":78,"column":0},"end":{"row":78,"column":4},"action":"remove","lines":["    "]},{"start":{"row":79,"column":0},"end":{"row":79,"column":4},"action":"remove","lines":["    "]},{"start":{"row":80,"column":0},"end":{"row":80,"column":4},"action":"remove","lines":["    "]},{"start":{"row":81,"column":0},"end":{"row":81,"column":4},"action":"remove","lines":["    "]}],[{"start":{"row":74,"column":84},"end":{"row":75,"column":84},"action":"insert","lines":["","                            newUser.local.password = newUser.generateHash(password);"],"id":301}],[{"start":{"row":75,"column":42},"end":{"row":75,"column":50},"action":"remove","lines":["password"],"id":302},{"start":{"row":75,"column":42},"end":{"row":75,"column":43},"action":"insert","lines":["s"]}],[{"start":{"row":75,"column":43},"end":{"row":75,"column":44},"action":"insert","lines":["i"],"id":303}],[{"start":{"row":75,"column":44},"end":{"row":75,"column":45},"action":"insert","lines":["z"],"id":304}],[{"start":{"row":75,"column":45},"end":{"row":75,"column":46},"action":"insert","lines":["e"],"id":305}],[{"start":{"row":75,"column":49},"end":{"row":75,"column":79},"action":"remove","lines":["newUser.generateHash(password)"],"id":310},{"start":{"row":75,"column":49},"end":{"row":75,"column":50},"action":"insert","lines":["1"]}],[{"start":{"row":75,"column":50},"end":{"row":75,"column":51},"action":"insert","lines":["2"],"id":311}],[{"start":{"row":78,"column":53},"end":{"row":78,"column":58},"action":"insert","lines":[",room"],"id":325}],[{"start":{"row":78,"column":61},"end":{"row":79,"column":24},"action":"insert","lines":["","   console.log(room.id);"],"id":326}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":101,"column":13},"end":{"row":101,"column":16},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1480045550000,"hash":"1a0dda32f599d3d85b2d28d0d8888eaa69945ae9"}