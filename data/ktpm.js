console.log("KILL THAT PASSWORD MAP has been loaded");

var maxRetries = 5;

function killHandlers(eid) {
    var e = document.getElementById(eid),
    ec = e.cloneNode(true);
    ec.id = e.id + "Clone";
    var parent = e.parentNode;
    parent.replaceChild(ec, e);
    parent.appendChild(e);
    e.style.display = 'none';
}

function hideKeypad() {
    if ($('#txtWSTransferCardPwd').length == 0) {
        setTimeout(hideKeypad, 1000);
        return ;
    }
    killHandlers('txtWSTransferCardPwd');
    killHandlers('btnWSTransfer');
    $('#txtWSTransferCardPwdClone').removeAttr('readonly');
    $("#btnWSTransferClone").on("click", request);

    $("#checkXieYi").prop('checked', true);
    if (localStorage.transferTo)
        $('#selTransferTo').val(localStorage.transferTo);
    if (localStorage.bankNo)
        $('#txtWSTransferBankNo').val(localStorage.bankNo);
    if (localStorage.amount)
        $('#txtWSTransferAmount').val(localStorage.amount);

}

function encryptKeys(pwmap) {
    var pwd = $('#txtWSTransferCardPwdClone').val(), converted = "";
    for (var i = 0; i < pwd.length; i++) {
        if (pwd[i] >= '0' && pwd[i] <= '9')
            converted = pwmap[parseInt(pwd[i])] + converted;
        else {
            alert("Password can only contain digits!");
            return ;
        }
    }
    $('#txtWSTransferCardPwd').val(converted);
    $('#btnWSTransfer').trigger('click');
}

function parsePasswordMap(rawmap) {
    var pwmap = [], rightmap = true;;
    try {
        rawmap = rawmap.trim().split(/\s+/)
            .map(function (v, i) { return [parseInt(v), i]; })
            .sort(function (a, b) { return a[0] - b[0]; });
        for (var i = 0; i < 10; i++) {
            if (rawmap[i][0] != i) {
                rightmap = false;
                break;
            } else {
                pwmap.push(rawmap[i][1].toString());
            }
        }
    } catch (e) {
        console.log('Exception Caught: ', e);
        rightmap = false;
    }
    if (!rightmap) {
        if (--maxRetries) {
            console.log("retrying...");
            request();
        } else {
            console.log("max retry attempts");
            alert("Unable to retrieve password map!");
            maxRetries = 5;
        }
    } else {
        maxRetries = 5;
        encryptKeys(pwmap);
    }
}

function ocrMap(img) {
    var c = document.createElement("canvas"),
        ctx = c.getContext("2d"),
        width = 16, height = 16,
        offset = [6, 37, 68, 95, 126, 157, 186, 215, 245, 275], y = 7;
    c.width = img.width;
    c.height = img.height;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < 10; i++) {
        ctx.drawImage(img, offset[i], y, width, height,
            width * i + 10, 10, width, height);
    }
    var data = ctx.getImageData(0, 0, c.width, c.height),
        pixels = data.data;
    for (var i = 0; i < pixels.length; i += 4) {
        if ((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 < 160) {
            pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
        } else {
            pixels[i] = pixels[i + 1] = pixels[i + 2] = 255;
        }
    }
    ctx.putImageData(data, 0, 0);
    parsePasswordMap(GOCR(ctx));
}

function request() {
    var img = new Image();
    img.onload = function () {
        ocrMap(img);
    };
    img.src = "/Account/GetNumKeyPadImg?" + Math.random();

    localStorage.transferTo = $('#selTransferTo').val();
    localStorage.bankNo = $('#txtWSTransferBankNo').val();
    localStorage.amount = $('#txtWSTransferAmount').val();
}

$("#Pay #Transfer").click(function () {
    console.log("click event occurred");
    setTimeout(hideKeypad, 1000);
});
