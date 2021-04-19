// node_modules requires
var gulp = require('gulp')
var concat = require('gulp-concat')
var stylus = require('gulp-stylus')
var base64 = require('gulp-base64')
var base64Settings = {
    extensions: ['svg'],
    maxImageSize: 10 * 1024,
    debug: false
}
var autoprefixer = require('gulp-autoprefixer')
var autoprefixerSettings = {
    browsers: ['iOS >= 7'],
    cascade: false
}
var through = require('through2')
var fs = require('fs')
var http = require('http')
var argv = require('minimist')(process.argv)
var spawn = require('child_process').spawn
var execSync = require('child_process').execSync

// lib requires
var beast = require('./lib/beast.js')
var beastDoc = require('./lib/beast-doc.js')
var conf = require('./lib/conf.js')

// Заготовка для gulp-плагина
var pipeToString = (callback, ext) => {
    return through.obj(function(file, encoding, cb) {
        if (file.isNull()) return cb(null, file)
        if (file.isStream()) return cb(new PluginError('gulp-beast', 'Streaming not supported'))
        if (ext === undefined || file.path.split('.').pop() === ext) {
            file.contents = new Buffer(
                callback(file.contents.toString(), file)
            )
        }
        cb (null, file)
    })
}

var quoteBase64 = (string, file) => string.replace(/url\(([^)]+)\)/g, "url('$1')")

if (!conf.project) {
    console.log(`Please, specify --project`)
    process.exit(1)
}

if (!fs.existsSync('./build')) {
    fs.mkdirSync('./build')
}

if (!fs.existsSync(conf.path.build)) {
    fs.mkdirSync(conf.path.build)
}

gulp.task('js', () => {
    return gulp.src(conf.path.js)
        .pipe(pipeToString(
            string => beast.parseBML(string),
            'bml'
        ))
        .pipe(concat('build.js'))
        .pipe(gulp.dest(conf.path.build))
})

gulp.task('exp', () => {
    var expNames = []

    // Получить полный список названий экспериментов
    if (fs.existsSync(conf.path.exp)) {
        expNames = expNames.concat(
            fs.readdirSync(conf.path.exp).filter(
                expName => expName.indexOf('.') === -1
            )
        )
    }

    // Сборка для каждого эксперимента
    for (let i = 0, ii = expNames.length; i < ii; i++) {
        let expName = expNames[i]
        let js = []
        let css = []

        js.push(`${conf.path.exp}/${expName}/**/*.bml`)
        css.push(`${conf.path.exp}/${expName}/**/*.styl`)

        if (!fs.existsSync(`${conf.path.build}/exp/`)) {
            fs.mkdirSync(`${conf.path.build}/exp/`)
        }

        fs.writeFileSync(`${conf.path.build}/exp/${expName}.js`, '')
        fs.writeFileSync(`${conf.path.build}/exp/${expName}.css`, '')

        gulp.task(`exp-js-${expName}`, () => {
            gulp.src(js)
                .pipe(pipeToString(string => beast.parseBML(string), 'bml'))
                .pipe(concat(`${expName}.js`))
                .pipe(gulp.dest(`${conf.path.build}/exp`))
        })

        gulp.task(`exp-css-${expName}`, () => {
            gulp.src(css)
                .pipe(base64(base64Settings))
                .pipe(concat(`${expName}.styl`))
                .pipe(pipeToString(quoteBase64, 'styl'))
                .pipe(stylus({
                    paths: [__dirname + '/blocks']
                }))
                .pipe(autoprefixer(autoprefixerSettings))
                .pipe(gulp.dest(`${conf.path.build}/exp`))
        })

        if (!argv['no-watch']) {
            gulp.watch(js, [`exp-js-${expName}`])
            gulp.watch(css, [`exp-css-${expName}`])
        }
        gulp.start(`exp-js-${expName}`, `exp-css-${expName}`)
    }
})

gulp.task('css', () => {
    var filenames = []
    var splitString = '\n/* CUT THE FILE HERE */\n'

    return gulp.src(conf.path.css)
        .pipe(base64(base64Settings))
        .pipe(concat('build.styl', {newLine: splitString}))
        .pipe(pipeToString(quoteBase64, 'styl'))
        .pipe(
            stylus({
                paths: [__dirname + '/blocks'],
            })
        )
        .pipe(autoprefixer(autoprefixerSettings))
        .pipe(gulp.dest(conf.path.build))
})

var server
gulp.task('server', ['build'], () => {
    server && server.kill()
    server = spawn('node', ['lib/server-project.js', '--port', conf.port.dev, '--dev', '--project', conf.project])

    server.stdout.on('data', (data) => {
        console.log(data.toString())
    })
    server.stderr.on('data', (data) => {
        console.log(data.toString())
        server.kill()
    })
    server.on('error', (data) => {
        console.log(data.toString())
        server.kill()
    })
    process.on('exit', (code) => {
        server.kill()
    })
})

gulp.task('build', ['js', 'css', 'exp'])

gulp.task('default', () => {
    gulp.watch(conf.path.js, ['js'])
    gulp.watch(conf.path.css, ['css'])
    gulp.start('server')
})
