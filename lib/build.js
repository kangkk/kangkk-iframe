'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    ejs = require('ejs'),
    mkdirp = require('mkdirp'),
    hljs = require('highlight.js'),
    async = require('async'),
    moment = require('moment');


function srcFolderMenuPath(folder) {
    return path.join(__dirname, folder);
}

function verificationPath(path) {
    // 判断路径是否存在
    return !!fs.existsSync(path)
}

module.exports = function (projectHomePath){
    // 找到 src 文件夹
    var srcFolder = path.join(projectHomePath, 'src');
    // 定义输出路径
    var outPath = path.join(projectHomePath, 'dist');
    // 判断路径是否存在，没有则创建，有则终止进程
    if (!verificationPath(outPath)){
        // 同步创建文件夹
        mkdirp.sync(outPath);
    }else{
        // 终止进程
        console.log('已经存在 dist 文件夹，请仔细检查逻辑是否需要重新生成 dist');
        return false;
    }
    // 检查是否存在 src 文件夹
    if (!verificationPath(srcFolder)){
        // 终止进程
        console.log('不存在 src 文件夹');
        return false;
    }else{
        // 存在则继续执行
        // 遍历 src 文件夹
        iteratorSrcFolder(srcFolder, outPath, projectHomePath)
    }
}
// 遍历文件夹下面所有文件
function iteratorSrcFolder(sourcePath, outPath, projectHomePath){
    // tpm
    var libs = '', csss = [], htmls = [], javascripts = [];
    // 判断 lib.txt 是否存在
    var hasLibTxt = verificationPath(sourcePath + '/lib.txt');
    if(hasLibTxt){
        // 如果存在 lib.txt
        // 找到 lib 文件并读取
        libs = fs.readFileSync(sourcePath + '/lib.txt', 'utf8');
    }
    // 遍历 src 文件夹内的文件
    _.each(fs.readdirSync(sourcePath), function(fileName, index) {
        let filePath = sourcePath + '/' + fileName;
        // 读取文件
        let file = fs.statSync(filePath);

        // 判断是否是文件
        if (file.isFile()) {
            // 拷贝文件
            fs.writeFileSync(outPath + '/' + fileName, fs.readFileSync(filePath, 'utf8'), 'utf8');
            // 文件后缀名称
            var extname = path.extname(fileName);
            // 判断是否是 js 相关，js、ts、coffeejs 等
            switch(extname){
                // html 相关
                case ['.html', '.xml'].filter(item=>item===extname)[0]:
                    htmls.push(fs.readFileSync(filePath, 'utf8'));
                break;
                // js 相关
                case ['.js', '.ts'].filter(item=>item===extname)[0]:
                    javascripts.push(fileName);
                break;
                // css 相关
                case ['.css', '.less', '.sass', 'scss'].filter(item=>item===extname)[0]:
                    csss.push(fileName);
                break;
            }
        }
    });

    // 生成 index.html 文件
    fs.writeFileSync(
        outPath + '/index.html',
        ejs.render(
            creatHtmlTemplate(libs, csss, htmls, javascripts)
        ),
        'utf8'
    );
    console.log('creat [' + outPath + '/index.html]');
}


function creatHtmlTemplate(libs, csss, htmls, javascripts) {
  return '<!DOCTYPE html>\n'
        + '<html>\n'
        + '<head>\n'
        + '  <meta charset="utf-8">\n'
        + '  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n'
        + '  <title>康健生活</title>\n'
        + libs
        + '\n'
        + csss.map(item=>{return `<link rel="stylesheet" type="text/css" href="${'./'+item}"/>`}).join('\n')
        + '\n</head>\n'
        + '<body>\n'
        + htmls.join('\n')
        + javascripts.map(item=>{return `<script src="${'./'+item}" type="text/javascript"></script>`}).join('\n')
        + '\n</body>\n'
        + '</html>';
};
