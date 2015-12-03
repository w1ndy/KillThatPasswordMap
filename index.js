var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

pageMod.PageMod({
    include: "http://card.sdu.edu.cn/",
    contentScriptFile: [
        self.data.url('jquery-1.11.3.min.js'),
        self.data.url('gocr.js'),
        self.data.url('ktpm.js')
    ]
});
