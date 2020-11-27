'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    ejs = require('ejs'),
    mkdirp = require('mkdirp'),
    hljs = require('highlight.js'),
    async = require('async'),
    moment = require('moment');

var resultPage = path.relative(__dirname, 'dist/index.html');
var srcFolder = path.join(__dirname, 'src');
var createHighlightFilePath = path.join(__dirname, 'highlight');

function srcFolderMenuPath(folder) {
    return path.join(__dirname, folder);
}

function verificationPath(path) {
    // 判断路径是否存在
    if (!fs.existsSync(path)) {
        return {
            status: false
        };
    } else {
        return {
            status: true
        };
    }
}

module.exports = function (){
    iteratorSrcFolder(srcFolder, createHighlightFilePath)
}
// 遍历文件夹下面所有文件

function iteratorSrcFolder(sourcePath, outPath){
    var fsStat = fs.statSync(sourcePath);

    if (!verificationPath(outPath).status) mkdirp(outPath);

    let htmlPreString = '',
        htmlTabString = ''

    _.each(fs.readdirSync(sourcePath), function(fileName, index) {
        let filePath = sourcePath + '/' + fileName
        let file = fs.statSync(filePath)
        if (file.isFile()) {
            let tmp = createHighlightFile(filePath, fileName, outPath, index);
            htmlTabString = htmlTabString + tmp.tab
            htmlPreString = htmlPreString + tmp.pre
        }
    });

    fs.writeFileSync(
        __dirname + '/iframe.html',
        ejs.render(
            creatHtmlTemplate(htmlTabString, htmlPreString, resultPage)
        ),
        'utf8'
    );
    console.log('creat [' + __dirname + '/iframe.html]');
}

function createHighlightFile(filePath, fileName, outPath, index) {
    let fileFs = fs.readFileSync(filePath, 'utf8'),
        fileFsTimeObject = fs.statSync(filePath),
        relativePath = path.relative(outPath, __dirname);
    let birthtime = moment(fileFsTimeObject.birthtime).format("YYYY-MM-DD"),
        mtime = moment(fileFsTimeObject.mtime).format("MM-DD"),
        mtimeGetTime = moment(fileFsTimeObject.mtime).unix();
    let htmlFileName = path.join(fileName + '.html'),
        extName = path.extname(fileName),
        creatFilePath = path.join(outPath, htmlFileName);

    return {
                pre: creatHighlightTemplate(fileFs, fileName, extName, index),
                tab: creatFileTabTemplate(fileFs, fileName, extName, index)
            }
}


function creatFileTabTemplate(content, title, extName, index) {
  return '<li class="' + (index===0?"active":"") + '">'
        + '<a data-trigger-type="' + extName.slice(1) + '" href="#' + title + '">' + title + '</a>'
        + '</li>';
};

function creatHighlightTemplate(content, title, extName, index) {
  return '<pre class="tCont ' + extName.slice(1) + ' hljs ' + (index===0?"active":"") + '">'
        + hljs.highlightAuto(content).value
        + '</pre>';
};

function creatHtmlTemplate(tabs, pres, iframe) {
  return '<!DOCTYPE html>'
        + '<html>'
        + '<head>'
        + '  <meta charset="utf-8">'
        + '  <meta http-equiv="X-UA-Compatible" content="IE=edge">'
        + '  <title>康健生活</title>'
        + '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.0/styles/a11y-light.min.css" integrity="sha512-PW96n2amVglidqEDLPUdjJ0zByhT20poSqWJYZRutR6CP2QH58k96WmorqNnC4QXnosNeqMJM8FR/93isIifDQ==" crossorigin="anonymous" />'
        + '  <link rel="stylesheet" href="https://www.kangjian.life/lib/embed/embed-light.css"/>'
        + '  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.0/highlight.min.js" integrity="sha512-av6ZR84Ldk6j29DMhf6v0cssEhow1VROFLoKbX7wrvzZB++/nV8m0jXbYeWcHPEzSNONImx6zwBskCUT9AQidA==" crossorigin="anonymous"></script>'
        + '  <script src="https://www.kangjian.life/lib/embed/embed.js"></script>'
        + '<script type="text/javascript">var height;var force_height = null;var slug = "02e64ndr";var show_src = "'+iframe+'";var resize_element_counter = 0;var shell_edit_url = "/02e64ndr/light/"</script>'
        + '</head>'
        + '<body>'
        + '<div id="full-embed">'
        + '<header>'
        + '  <h1><a href="https://www.kangjian.life/" target="_blank">康健生活</a></h1>'
        + '  <div id="actions">'
        + '     <ul class="normalRes">'
        + tabs
        + '   </ul>'
        + '   <div class="hl animated" style="left: 0px; width: 81.0875px;"></div>'
        + '  </div>'
        + '</header>'
        + '<div class="content"><div class="left">'
        + '<div id="tabs">'
        + pres
        + '</div></div><div class="right">'
        + '<div class="tCont result" id="result">'
        + '<iframe src="' + iframe + '" frameborder="0" sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-downloads allow-modals allow-popups" allow="midi; geolocation; microphone; camera; display-capture; encrypted-media;"></iframe>'
        + '</div></div></div>'
        + '</body>'
        + '</html>';
};
