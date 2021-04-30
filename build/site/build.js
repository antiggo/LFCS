/**
 * @lib Typo Работа со строками
 * @ver 0.8.1
 */

var Typo = {}

if (typeof window === 'undefined') {
    module.exports = Typo
}

;(function () {

var regExp = {
    squareBracketOpen: /\[/g,
    squareBracketClose: /\]/g,
    squareBrackets: /\[|\]/g,
    urlWastes: /^(?:(?:[a-z]+:)?\/\/)?(?:www\.)?|(?:\.(?:html?|php))?\/?(?:\?.*)?$|\/?%.*$/ig,
    urlDomainOnly: /^(?:(?:[a-z]+:)?\/\/)?(?:www\.)?|\/.*$/g,
    floatNumberTail: /[,\.]\d*/,
    formatNumber: /(\d)(?=(\d\d\d)+(?!\d))/g,
    letter: /[a-zа-я]/i,
    expression: /^[0-9\.\(\)\s\*\/+-]*$/,
    number: /^[-]?[0-9]+(?:[,\.][0-9]+)?$/,
    nbsp: /\u00A0/g,
    trimSpaces: /^\s+|\s+$/g,
    bTags: /<b>|<\/b>/g,
    htmlTag: /<\/?[a-z][^>]*>/gi,
    specialChar: /&[a-z]+;/g,
    specialCharNbsp: /&nbsp;/g,
    specialCharMdash: /&mdash;/g,
    hashtag: /#([a-z0-9\/_-]+)/gi,
}
Typo.regExp = regExp

var char = {
    nbsp: '\u00A0',
    thinsp: '\u2009',
    minus: '−',
    wbr: '\u00AD',

}
Typo.char = char

var locale = 'ru'

/**
 * @method squareBracketsToTagB Заменить в тексте ноды скобки [...] на тэги <b>...</b>
 * @arg domNode {object} DOM-нода
 */
Typo.squareBracketsToTagB = function (domNode) {
    for (var i = 0, ii = domNode.childNodes.length, node; i < ii; i++) {
        node = domNode.childNodes[i]

        if (node.nodeType === 1) {
            Typo.squareBracketsToTagB(node)
        } else if (node.nodeType === 3) {
            var span = document.createElement('span')
            span.innerHTML = node.textContent
                .replace(regExp.squareBracketOpen, '<b>')
                .replace(regExp.squareBracketClose, '</b>')

            for (var j = 0, jj = span.childNodes.length; j < jj; j++) {
                node.parentNode.insertBefore(span.childNodes[j], node)
                j--
                jj--
            }

            node.parentNode.removeChild(node)
        }
    }
}

Typo.hashtagReplace = function (domNode, replaceString) {
    if (replaceString === undefined) {
        replaceString = '<a href="$1">#$1</a>'
    }

    for (var i = 0, ii = domNode.childNodes.length, node; i < ii; i++) {
        node = domNode.childNodes[i]

        if (node.nodeType === 1) {
            Typo.hashtagReplace(node, replaceString)
        } else if (node.nodeType === 3) {
            var span = document.createElement('span')
            span.innerHTML = node.textContent
                .replace(/</g,'&lt;')
                .replace(regExp.hashtag, replaceString)

            for (var j = 0, jj = span.childNodes.length; j < jj; j++) {
                node.parentNode.insertBefore(span.childNodes[j], node)
                j--
                jj--
            }

            node.parentNode.removeChild(node)
        }
    }
}


Typo.clearSquareBrackets = function (string) {
    return string.replace(regExp.squareBrackets, '')
}

Typo.trimSpaces = function (string) {
    return string.replace(regExp.trimSpaces, '')
}

Typo.clearHtml = function (string) {
    return string
        .replace(regExp.htmlTag, '')
        .replace(regExp.specialCharMdash, '—')
        .replace(regExp.specialCharNbsp, ' ')
        .replace(regExp.specialChar, '')
}

/*
 * Cleaners
 */
Typo.cleanUrl = function (string) {
    //return decodeURIComponent(string).replace(regExp.urlWastes, '').toLowerCase()
    return string.replace(regExp.urlWastes, '').toLowerCase()
}
Typo.urlDomain = function (string) {
    return string.replace(regExp.urlDomainOnly, '').toLowerCase()
}

Typo.cleanSnippetTitle = function (string) {
    string = string
        .replace(snippetTitleRegExp.rub, '$1₽')
        .replace(snippetTitleRegExp.numberSpace, "$1" + char.nbsp)
        .replace(snippetTitleRegExp.spaceBeforePunctuation, "$1")
        .replace(snippetTitleRegExp.extremeEllipsis, '')
        .replace(snippetTitleRegExp.fakeEllipsis, '…')
        .replace(snippetTitleRegExp.dash, ' – ')
        .replace(snippetTitleRegExp.separator, '. ')
        .replace(snippetTitleRegExp.shortWordNowrap, char.nbsp + "$1")
        .replace(snippetTitleRegExp.parasiteDot, "$1")

    var capitalWords = string.match(snippetTitleRegExp.capitalWord)
    if (capitalWords !== null) {
        for (var i = 0, ii = capitalWords.length; i < ii; i++) {
            string = string.replace(capitalWords[i], capitalWords[i].toLowerCase())
        }
    }

    string = Typo.firstLetterUpperCase(string)

    return string
}
var snippetTitleRegExp = {
    rub: /([^а-я])руб\./ig,
    extremeEllipsis: /^\.\.\.|\.\.\.$/g,
    fakeEllipsis: /\.{2,}/g,
    dash: /\s[-—]\s/g,
    separator: /\s[|\/<>•·]\s(?![0-9])/g,
    capitalWord: /([A-ZА-Я]{4,})/g,
    shortWordNowrap: /\s([^\s]{,4})$/i,
    numberSpace: /([0-9]\]?)\s/g,
    spaceBeforePunctuation: /\s([.,;:!?])/g,
    parasiteDot: /([.,;:!?])\.|\.$/,
}

Typo.cleanAddress = function (string) {
    // Развернуть адрес: улица дом, город, район, область

    return string
}
Typo.cleanWorkingTime = function (string) {
    // Дни недели скоратить до ПН, ВТ...
    // Слова с большой: Еждневно
    // Все промежутки оформить через короткое тире: сб,вс пн-пт
    // Поставить пробелы после запятой и точки с запятой

    return string
}

Typo.removeBTags = function (string) {
    return string.replace(regExp.bTags, '')
}

Typo.firstLetterUpperCase = function (string) {
    var i = 0
    var ii = string.length

    while (i < ii && Typo.isPunctuation(string[i])) {
        i++
    }
    if (i === ii) {
        return string
    }

    return string.substring(0,i) + string.substr(i,1).toUpperCase() + string.slice(i+1)
}

Typo.formatFakeCaps = function (string) {
    if (string.length <= 3) {
        return string
    }

    return Typo.firstLetterUpperCase(
        string.toLowerCase()
    )
}

Typo.formatNumber = function (number) {
    if (typeof number === 'number') {
        number = number.toString()
    }

    if (!regExp.number.test(number)) {
        return ''
    }

    number = number.split('.')

    if (number[0].replace('-', '').length > 4) {
        number[0] = number[0]
            .replace(regExp.formatNumber, '$1' + char.nbsp)
            .replace('-', char.minus)
    }

    number = number.join(',')

    return number
}

Typo.parseFormattedNumber = function (formattedNumber) {
    var number = parseFloat(
        formattedNumber.replace(',', '.').replace(regExp.nbsp, '')
    )

    return isNaN(number) ? 0 : number
}

Typo.formatPrice = function (from, to, currencyCode) {
    if (typeof from === 'string') {
        from = parseFloat(from)
    }

    if (typeof currencyCode === 'undefined') {
        currencyCode = to
        to = false
    } else if (typeof to === 'string') {
        to = parseFloat(to)
    }

    currencyCode = currencyCode.toUpperCase()

    var symbol = currencySymbol[currencyCode] || currencyCode

    if (to) {
        return Typo.formatNumber(from) + char.nbsp + '–' + char.nbsp + Typo.formatNumber(to) + char.nbsp + symbol
    } else {
        return Typo.formatNumber(from) + char.nbsp + symbol
    }
}
var currencySymbol = {
    RUB:'₽',
    RUR:'₽',
    ' РУБ.':'₽',
    ' РУБ.':'₽',
    'РУБ.':'₽',
    'РУБ':'₽',
    'Р.':'₽',
    'Р':'₽',
    'РУБЛЬ':'₽',
    'РУБЛЯ':'₽',
    'РУБЛЕЙ':'₽',

    USD:'$',
    EUR:'€',
    GBP:'£',
    JPY:'¥',
    CNY:'¥',
    UAH:'₴',
    ILS:'₪',
    GEL:'ლ',
}

Typo.formatRange = function (from, to, unit) {
    return from + char.nbsp + '–' + char.nbsp + to + (unit ? char.nbsp + unit : '')
}

Typo.isLetter = function (symbol) {
    if (symbol === '') return false

    var charCode = symbol.charCodeAt(0)
    return charCode >= 65 && charCode <= 122 || charCode >= 1040 && charCode <= 1103
}

Typo.isCapitalLetter = function (symbol) {
    if (symbol === '') return false

    var charCode = symbol.charCodeAt(0)
    return charCode >= 65 && charCode <= 90 || charCode >= 1040 && charCode <= 1071
}

Typo.isDigit = function (symbol) {
    var charCode = symbol.charCodeAt(0)
    return charCode >= 48 && charCode <= 57
}

Typo.isPunctuation = function (symbol) {
    if (symbol === '') return false

    return punctuationSybmols.indexOf(symbol) !== -1
}
var punctuationSybmols = [
    '.', ',', ';', ':', '!', '?', '[', ']', '(', ')', '{', '}', '-', '–', '—', '<', '>', '«', '»',
]

Typo.hasLetters = function (string) {
    return regExp.letter.test(string)
}

Typo.isExpression = function (string) {
    return regExp.expression.test(string)
}

/**
 * Finds unit declination for number
 * @number number
 * @units array Words for counts: 1, 2, 5
 */
Typo.declination = function (number, units, includeNumber) {
    if (typeof number === 'string') {
        number = parseFloat(number)
    }

    var unit
    var number00 = Math.abs(number) % 100

    if (Math.floor(number) - number !== 0) {
        unit = units[1]
    } else if (number00 >= 10 && number00 <= 20) {
        unit = units[2]
    } else {
        unit = units[
            declinationArray[number % 10]
        ]
    }

    return includeNumber
        ? Typo.formatNumber(number) + char.nbsp + unit
        : unit
}
var declinationArray = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2]

/**
 * Replaces $[0-9] with values in pattern string
 * @pattern   string Format is 'foo $1 bar $2'
 * @arguments string Values to replace
 * @return    string Replaced string
 */
Typo.pattern = function (pattern) {
    if (pattern === '') return ''

    var $index = pattern.indexOf('$')
    while ($index > -1) {
        pattern = pattern.substr(0, $index) + arguments[pattern[$index+1]] + pattern.substr($index+2)
        $index = pattern.indexOf('$')
    }

    return pattern
}

/**
 *
 */
Typo.secondsToHMS = function (seconds) {
    if (typeof seconds === 'string') seconds = parseInt(seconds)

    var h = Math.floor(seconds / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var s = seconds % 60
    var time = ''

    if (h !== 0) {
        time += h + ':'
    }

    if (m < 10 && h !== 0) {
        time += '0' + m + ':'
    } else {
        time += m + ':'
    }

    if (s < 10) {
        time += '0' + s
    } else {
        time += s
    }

    return time
}

Typo.minutesToHMArray = function (minutes) {
    if (typeof minutes === 'string') minutes = parseInt(minutes)

    return [
        Math.floor(minutes / 60),
        Math.floor(minutes % 60)
    ]
}

/**
 *
 */
Typo.secondsTimestampToHM = function (seconds) {
    return Typo.dateToHM(
        new Date(seconds * 1000)
    )
}

/**
 * @pattern     object {yesterdayIn:[], timeAgo:[], todayIn:[]}
 * @declination object {day:[], hour:[], minute:[]}
 * @rightNow    string
 */
Typo.secondsToTimeAgo = function (seconds, pattern, declination, rightNow) {
    if (pattern === undefined) {
        pattern = {
            timeAgo: '$1 назад',
            todayIn: 'сегодня в $1',
            yesterdayIn: 'вчера в $1',
        }
    }
    if (declination === undefined) {
        declination = {
            minute: ['минуту', 'минуты', 'минут'],
            hour: ['час', 'часа', 'часов'],
            day: ['день', 'дня', 'дней'],
        }
    }
    if (rightNow === undefined) {
        rightNow = 'Только что'
    }

    var date = new Date(parseInt(seconds) * 1000)
    var minutesAgo = Math.round((new Date - date) / 3600000)
    var hoursAgo = Math.floor(minutesAgo / 60)
    var daysAgo = Math.floor(minutesAgo / 24)

    if (daysAgo === 1) {
        return Typo.pattern(
            pattern.yesterdayIn,
            Typo.dateToHM(date)
        )
    } else if (daysAgo > 1) {
        return Typo.pattern(
            pattern.timeAgo,
            daysAgo + ' ' + Typo.declination(daysAgo, declination.day)
        )
    } else if (hoursAgo > 10) {
        return Typo.pattern(
            pattern.todayIn,
            Typo.dateToHM(date)
        )
    } else if (hoursAgo > 0) {
        return Typo.pattern(
            pattern.timeAgo,
            hoursAgo + ' ' + Typo.declination(hoursAgo, declination.hour)
        )
    } else if (minutesAgo > 0) {
        return Typo.pattern(
            pattern.timeAgo,
            minutesAgo + ' ' + Typo.declination(minutesAgo, declination.minute)
        )
    } else {
        return rightNow
    }
}

/**
 *
 */
Typo.dateToHM = function (date) {
    return date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2)
}

/**
 *
 */
;(function () {

Typo.wordWrap = function (string) {
    var stringWrap = ''
    var partHasVowel = false
    var firstPart = true

    for (var i = 0, ii = string.length-1, symbol, nextSymbol, afterNextSymbol; i <= ii; i++) {
        symbol = string[i]
        stringWrap += symbol

        if (!isLetter(symbol) || i === ii) {
            partHasVowel = false
            firstPart = true
            continue
        }

        if (isVowel(symbol)) {
            partHasVowel = true
        }

        nextSymbol = string[i+1]

        if (!isLetter(nextSymbol)) {
            continue
        }

        afterNextSymbol = i+2 <= ii ? string[i+2] : ''

        if (!isLetter(afterNextSymbol)) {
            continue
        }

        if (
            isVowel(nextSymbol) && partHasVowel ||

            isConsonant(symbol) && symbol === nextSymbol && partHasVowel ||

            isConsonant(nextSymbol) && isVowel(afterNextSymbol) && partHasVowel ||

            firstPart && isVoicedConsonant(symbol) && isDeafConsonant(nextSymbol) &&
            isVoicedConsonant(afterNextSymbol) && partHasVowel
        ) {
            if (!( firstPart && (i == 0 || !isLetter(string[i-1])) )) {
                stringWrap += char.wbr
            }
            partHasVowel = false
            firstPart = false
        }
    }

    return stringWrap
}

Typo.longWordWrap = function (string) {
    var stringArray = string.split(' ')
    var wrapOnce = false

    for (var i = 0, ii = stringArray.length; i < ii; i++) {
        var word = stringArray[i]
        if (word.length >= 15 && word.indexOf('-') === -1) {
            stringArray[i] = Typo.wordWrap(word)
            wrapOnce = true
        }
    }

    return wrapOnce ? stringArray.join(' ') : string
}

function isVowel (symbol) {
    return symbol !== '' && vowels.indexOf(symbol.toLowerCase()) > -1
}
function isConsonant (symbol) {
    return symbol !== '' && consonants.indexOf(symbol.toLowerCase()) > -1
}
function isVoicedConsonant (symbol) {
    return symbol !== '' && voicedConsonants.indexOf(symbol.toLowerCase()) > -1
}
function isDeafConsonant (symbol) {
    return symbol !== '' && deafConsonants.indexOf(symbol.toLowerCase()) > -1
}
function isMute (symbol) {
    return symbol !== '' && mutes.indexOf(symbol.toLowerCase()) > -1
}
function isLetter (symbol) {
    return symbol !== '' && alphabet.indexOf(symbol.toLowerCase()) > -1
}

var alphabet ='абвгдеёжзийклмнопрстуфхцчшщъыьэюяabcdefghijklmnopqrstuvwxyz'
var vowels ='аяоёуюыиэеaeiouy'
var consonants ='бвгджзйклмнпрстфхцчшщbcdfghjklmnpqrstvwxz'
var voicedConsonants ='бвгджзйлмнрbdgjklmnrvwxz'
var deafConsonants ='пфктшсхцчшщcfhpqt'
var mutes ='ьъ'

})();

})();
/**
 * @lib ColorWiz Работа с цетом
 * @ver 0.1.1
 * @url github.yandex-team.ru/kovchiy/colorwiz
 */
'use strict';

var ColorWiz = {}

;(function () {

var MAX_DARK_BACKGROUND_BRIGHTNESS = .9
var MIN_BRIGHT_BACKGROUND_BRIGHTNESS = .6
var MAX_BRIGHT_BACKGROUND_BRIGHTNESS = .9
var MIN_CONTRAST = .7
var OPTIMAL_TITLE_CONTRAST = .85
var OPTIMAL_TEXT_CONTRAST = .75
var MIN_BRIGHTNESS_DIFF = .4
var DEFAULT_TEXT_OPACITY = .7
var BRIGHT_COLOR_LIMIT = .8
var QUALITY = 100
var SIMILAR_COLOR_DISTANCE = 100
var SHADE_COLOR_DISTANCE = 200

var options = {
    debug: false,
    backgroundPriority: 'dark', // dark, bright
}

function magic (url, callback, userOptions) {
    options = extend(userOptions, options)
    onImageLoad(
        url,
        function () {
            var canvas  = document.createElement('canvas')
            var context = canvas.getContext('2d')
            var width
            var height

            width = canvas.width = this.width
            height = canvas.height = this.height
            context.drawImage(this, 0, 0, width, height)

            var imageData = context.getImageData(0, 0, width, height).data
            var pixelCount = width * height
            var pixels = []
            var qxq = QUALITY * QUALITY
            var step = QUALITY < pixelCount ? Math.round(pixelCount / qxq) : 1

            for (var i = 0, offset; i < pixelCount; i += step) {
                offset = i * 4

                if (imageData[offset + 3] < 255) continue

                pixels.push([
                    imageData[offset],
                    imageData[offset + 1],
                    imageData[offset + 2]
                ])
            }

            var palette = pixelsPalette(pixels)
            var color = compatibleColors(options.debug ? palette.concat([]) : palette)

            if (options.debug) {
                callback(palette, color)
            } else {
                callback(color)
            }
        }
    )
}

function isFilled (url, callback) {
    onImageLoad(
        url,
        function () {
            var canvas  = document.createElement('canvas')
            var context = canvas.getContext('2d')
            var width
            var height

            width = canvas.width = this.width
            height = canvas.height = this.height
            context.drawImage(this, 0, 0, width, height)

            var leftTop = context.getImageData(0, 0, 1, 1).data
            var rightTop = context.getImageData(width-1, 0, 1, 1).data
            var leftBottom = context.getImageData(0, height-1, 1, 1).data
            var rightBottom = context.getImageData(width-1, height-1, 1, 1).data

            callback(
                !isWhiteOrTransparentPixel(leftTop) &&
                !isWhiteOrTransparentPixel(rightTop) &&
                !isWhiteOrTransparentPixel(leftBottom) &&
                !isWhiteOrTransparentPixel(rightBottom)
            )
        }
    )
}

function isWhiteOrTransparentPixel (px) {
    return px[0] > 250 && px[1] > 250 && px[2] > 250 || px[3] !== 255
}

function onImageLoad (url, callback) {
    var image = document.createElement('img')
    image.crossOrigin = 'Anonymous'
    image.src = url.replace(/^url\(/, '').replace(/\)$/, '')
    image.onload = callback
}

function pixelsPalette (pixels) {
    var similars = []

    for (var i = 0, ii = pixels.length, similarFound, pixel; i < ii; i++) {
        pixel = pixels[i]
        similarFound = false

        for (var j = 0, jj = similars.length; j < jj; j++) {
            if (distance(similars[j][0], pixel) <= SIMILAR_COLOR_DISTANCE) {
                similars[j][1]++
                similarFound = true
                break
            }
        }
        if (!similarFound) {
            similars.push([pixel, 1])
        }
    }

    similars.sort(function (a, b) {
        return b[1] - a[1]
    })

    var palette = []
    for (var i = 0, ii = similars.length; i < ii; i++) {
        palette.push(similars[i][0])
    }

    return palette
}

function compatibleColors (palette) {
    var backgroundColor
    var titleColor
    var textColor
    var buttonColor

    // Find background color in palette, that is not too close to white
    var i = 0
    var backgroundBrightness

    for (; i < palette.length; i++) {
        backgroundColor = palette[i]
        backgroundBrightness = brightness(palette[i])

        if (
            options.backgroundPriority === 'dark' &&
            backgroundBrightness <= MAX_DARK_BACKGROUND_BRIGHTNESS
        ) {
            break
        }

        if (
            options.backgroundPriority === 'bright' && (
                backgroundBrightness >= MIN_BRIGHT_BACKGROUND_BRIGHTNESS &&
                backgroundBrightness <= MAX_BRIGHT_BACKGROUND_BRIGHTNESS
            )
        ) {
            break
        }
    }

    palette.splice(i, 1)

    // Fallback text color depends on background brightness
    var backgroundIsBright = brightness(backgroundColor) > BRIGHT_COLOR_LIMIT
    var fallbackColor = backgroundIsBright ? [0,0,0] : [255,255,255]

    // Find palette colors with enough contrast width background color
    for (var i = 0, ii = palette.length, con, bri, color; i < ii; i++) {
        color = palette[i]
        con = contrast(backgroundColor, color)
        bri = brightnessDifference(backgroundColor, color)

        if (con < MIN_CONTRAST && bri < MIN_BRIGHTNESS_DIFF) {
            continue
        }
        if (!titleColor) {
            titleColor = color
            continue
        }
        if (!textColor) {
            textColor = color
        }
        if (titleColor && textColor) {
            break
        }
    }

    // If text is brighter then title, swap them
    var titleBrightness
    var textBrightness
    if (titleColor && textColor) {
        titleBrightness = brightness(titleColor)
        textBrightness = brightness(textColor)

        if ((backgroundIsBright && textBrightness < titleBrightness) || (!backgroundIsBright && textBrightness > titleBrightness)) {
            var tempColor = titleColor
            titleColor = textColor
            textColor = tempColor

            var tempColor = titleBrightness
            titleBrightness = textBrightness
            textBrightness = tempColor
        }
    }

    // Adjust text contrast for readability
    if (titleColor) titleColor = titleBrightness < BRIGHT_COLOR_LIMIT
        ? adjustDarknessFor(titleColor, backgroundColor, OPTIMAL_TITLE_CONTRAST)
        : adjustLightnessFor(titleColor, backgroundColor, OPTIMAL_TITLE_CONTRAST)

    if (textColor) textColor = textBrightness < BRIGHT_COLOR_LIMIT
        ? adjustDarknessFor(textColor, backgroundColor, OPTIMAL_TEXT_CONTRAST)
        : adjustLightnessFor(textColor, backgroundColor, OPTIMAL_TEXT_CONTRAST)

    // Fallback if colors not found
    if (!textColor) {
        if (!titleColor || contrast(titleColor, fallbackColor) < MIN_CONTRAST) {
            textColor = blend(fallbackColor, backgroundColor, DEFAULT_TEXT_OPACITY)
        } else {
            textColor = titleColor
            titleColor = fallbackColor
        }
    }
    if (!titleColor) {
        titleColor = fallbackColor
    }

    // Button color
    buttonColor = backgroundIsBright ? darken(backgroundColor, .15) : lighten(backgroundColor, .1)

    return {
        background: rgb2css(backgroundColor),
        title: rgb2css(titleColor),
        text: rgb2css(textColor),
        button: rgb2css(buttonColor)
    }
}

function isBright (rgb) {
    return brightness(rgb) > BRIGHT_COLOR_LIMIT
}

/**
 * Pythagorean Distance
 */
function distance (rgb1, rgb2) {
    var rd = rgb1[0] - rgb2[0]
    var gd = rgb1[1] - rgb2[1]
    var bd = rgb1[2] - rgb2[2]

    return Math.sqrt(rd*rd + gd*gd + bd*bd)
}

function blend (rgb1, rgb2, alpha) {
    return [
        Math.round(rgb1[0]*alpha + rgb2[0]*(1-alpha)),
        Math.round(rgb1[1]*alpha + rgb2[1]*(1-alpha)),
        Math.round(rgb1[2]*alpha + rgb2[2]*(1-alpha))
    ]
}

/**
 *
 */
function difference (rgb1, rgb2) {
    var diff = Math.max(rgb1[0], rgb2[0]) - Math.min(rgb1[0], rgb2[0]) +
               Math.max(rgb1[1], rgb2[1]) - Math.min(rgb1[1], rgb2[1]) +
               Math.max(rgb1[2], rgb2[2]) - Math.min(rgb1[2], rgb2[2])

    return diff / 765
}

function hueDifference (rgb1, rgb2) {
    var hsl1 = rgb2hsl(rgb1)
    var hsl2 = rgb2hsl(rgb2)

    return Math.abs(hsl1[0] - hsl2[0]) / 360
}

/**
 * return number 0..1
 */
function brightnessDifference (rgb1, rgb2) {
    return Math.abs(brightness(rgb1) - brightness(rgb2))
}

/**
 * return string #000000
 */
function rgb2css (rgb) {
    return '#' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1).toUpperCase()
}

/**
 * return number 0..1
 */
function luminance (rgb) {
    return 0.2126 * Math.pow(rgb[0]/255, 2.2) +
           0.7152 * Math.pow(rgb[1]/255, 2.2) +
           0.0722 * Math.pow(rgb[2]/255, 2.2)
}

/**
 * return number 0..1
 */
function readability (rgb1, rgb2) {
    var l1 = luminance(rgb1)
    var l2 = luminance(rgb2)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
};

/**
 * return number 0..1
 */
function contrast (rgb1, rgb2) {
    var l1 = luminance(rgb1)
    var l2 = luminance(rgb2)
    var contrast = l1 < l2
        ? 1 - (l1 + 0.05) / (l2 + 0.05)
        : 1 - (l2 + 0.05) / (l1 + 0.05)

    return contrast
}

function adjustLightnessFor (rgb1, rgb2, base) {
    return lighten(
        rgb1, base - contrast(rgb1, rgb2)
    )
}

function adjustDarknessFor (rgb1, rgb2, base) {
    return darken(
        rgb1, base - contrast(rgb1, rgb2)
    )
}

/**
 * return number 0..1
 */
function brightness (rgb) {
    return (299*rgb[0] + 587*rgb[1] + 114*rgb[2]) / 1000 / 255
}

function extend (actuals, defaults) {
    if (!actuals) return defaults

    var extended = {}

    for (key in defaults) {
        if (typeof actuals[key] !== 'undefined') {
            extended[key] = actuals[key]
        } else {
            extended[key] = defaults[key]
        }
    }

    return extended
}

function rgb2hsl (rgb) {
    var r = rgb[0] / 255
    var g = rgb[1] / 255
    var b = rgb[2] / 255

    var max = Math.max(r, g, b)
    var min = Math.min(r, g, b)
    var h
    var s
    var l = (max + min) / 2

    if (max === min) {
        h = s = 0
    } else {
        var d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        if (max === r) {
            h = (g - b) / d + (g < b ? 6 : 0)
        } else if (max === g) {
            h = (b - r) / d + 2
        } else if (max === b) {
            h = (r - g) / d + 4
        }

        h /= 6
    }

    return [
        unbound01(h, 360),
        unbound01(s, 100),
        unbound01(l, 100)
    ]
}

function hue2rgb (p, q, t) {
    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t
    if(t < 1/2) return q
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
}

function hsl2rgb (hsl) {
    var r
    var g
    var b

    var h = hsl[0] / 360
    var s = hsl[1] / 100
    var l = hsl[2] / 100

    if (s === 0) {
        r = g = b = l
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s
        var p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ]
}

function lighten (rgb, amount) {
    var hsl = rgb2hsl(rgb)

    hsl[2] += amount * 100
    hsl[2] = clamp (hsl[2], 100)

    return hsl2rgb(hsl)
}

function darken (rgb, amount) {
    var hsl = rgb2hsl(rgb)

    hsl[2] -= amount * 100
    hsl[2]  = clamp (hsl[2], 100)

    return hsl2rgb(hsl)
}

function brighten (rgb, amount) {
    var r = rgb[0]
    var g = rgb[1]
    var b = rgb[2]

    r = Math.max(0, Math.min(255, r - Math.round(255 * - (amount / 100))))
    g = Math.max(0, Math.min(255, g - Math.round(255 * - (amount / 100))))
    b = Math.max(0, Math.min(255, b - Math.round(255 * - (amount / 100))))

    return [r, g, b]
}

function clamp (value, base) {
    if (typeof base === 'undefined') base = 1
    return Math.min(base, Math.max(0, value))
}

function bound01(value, base) {
    return value / base
}

function unbound01(value, base) {
    return Math.round(value * base)
}

var regExpRgbString = /rgba?\(|\)|\s/g
function rgbString2rgbArray(string) {
    return string.replace(regExpRgbString,'').split(',').map(function (str) {
        return parseInt(str)
    })
}

function css2rgb (css) {
    if (css.length === 4) {
        var r = css[1]
        var g = css[2]
        var b = css[3]
        css = '#' + r + r + g + g + b + b
    }

    return [
        parseInt(css.substr(1,2), 16),
        parseInt(css.substr(3,2), 16),
        parseInt(css.substr(5,2), 16),
    ]
}


/*
 * Interface
 */
ColorWiz.darken = darken
ColorWiz.rgb2css = rgb2css
ColorWiz.css2rgb = css2rgb
ColorWiz.magic = magic
ColorWiz.brightness = brightness
ColorWiz.isBright = isBright
ColorWiz.rgbString2rgbArray = rgbString2rgbArray
ColorWiz.compatibleColors = compatibleColors
ColorWiz.isFilled = isFilled


})()
/**
 * @lib Ajax Асинхронные клиентские запросы
 * @ver 0.1.0
 * @arg {object} options {url:string, data:object, success:function, error:function, jsonp:boolean|string}
 */
function Ajax (options) {
    var qs = ''
    if (options.data) {
        for (var key in options.data) {
            qs += '&'+ key +'='+ encodeURIComponent(options.data[key])
        }
        qs = qs.substr(1)
    }

    if (options.jsonp) {
        var callbackName = typeof options.jsonp === 'string'
            ?  options.jsonp
            : 'jsonp_callback_' + Math.random().toString().substr(2)

        window[callbackName] = function (data) {
            delete window[callbackName]
            document.head.removeChild(script)
            options.success(data)
        }

        var script = document.createElement('script')
        script.src = options.url + '?' + qs + '&callback=' + callbackName
        script.onerror = options.error
        document.head.appendChild(script)
    } else {
        try {
            var xhr = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0')
            xhr.open('GET', options.url + (qs !== '' ? '?' + qs : ''), 1)
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
            xhr.onreadystatechange = function () {
                if (xhr.readyState > 3) {
                    if (xhr.status === 200) {
                        options.success && options.success(xhr.responseText, xhr)
                    } else {
                        options.error && options.error(xhr.responseText, xhr)
                    }
                }
            }
            xhr.send()
        } catch (e) {
            window.console && console.log(e)
        }
    }
}

/**
 * @lib MissEvent Расширение методов работы с DOM
 * @ver 0.8.0
 * @url github.yandex-team.ru/kovchiy/missevent
 */
;(function () {

var ua = navigator.userAgent

var opera = ua.toLowerCase().indexOf("op") > -1
var chrome = ua.indexOf('Chrome') > -1 && !opera
var explorer = ua.indexOf('MSIE') > -1
var firefox = ua.indexOf('Firefox') > -1
var safari = ua.indexOf("Safari") > -1 && !chrome

var mobile = ua.match(/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i) !== null
var android = ua.match(/Android/i) !== null

var href = window.location.href
var qsIndex = href.indexOf('?')
var qs = {}

if (qsIndex !== -1) {
    href.substring(qsIndex + 1).split('&').forEach(function (pair) {
        pair = pair.split('=')
        qs[pair[0]] = pair[1] === undefined ? '' : decodeURIComponent(pair[1])
    })

}

window.MissEvent = {
    /**
     * If mobile platform
     */
    mobile: mobile,
    android: android,
    ios: !android,

    /**
     * Current browser
     */
    chrome: chrome,
    explorer: explorer,
    firefox: firefox,
    safari: safari,
    opera: opera,

    /**
     * query string
     */
    qs: function (key, value) {
        if (value === undefined && typeof key === 'string') {
            return qs[key]
        } else {

            if (typeof key === 'string') {
                qs[key] = value
            } else {
                for (var i in key) qs[i] = key[i]
            }

            qsString = ''
            for (var key in qs) {
                if (qs[key] !== undefined && qs[key] !== '') {
                    qsString +=  '&' + key + '=' + qs[key]
                }
            }
            history.pushState(qs, document.title, window.location.pathname + '?' + qsString.substr(1))
        }
    },

    /**
     * Finger tap
     * @event tap
     * @domNode target
     */
    tap: function (domNode) {
        if (domNode.missEventTap) {
            return
        } else {
            domNode.missEventTap = true
        }

        if (!MissEvent.mobile) {
            return domNode.addEventListener('click', function (e) {
                this.dispatchEvent(new Event('tap'))
            })
        }

        var didTouch = false
        var didMove = false

        domNode.addEventListener('touchstart', function () {
            didTouch = true
            didMove = false
        })
        domNode.addEventListener('touchmove', function () {
            didTouch = false
            didMove = true
        })
        domNode.addEventListener('touchend', function (e) {
            if (didTouch && !didMove) {
                this.dispatchEvent(new Event('tap'))
                e.preventDefault()
            }
        })
    },

    /**
     * Horizontal swipe
     * @event     swipe    {delta: number, elasticDelta: number}
     * @event     didswipe {delta: number, elasticDelta: number, isFast: boolean}
     *
     * @domNode   target
     * @direction string   'horizontal', 'vertical'
     */
    swipe: function (domNode, direction, conditionCallback, fastSwipeTimeout, fastSwipeOffset) {
        if (domNode.missEventSwipe) {
            return
        } else {
            domNode.missEventSwipe = true
        }

        if (fastSwipeTimeout === undefined) fastSwipeTimeout = 500
        if (fastSwipeOffset === undefined) fastSwipeOffset = 15

        var didTouch = false
        var didFastSwipe = false
        var touchMoveDirection = ''
        var swipeTimeout = false
        var holdTime
        var elasticFactor = .2
        var fromX, fromY, toX, toY, deltaX, deltaY, delta, elasticDelta
        var willSwipe = false

        var parentWidth = domNode.offsetWidth
        var parentHeight = domNode.offsetHeight
        var parentOffsetLeft = domNode.offsetLeft
        var parentOffsetTop = domNode.offsetTop
        var parent = domNode

        while (parent = parent.offsetParent) {
            parentOffsetLeft += parent.offsetLeft
            parentOffsetTop += parent.offsetTop
        }

        domNode.addEventListener(MissEvent.mobile ? 'touchstart' : 'mousedown', function (e) {
            if (conditionCallback && !conditionCallback()) {
                return
            }

            didTouch = true
            fromX = e.touches ? e.touches[0].clientX : e.clientX
            fromY = e.touches ? e.touches[0].clientY : e.clientY
            delta = 0
            touchMoveDirection = ''
            holdTime = new Date
        })

        function move (e) {
            if (!didTouch) return

            holdTime = new Date

            toX = e.touches ? e.touches[0].clientX : e.clientX
            toY = e.touches ? e.touches[0].clientY : e.clientY

            deltaX = toX - fromX
            deltaY = toY - fromY

            if (touchMoveDirection === '') {
                touchMoveDirection = Math.abs(deltaX) < Math.abs(deltaY) ? 'vertical' : 'horizontal'
            }

            if (touchMoveDirection === direction) {
                e.preventDefault()

                if (willSwipe === false) {
                    willSwipe = true
                    domNode.dispatchEvent(
                        new CustomEvent('willswipe')
                    )
                }

                if (!swipeTimeout) {
                    didFastSwipe = true
                    swipeTimeout = setTimeout(function () {didFastSwipe = false}, fastSwipeTimeout)
                }

                delta = direction === 'horizontal' ?  deltaX : deltaY

                domNode.dispatchEvent(
                    new CustomEvent(
                        'swipe', {
                            detail: {
                                x: toX - parentOffsetLeft,
                                y: toY - parentOffsetTop,
                                delta: delta,
                                width: parentWidth,
                                height: parentHeight,
                                elasticFactor: elasticFactor
                            }
                        }
                    )
                )
            }
        }

        if (MissEvent.mobile) {
            domNode.addEventListener('touchmove', move)
        } else {
            window.addEventListener('mousemove', move)
        }

        function end (e) {
            if (!didTouch) return

            if (didTouch && !touchMoveDirection) {
                domNode.dispatchEvent(
                    new CustomEvent(
                         'swipefail', {
                            detail: {
                                x: fromX - parentOffsetLeft,
                                y: fromY - parentOffsetTop,
                                width: parentWidth,
                                height: parentHeight,
                            }
                        }
                    )
                )
            } else if (didTouch && touchMoveDirection === direction) {
                domNode.dispatchEvent(
                    new CustomEvent(
                         'didswipe', {
                            detail: {
                                x: toX - parentOffsetLeft,
                                y: toY - parentOffsetTop,
                                width: parentWidth,
                                height: parentHeight,
                                delta: delta,
                                elasticFactor: elasticFactor,
                                holdTime: new Date - holdTime,
                                isFast: didFastSwipe && Math.abs(delta) >= fastSwipeOffset,
                            }
                        }
                    )
                )
            }

            if (swipeTimeout) clearTimeout(swipeTimeout)

            didTouch = false
            didFastSwipe = false
            touchMoveDirection = false
            swipeTimeout = false
            willSwipe = false
        }

        if (MissEvent.mobile) {
            domNode.addEventListener('touchend', end)
        } else {
            window.addEventListener('mouseup', end)
        }
    },

    horizontalSwipe: function (domNode, conditionCallback, fastSwipeTimeout, fastSwipeOffset) {
        this.swipe(domNode, 'horizontal', conditionCallback, fastSwipeTimeout, fastSwipeOffset)
    },
    verticalSwipe: function (domNode, conditionCallback, fastSwipeTimeout, fastSwipeOffset) {
        this.swipe(domNode, 'vertical', conditionCallback, fastSwipeTimeout, fastSwipeOffset)
    },

    /**
     * Horizontal scroll visibility
     * @events visible, invisible
     * @domNode target
     * @parent container to scroll (window is default)
     */
    visible: function (domNode, conditionCallback, parent) {
        if (parent === undefined) {
            parent = window
        }

        var offsetTop = MissEvent.offset(domNode).top
        var offsetBottom = offsetTop + domNode.offsetHeight
        var visible

        function checkVisibility () {
            if (conditionCallback && !conditionCallback()) {
                if (visible !== false) {
                    domNode.dispatchEvent(new Event('invisible'))
                    visible = false
                }
                return
            }

            var scrollTop = (parent === window ? document.body : parent).scrollTop
            var scrollBottom = scrollTop + parent.innerHeight

            if (scrollBottom > offsetTop && scrollTop < offsetBottom) {
                if (visible !== true) {
                    domNode.dispatchEvent(new Event('visible'))
                    visible = true
                }
            } else {
                if (visible !== false) {
                    domNode.dispatchEvent(new Event('invisible'))
                    visible = false
                }
            }
        }

        parent.addEventListener('scroll', checkVisibility)
        checkVisibility()
    },

    offset: function (domNode) {
        if (domNode.offsetParent === null) {
            return undefined
        }

        var offsetTop = 0
        var offsetLeft = 0

        while (domNode.offsetParent !== null) {
            offsetTop += domNode.offsetTop
            offsetLeft += domNode.offsetLeft
            domNode = domNode.offsetParent
        }

        return {
            top: offsetTop,
            left: offsetLeft
        }
    },
}

})();
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).emailjs=e()}}(function(){return function i(u,s,c){function a(t,e){if(!s[t]){if(!u[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(l)return l(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var o=s[t]={exports:{}};u[t][0].call(o.exports,function(e){return a(u[t][1][e]||e)},o,o.exports,i,u,s,c)}return s[t].exports}for(var l="function"==typeof require&&require,e=0;e<c.length;e++)a(c[e]);return a}({1:[function(e,t,n){var r,o,i=t.exports={};function u(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function c(t){if(r===setTimeout)return setTimeout(t,0);if((r===u||!r)&&setTimeout)return r=setTimeout,setTimeout(t,0);try{return r(t,0)}catch(e){try{return r.call(null,t,0)}catch(e){return r.call(this,t,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:u}catch(e){r=u}try{o="function"==typeof clearTimeout?clearTimeout:s}catch(e){o=s}}();var a,l=[],f=!1,d=-1;function p(){f&&a&&(f=!1,a.length?l=a.concat(l):d=-1,l.length&&m())}function m(){if(!f){var e=c(p);f=!0;for(var t=l.length;t;){for(a=l,l=[];++d<t;)a&&a[d].run();d=-1,t=l.length}a=null,f=!1,function(t){if(o===clearTimeout)return clearTimeout(t);if((o===s||!o)&&clearTimeout)return o=clearTimeout,clearTimeout(t);try{o(t)}catch(e){try{return o.call(null,t)}catch(e){return o.call(this,t)}}}(e)}}function h(e,t){this.fun=e,this.array=t}function v(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(1<arguments.length)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];l.push(new h(e,t)),1!==l.length||f||c(m)},h.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=v,i.addListener=v,i.once=v,i.off=v,i.removeListener=v,i.removeAllListeners=v,i.emit=v,i.prependListener=v,i.prependOnceListener=v,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},{}],2:[function(e,t,n){(function(p,m){(function(){(function(){"use strict";function e(t){var n=this.constructor;return this.then(function(e){return n.resolve(t()).then(function(){return e})},function(e){return n.resolve(t()).then(function(){return n.reject(e)})})}function t(n){return new this(function(r,e){if(!n||void 0===n.length)return e(new TypeError(typeof n+" "+n+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var o=Array.prototype.slice.call(n);if(0===o.length)return r([]);var i=o.length;function u(t,e){if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if("function"==typeof n)return void n.call(e,function(e){u(t,e)},function(e){o[t]={status:"rejected",reason:e},0==--i&&r(o)})}o[t]={status:"fulfilled",value:e},0==--i&&r(o)}for(var t=0;t<o.length;t++)u(t,o[t])})}var n=setTimeout;function c(e){return Boolean(e&&void 0!==e.length)}function r(){}function i(e){if(!(this instanceof i))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(e,this)}function o(n,r){for(;3===n._state;)n=n._value;0!==n._state?(n._handled=!0,i._immediateFn(function(){var e=1===n._state?r.onFulfilled:r.onRejected;if(null!==e){var t;try{t=e(n._value)}catch(e){return void s(r.promise,e)}u(r.promise,t)}else(1===n._state?u:s)(r.promise,n._value)})):n._deferreds.push(r)}function u(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if(e instanceof i)return t._state=3,t._value=e,void a(t);if("function"==typeof n)return void f(function(e,t){return function(){e.apply(t,arguments)}}(n,e),t)}t._state=1,t._value=e,a(t)}catch(e){s(t,e)}}function s(e,t){e._state=2,e._value=t,a(e)}function a(e){2===e._state&&0===e._deferreds.length&&i._immediateFn(function(){e._handled||i._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;t<n;t++)o(e,e._deferreds[t]);e._deferreds=null}function l(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}function f(e,t){var n=!1;try{e(function(e){n||(n=!0,u(t,e))},function(e){n||(n=!0,s(t,e))})}catch(e){if(n)return;n=!0,s(t,e)}}i.prototype.catch=function(e){return this.then(null,e)},i.prototype.then=function(e,t){var n=new this.constructor(r);return o(this,new l(e,t,n)),n},i.prototype.finally=e,i.all=function(t){return new i(function(r,o){if(!c(t))return o(new TypeError("Promise.all accepts an array"));var i=Array.prototype.slice.call(t);if(0===i.length)return r([]);var u=i.length;function s(t,e){try{if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if("function"==typeof n)return void n.call(e,function(e){s(t,e)},o)}i[t]=e,0==--u&&r(i)}catch(e){o(e)}}for(var e=0;e<i.length;e++)s(e,i[e])})},i.allSettled=t,i.resolve=function(t){return t&&"object"==typeof t&&t.constructor===i?t:new i(function(e){e(t)})},i.reject=function(n){return new i(function(e,t){t(n)})},i.race=function(o){return new i(function(e,t){if(!c(o))return t(new TypeError("Promise.race accepts an array"));for(var n=0,r=o.length;n<r;n++)i.resolve(o[n]).then(e,t)})},i._immediateFn="function"==typeof m&&function(e){m(e)}||function(e){n(e,0)},i._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};var d=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if(void 0!==p)return p;throw new Error("unable to locate global object")}();"function"!=typeof d.Promise?d.Promise=i:d.Promise.prototype.finally?d.Promise.allSettled||(d.Promise.allSettled=t):d.Promise.prototype.finally=e})()}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("timers").setImmediate)},{timers:3}],3:[function(c,e,a){(function(n,s){(function(){var r=c("process/browser.js").nextTick,e=Function.prototype.apply,o=Array.prototype.slice,i={},u=0;function t(e,t){this._id=e,this._clearFn=t}a.setTimeout=function(){return new t(e.call(setTimeout,window,arguments),clearTimeout)},a.setInterval=function(){return new t(e.call(setInterval,window,arguments),clearInterval)},a.clearTimeout=a.clearInterval=function(e){e.close()},t.prototype.unref=t.prototype.ref=function(){},t.prototype.close=function(){this._clearFn.call(window,this._id)},a.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},a.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},a._unrefActive=a.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;0<=t&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},a.setImmediate="function"==typeof n?n:function(e){var t=u++,n=!(arguments.length<2)&&o.call(arguments,1);return i[t]=!0,r(function(){i[t]&&(n?e.apply(null,n):e.call(null),a.clearImmediate(t))}),t},a.clearImmediate="function"==typeof s?s:function(e){delete i[e]}}).call(this)}).call(this,c("timers").setImmediate,c("timers").clearImmediate)},{"process/browser.js":1,timers:3}],4:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.EmailJSResponseStatus=n.sendForm=n.send=n.init=void 0;var s=e("./models/EmailJSResponseStatus");Object.defineProperty(n,"EmailJSResponseStatus",{enumerable:!0,get:function(){return s.EmailJSResponseStatus}});var i=e("./services/ui/UI"),u=null,c="https://api.emailjs.com";function a(o,i,u){return void 0===u&&(u={}),new Promise(function(n,r){var e=new XMLHttpRequest;for(var t in e.addEventListener("load",function(e){var t=new s.EmailJSResponseStatus(e.target);200===t.status||"OK"===t.text?n(t):r(t)}),e.addEventListener("error",function(e){r(new s.EmailJSResponseStatus(e.target))}),e.open("POST",o,!0),u)e.setRequestHeader(t,u[t]);e.send(i)})}function r(e,t){u=e,c=t||"https://api.emailjs.com"}function o(e,t,n,r){var o={lib_version:"2.6.4",user_id:r||u,service_id:e,template_id:t,template_params:function(e){var t=document&&document.getElementById("g-recaptcha-response");return t&&t.value&&(e["g-recaptcha-response"]=t.value),t=null,e}(n)};return a(c+"/api/v1.0/email/send",JSON.stringify(o),{"Content-type":"application/json"})}function l(e,t,n,r){if("string"==typeof n&&(n=document.querySelector(function(e){return"#"!==e[0]&&"."!==e[0]?"#"+e:e}(n))),!n||"FORM"!==n.nodeName)throw"Expected the HTML form element or the style selector of form";i.UI.progressState(n);var o=new FormData(n);return o.append("lib_version","2.6.4"),o.append("service_id",e),o.append("template_id",t),o.append("user_id",r||u),a(c+"/api/v1.0/email/send-form",o).then(function(e){return i.UI.successState(n),e},function(e){return i.UI.errorState(n),Promise.reject(e)})}n.init=r,n.send=o,n.sendForm=l,n.default={init:r,send:o,sendForm:l}},{"./models/EmailJSResponseStatus":5,"./services/ui/UI":6}],5:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.EmailJSResponseStatus=void 0;var r=function(e){this.status=e.status,this.text=e.responseText};n.EmailJSResponseStatus=r},{}],6:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.UI=void 0;var r=function(){function e(){}return e.clearAll=function(e){e.classList.remove(this.PROGRESS),e.classList.remove(this.DONE),e.classList.remove(this.ERROR)},e.progressState=function(e){this.clearAll(e),e.classList.add(this.PROGRESS)},e.successState=function(e){e.classList.remove(this.PROGRESS),e.classList.add(this.DONE)},e.errorState=function(e){e.classList.remove(this.PROGRESS),e.classList.add(this.ERROR)},e.PROGRESS="emailjs-sending",e.DONE="emailjs-success",e.ERROR="emailjs-error",e}();n.UI=r},{}]},{},[4,2])(4)});
"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _possibleConstructorReturn(e,t){return!t||"object"!==_typeof(t)&&"function"!=typeof t?_assertThisInitialized(e):t}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}var Emitter=function(){function e(){_classCallCheck(this,e)}return _createClass(e,[{key:"on",value:function(e,t){return this._callbacks=this._callbacks||{},this._callbacks[e]||(this._callbacks[e]=[]),this._callbacks[e].push(t),this}},{key:"emit",value:function(e){this._callbacks=this._callbacks||{};var t=this._callbacks[e];if(t){for(var n=arguments.length,i=new Array(1<n?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];var o=!0,a=!1,l=void 0;try{for(var s,u=t[Symbol.iterator]();!(o=(s=u.next()).done);o=!0){s.value.apply(this,i)}}catch(e){a=!0,l=e}finally{try{o||null==u.return||u.return()}finally{if(a)throw l}}}return this}},{key:"off",value:function(e,t){if(!this._callbacks||0===arguments.length)return this._callbacks={},this;var n=this._callbacks[e];if(!n)return this;if(1===arguments.length)return delete this._callbacks[e],this;for(var i=0;i<n.length;i++){if(n[i]===t){n.splice(i,1);break}}return this}}]),e}(),Dropzone=function(){function C(e,t){var n,i,r;if(_classCallCheck(this,C),(n=_possibleConstructorReturn(this,_getPrototypeOf(C).call(this))).element=e,n.version=C.version,n.defaultOptions.previewTemplate=n.defaultOptions.previewTemplate.replace(/\n*/g,""),n.clickableElements=[],n.listeners=[],n.files=[],"string"==typeof n.element&&(n.element=document.querySelector(n.element)),!n.element||null==n.element.nodeType)throw new Error("Invalid dropzone element.");if(n.element.dropzone)throw new Error("Dropzone already attached.");C.instances.push(_assertThisInitialized(n)),n.element.dropzone=_assertThisInitialized(n);var o=null!=(r=C.optionsForElement(n.element))?r:{};if(n.options=C.extend({},n.defaultOptions,o,null!=t?t:{}),n.options.forceFallback||!C.isBrowserSupported())return _possibleConstructorReturn(n,n.options.fallback.call(_assertThisInitialized(n)));if(null==n.options.url&&(n.options.url=n.element.getAttribute("action")),!n.options.url)throw new Error("No URL provided.");if(n.options.acceptedFiles&&n.options.acceptedMimeTypes)throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");if(n.options.uploadMultiple&&n.options.chunking)throw new Error("You cannot set both: uploadMultiple and chunking.");return n.options.acceptedMimeTypes&&(n.options.acceptedFiles=n.options.acceptedMimeTypes,delete n.options.acceptedMimeTypes),null!=n.options.renameFilename&&(n.options.renameFile=function(e){return n.options.renameFilename.call(_assertThisInitialized(n),e.name,e)}),n.options.method=n.options.method.toUpperCase(),(i=n.getExistingFallback())&&i.parentNode&&i.parentNode.removeChild(i),!1!==n.options.previewsContainer&&(n.options.previewsContainer?n.previewsContainer=C.getElement(n.options.previewsContainer,"previewsContainer"):n.previewsContainer=n.element),n.options.clickable&&(!0===n.options.clickable?n.clickableElements=[n.element]:n.clickableElements=C.getElements(n.options.clickable,"clickable")),n.init(),n}return _inherits(C,Emitter),_createClass(C,null,[{key:"initClass",value:function(){this.prototype.Emitter=Emitter,this.prototype.events=["drop","dragstart","dragend","dragenter","dragover","dragleave","addedfile","addedfiles","removedfile","thumbnail","error","errormultiple","processing","processingmultiple","uploadprogress","totaluploadprogress","sending","sendingmultiple","success","successmultiple","canceled","canceledmultiple","complete","completemultiple","reset","maxfilesexceeded","maxfilesreached","queuecomplete"],this.prototype.defaultOptions={url:null,method:"post",withCredentials:!1,timeout:3e4,parallelUploads:2,uploadMultiple:!1,chunking:!1,forceChunking:!1,chunkSize:2e6,parallelChunkUploads:!1,retryChunks:!1,retryChunksLimit:3,maxFilesize:256,paramName:"file",createImageThumbnails:!0,maxThumbnailFilesize:10,thumbnailWidth:120,thumbnailHeight:120,thumbnailMethod:"crop",resizeWidth:null,resizeHeight:null,resizeMimeType:null,resizeQuality:.8,resizeMethod:"contain",filesizeBase:1e3,maxFiles:null,headers:null,clickable:!0,ignoreHiddenFiles:!0,acceptedFiles:null,acceptedMimeTypes:null,autoProcessQueue:!0,autoQueue:!0,addRemoveLinks:!1,previewsContainer:null,hiddenInputContainer:"body",capture:null,renameFilename:null,renameFile:null,forceFallback:!1,dictDefaultMessage:"Drop files here to upload",dictFallbackMessage:"Your browser does not support drag'n'drop file uploads.",dictFallbackText:"Please use the fallback form below to upload your files like in the olden days.",dictFileTooBig:"File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",dictInvalidFileType:"You can't upload files of this type.",dictResponseError:"Server responded with {{statusCode}} code.",dictCancelUpload:"Cancel upload",dictUploadCanceled:"Upload canceled.",dictCancelUploadConfirmation:"Are you sure you want to cancel this upload?",dictRemoveFile:"Remove file",dictRemoveFileConfirmation:null,dictMaxFilesExceeded:"You can not upload any more files.",dictFileSizeUnits:{tb:"TB",gb:"GB",mb:"MB",kb:"KB",b:"b"},init:function(){},params:function(e,t,n){if(n)return{dzuuid:n.file.upload.uuid,dzchunkindex:n.index,dztotalfilesize:n.file.size,dzchunksize:this.options.chunkSize,dztotalchunkcount:n.file.upload.totalChunkCount,dzchunkbyteoffset:n.index*this.options.chunkSize}},accept:function(e,t){return t()},chunksUploaded:function(e,t){t()},fallback:function(){var e;this.element.className="".concat(this.element.className," dz-browser-not-supported");var t=!0,n=!1,i=void 0;try{for(var r,o=this.element.getElementsByTagName("div")[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;if(/(^| )dz-message($| )/.test(a.className)){(e=a).className="dz-message";break}}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}e||(e=C.createElement('<div class="dz-message"><span></span></div>'),this.element.appendChild(e));var l=e.getElementsByTagName("span")[0];return l&&(null!=l.textContent?l.textContent=this.options.dictFallbackMessage:null!=l.innerText&&(l.innerText=this.options.dictFallbackMessage)),this.element.appendChild(this.getFallbackForm())},resize:function(e,t,n,i){var r={srcX:0,srcY:0,srcWidth:e.width,srcHeight:e.height},o=e.width/e.height;null==t&&null==n?(t=r.srcWidth,n=r.srcHeight):null==t?t=n*o:null==n&&(n=t/o);var a=(t=Math.min(t,r.srcWidth))/(n=Math.min(n,r.srcHeight));if(r.srcWidth>t||r.srcHeight>n)if("crop"===i)a<o?(r.srcHeight=e.height,r.srcWidth=r.srcHeight*a):(r.srcWidth=e.width,r.srcHeight=r.srcWidth/a);else{if("contain"!==i)throw new Error("Unknown resizeMethod '".concat(i,"'"));a<o?n=t/o:t=n*o}return r.srcX=(e.width-r.srcWidth)/2,r.srcY=(e.height-r.srcHeight)/2,r.trgWidth=t,r.trgHeight=n,r},transformFile:function(e,t){return(this.options.resizeWidth||this.options.resizeHeight)&&e.type.match(/image.*/)?this.resizeImage(e,this.options.resizeWidth,this.options.resizeHeight,this.options.resizeMethod,t):t(e)},previewTemplate:'<div class="dz-preview dz-file-preview">\n  <div class="dz-image"><img data-dz-thumbnail /></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename"><span data-dz-name></span></div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n      <title>Check</title>\n      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n      <title>Error</title>\n      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n        <g stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>',drop:function(){return this.element.classList.remove("dz-drag-hover")},dragstart:function(){},dragend:function(){return this.element.classList.remove("dz-drag-hover")},dragenter:function(){return this.element.classList.add("dz-drag-hover")},dragover:function(){return this.element.classList.add("dz-drag-hover")},dragleave:function(){return this.element.classList.remove("dz-drag-hover")},paste:function(){},reset:function(){return this.element.classList.remove("dz-started")},addedfile:function(t){var n=this;if(this.element===this.previewsContainer&&this.element.classList.add("dz-started"),this.previewsContainer){t.previewElement=C.createElement(this.options.previewTemplate.trim()),t.previewTemplate=t.previewElement,this.previewsContainer.appendChild(t.previewElement);var e=!0,i=!1,r=void 0;try{for(var o,a=t.previewElement.querySelectorAll("[data-dz-name]")[Symbol.iterator]();!(e=(o=a.next()).done);e=!0){var l=o.value;l.textContent=t.name}}catch(e){i=!0,r=e}finally{try{e||null==a.return||a.return()}finally{if(i)throw r}}var s=!0,u=!1,c=void 0;try{for(var d,p=t.previewElement.querySelectorAll("[data-dz-size]")[Symbol.iterator]();!(s=(d=p.next()).done);s=!0)(l=d.value).innerHTML=this.filesize(t.size)}catch(e){u=!0,c=e}finally{try{s||null==p.return||p.return()}finally{if(u)throw c}}this.options.addRemoveLinks&&(t._removeLink=C.createElement('<a class="dz-remove" href="javascript:undefined;" data-dz-remove>'.concat(this.options.dictRemoveFile,"</a>")),t.previewElement.appendChild(t._removeLink));var h=function(e){return e.preventDefault(),e.stopPropagation(),t.status===C.UPLOADING?C.confirm(n.options.dictCancelUploadConfirmation,function(){return n.removeFile(t)}):n.options.dictRemoveFileConfirmation?C.confirm(n.options.dictRemoveFileConfirmation,function(){return n.removeFile(t)}):n.removeFile(t)},f=!0,v=!1,m=void 0;try{for(var y,g=t.previewElement.querySelectorAll("[data-dz-remove]")[Symbol.iterator]();!(f=(y=g.next()).done);f=!0){y.value.addEventListener("click",h)}}catch(e){v=!0,m=e}finally{try{f||null==g.return||g.return()}finally{if(v)throw m}}}},removedfile:function(e){return null!=e.previewElement&&null!=e.previewElement.parentNode&&e.previewElement.parentNode.removeChild(e.previewElement),this._updateMaxFilesReachedClass()},thumbnail:function(e,t){if(e.previewElement){e.previewElement.classList.remove("dz-file-preview");var n=!0,i=!1,r=void 0;try{for(var o,a=e.previewElement.querySelectorAll("[data-dz-thumbnail]")[Symbol.iterator]();!(n=(o=a.next()).done);n=!0){var l=o.value;l.alt=e.name,l.src=t}}catch(e){i=!0,r=e}finally{try{n||null==a.return||a.return()}finally{if(i)throw r}}return setTimeout(function(){return e.previewElement.classList.add("dz-image-preview")},1)}},error:function(e,t){if(e.previewElement){e.previewElement.classList.add("dz-error"),"String"!=typeof t&&t.error&&(t=t.error);var n=!0,i=!1,r=void 0;try{for(var o,a=e.previewElement.querySelectorAll("[data-dz-errormessage]")[Symbol.iterator]();!(n=(o=a.next()).done);n=!0){o.value.textContent=t}}catch(e){i=!0,r=e}finally{try{n||null==a.return||a.return()}finally{if(i)throw r}}}},errormultiple:function(){},processing:function(e){if(e.previewElement&&(e.previewElement.classList.add("dz-processing"),e._removeLink))return e._removeLink.innerHTML=this.options.dictCancelUpload},processingmultiple:function(){},uploadprogress:function(e,t){if(e.previewElement){var n=!0,i=!1,r=void 0;try{for(var o,a=e.previewElement.querySelectorAll("[data-dz-uploadprogress]")[Symbol.iterator]();!(n=(o=a.next()).done);n=!0){var l=o.value;"PROGRESS"===l.nodeName?l.value=t:l.style.width="".concat(t,"%")}}catch(e){i=!0,r=e}finally{try{n||null==a.return||a.return()}finally{if(i)throw r}}}},totaluploadprogress:function(){},sending:function(){},sendingmultiple:function(){},success:function(e){if(e.previewElement)return e.previewElement.classList.add("dz-success")},successmultiple:function(){},canceled:function(e){return this.emit("error",e,this.options.dictUploadCanceled)},canceledmultiple:function(){},complete:function(e){if(e._removeLink&&(e._removeLink.innerHTML=this.options.dictRemoveFile),e.previewElement)return e.previewElement.classList.add("dz-complete")},completemultiple:function(){},maxfilesexceeded:function(){},maxfilesreached:function(){},queuecomplete:function(){},addedfiles:function(){}},this.prototype._thumbnailQueue=[],this.prototype._processingThumbnail=!1}},{key:"extend",value:function(e){for(var t=arguments.length,n=new Array(1<t?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];for(var r=0,o=n;r<o.length;r++){var a=o[r];for(var l in a){var s=a[l];e[l]=s}}return e}}]),_createClass(C,[{key:"getAcceptedFiles",value:function(){return this.files.filter(function(e){return e.accepted}).map(function(e){return e})}},{key:"getRejectedFiles",value:function(){return this.files.filter(function(e){return!e.accepted}).map(function(e){return e})}},{key:"getFilesWithStatus",value:function(t){return this.files.filter(function(e){return e.status===t}).map(function(e){return e})}},{key:"getQueuedFiles",value:function(){return this.getFilesWithStatus(C.QUEUED)}},{key:"getUploadingFiles",value:function(){return this.getFilesWithStatus(C.UPLOADING)}},{key:"getAddedFiles",value:function(){return this.getFilesWithStatus(C.ADDED)}},{key:"getActiveFiles",value:function(){return this.files.filter(function(e){return e.status===C.UPLOADING||e.status===C.QUEUED}).map(function(e){return e})}},{key:"init",value:function(){var s=this;if("form"===this.element.tagName&&this.element.setAttribute("enctype","multipart/form-data"),this.element.classList.contains("dropzone")&&!this.element.querySelector(".dz-message")&&this.element.appendChild(C.createElement('<div class="dz-default dz-message"><button class="dz-button" type="button">'.concat(this.options.dictDefaultMessage,"</button></div>"))),this.clickableElements.length){!function l(){return s.hiddenFileInput&&s.hiddenFileInput.parentNode.removeChild(s.hiddenFileInput),s.hiddenFileInput=document.createElement("input"),s.hiddenFileInput.setAttribute("type","file"),(null===s.options.maxFiles||1<s.options.maxFiles)&&s.hiddenFileInput.setAttribute("multiple","multiple"),s.hiddenFileInput.className="dz-hidden-input",null!==s.options.acceptedFiles&&s.hiddenFileInput.setAttribute("accept",s.options.acceptedFiles),null!==s.options.capture&&s.hiddenFileInput.setAttribute("capture",s.options.capture),s.hiddenFileInput.style.visibility="hidden",s.hiddenFileInput.style.position="absolute",s.hiddenFileInput.style.top="0",s.hiddenFileInput.style.left="0",s.hiddenFileInput.style.height="0",s.hiddenFileInput.style.width="0",C.getElement(s.options.hiddenInputContainer,"hiddenInputContainer").appendChild(s.hiddenFileInput),s.hiddenFileInput.addEventListener("change",function(){var e=s.hiddenFileInput.files;if(e.length){var t=!0,n=!1,i=void 0;try{for(var r,o=e[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;s.addFile(a)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}}return s.emit("addedfiles",e),l()})}()}this.URL=null!==window.URL?window.URL:window.webkitURL;var e=!0,t=!1,n=void 0;try{for(var i,r=this.events[Symbol.iterator]();!(e=(i=r.next()).done);e=!0){var o=i.value;this.on(o,this.options[o])}}catch(e){t=!0,n=e}finally{try{e||null==r.return||r.return()}finally{if(t)throw n}}this.on("uploadprogress",function(){return s.updateTotalUploadProgress()}),this.on("removedfile",function(){return s.updateTotalUploadProgress()}),this.on("canceled",function(e){return s.emit("complete",e)}),this.on("complete",function(e){if(0===s.getAddedFiles().length&&0===s.getUploadingFiles().length&&0===s.getQueuedFiles().length)return setTimeout(function(){return s.emit("queuecomplete")},0)});function a(e){var t;return(t=e).dataTransfer.types&&t.dataTransfer.types.some(function(e){return"Files"==e})&&(e.stopPropagation(),e.preventDefault?e.preventDefault():e.returnValue=!1)}return this.listeners=[{element:this.element,events:{dragstart:function(e){return s.emit("dragstart",e)},dragenter:function(e){return a(e),s.emit("dragenter",e)},dragover:function(e){var t;try{t=e.dataTransfer.effectAllowed}catch(e){}return e.dataTransfer.dropEffect="move"===t||"linkMove"===t?"move":"copy",a(e),s.emit("dragover",e)},dragleave:function(e){return s.emit("dragleave",e)},drop:function(e){return a(e),s.drop(e)},dragend:function(e){return s.emit("dragend",e)}}}],this.clickableElements.forEach(function(t){return s.listeners.push({element:t,events:{click:function(e){return t===s.element&&e.target!==s.element&&!C.elementInside(e.target,s.element.querySelector(".dz-message"))||s.hiddenFileInput.click(),!0}}})}),this.enable(),this.options.init.call(this)}},{key:"destroy",value:function(){return this.disable(),this.removeAllFiles(!0),null!=this.hiddenFileInput&&this.hiddenFileInput.parentNode&&(this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput),this.hiddenFileInput=null),delete this.element.dropzone,C.instances.splice(C.instances.indexOf(this),1)}},{key:"updateTotalUploadProgress",value:function(){var e,t=0,n=0;if(this.getActiveFiles().length){var i=!0,r=!1,o=void 0;try{for(var a,l=this.getActiveFiles()[Symbol.iterator]();!(i=(a=l.next()).done);i=!0){var s=a.value;t+=s.upload.bytesSent,n+=s.upload.total}}catch(e){r=!0,o=e}finally{try{i||null==l.return||l.return()}finally{if(r)throw o}}e=100*t/n}else e=100;return this.emit("totaluploadprogress",e,n,t)}},{key:"_getParamName",value:function(e){return"function"==typeof this.options.paramName?this.options.paramName(e):"".concat(this.options.paramName).concat(this.options.uploadMultiple?"[".concat(e,"]"):"")}},{key:"_renameFile",value:function(e){return"function"!=typeof this.options.renameFile?e.name:this.options.renameFile(e)}},{key:"getFallbackForm",value:function(){var e,t;if(e=this.getExistingFallback())return e;var n='<div class="dz-fallback">';this.options.dictFallbackText&&(n+="<p>".concat(this.options.dictFallbackText,"</p>")),n+='<input type="file" name="'.concat(this._getParamName(0),'" ').concat(this.options.uploadMultiple?'multiple="multiple"':void 0,' /><input type="submit" value="Upload!"></div>');var i=C.createElement(n);return"FORM"!==this.element.tagName?(t=C.createElement('<form action="'.concat(this.options.url,'" enctype="multipart/form-data" method="').concat(this.options.method,'"></form>'))).appendChild(i):(this.element.setAttribute("enctype","multipart/form-data"),this.element.setAttribute("method",this.options.method)),null!=t?t:i}},{key:"getExistingFallback",value:function(){for(var e=function(e){var t=!0,n=!1,i=void 0;try{for(var r,o=e[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;if(/(^| )fallback($| )/.test(a.className))return a}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}},t=0,n=["div","form"];t<n.length;t++){var i,r=n[t];if(i=e(this.element.getElementsByTagName(r)))return i}}},{key:"setupEventListeners",value:function(){return this.listeners.map(function(i){return function(){var e=[];for(var t in i.events){var n=i.events[t];e.push(i.element.addEventListener(t,n,!1))}return e}()})}},{key:"removeEventListeners",value:function(){return this.listeners.map(function(i){return function(){var e=[];for(var t in i.events){var n=i.events[t];e.push(i.element.removeEventListener(t,n,!1))}return e}()})}},{key:"disable",value:function(){var t=this;return this.clickableElements.forEach(function(e){return e.classList.remove("dz-clickable")}),this.removeEventListeners(),this.disabled=!0,this.files.map(function(e){return t.cancelUpload(e)})}},{key:"enable",value:function(){return delete this.disabled,this.clickableElements.forEach(function(e){return e.classList.add("dz-clickable")}),this.setupEventListeners()}},{key:"filesize",value:function(e){var t=0,n="b";if(0<e){for(var i=["tb","gb","mb","kb","b"],r=0;r<i.length;r++){var o=i[r];if(Math.pow(this.options.filesizeBase,4-r)/10<=e){t=e/Math.pow(this.options.filesizeBase,4-r),n=o;break}}t=Math.round(10*t)/10}return"<strong>".concat(t,"</strong> ").concat(this.options.dictFileSizeUnits[n])}},{key:"_updateMaxFilesReachedClass",value:function(){return null!=this.options.maxFiles&&this.getAcceptedFiles().length>=this.options.maxFiles?(this.getAcceptedFiles().length===this.options.maxFiles&&this.emit("maxfilesreached",this.files),this.element.classList.add("dz-max-files-reached")):this.element.classList.remove("dz-max-files-reached")}},{key:"drop",value:function(e){if(e.dataTransfer){this.emit("drop",e);for(var t=[],n=0;n<e.dataTransfer.files.length;n++)t[n]=e.dataTransfer.files[n];if(t.length){var i=e.dataTransfer.items;i&&i.length&&null!=i[0].webkitGetAsEntry?this._addFilesFromItems(i):this.handleFiles(t)}this.emit("addedfiles",t)}}},{key:"paste",value:function(e){if(null!=__guard__(null!=e?e.clipboardData:void 0,function(e){return e.items})){this.emit("paste",e);var t=e.clipboardData.items;return t.length?this._addFilesFromItems(t):void 0}}},{key:"handleFiles",value:function(e){var t=!0,n=!1,i=void 0;try{for(var r,o=e[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;this.addFile(a)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}}},{key:"_addFilesFromItems",value:function(s){var u=this;return function(){var e=[],t=!0,n=!1,i=void 0;try{for(var r,o=s[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a,l=r.value;null!=l.webkitGetAsEntry&&(a=l.webkitGetAsEntry())?a.isFile?e.push(u.addFile(l.getAsFile())):a.isDirectory?e.push(u._addFilesFromDirectory(a,a.name)):e.push(void 0):null!=l.getAsFile&&(null==l.kind||"file"===l.kind)?e.push(u.addFile(l.getAsFile())):e.push(void 0)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}return e}()}},{key:"_addFilesFromDirectory",value:function(e,s){function t(t){return __guardMethod__(console,"log",function(e){return e.log(t)})}var u=this,n=e.createReader();return function l(){return n.readEntries(function(e){if(0<e.length){var t=!0,n=!1,i=void 0;try{for(var r,o=e[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;a.isFile?a.file(function(e){if(!u.options.ignoreHiddenFiles||"."!==e.name.substring(0,1))return e.fullPath="".concat(s,"/").concat(e.name),u.addFile(e)}):a.isDirectory&&u._addFilesFromDirectory(a,"".concat(s,"/").concat(a.name))}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}l()}return null},t)}()}},{key:"accept",value:function(e,t){this.options.maxFilesize&&e.size>1024*this.options.maxFilesize*1024?t(this.options.dictFileTooBig.replace("{{filesize}}",Math.round(e.size/1024/10.24)/100).replace("{{maxFilesize}}",this.options.maxFilesize)):C.isValidFile(e,this.options.acceptedFiles)?null!=this.options.maxFiles&&this.getAcceptedFiles().length>=this.options.maxFiles?(t(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}",this.options.maxFiles)),this.emit("maxfilesexceeded",e)):this.options.accept.call(this,e,t):t(this.options.dictInvalidFileType)}},{key:"addFile",value:function(t){var n=this;t.upload={uuid:C.uuidv4(),progress:0,total:t.size,bytesSent:0,filename:this._renameFile(t)},this.files.push(t),t.status=C.ADDED,this.emit("addedfile",t),this._enqueueThumbnail(t),this.accept(t,function(e){e?(t.accepted=!1,n._errorProcessing([t],e)):(t.accepted=!0,n.options.autoQueue&&n.enqueueFile(t)),n._updateMaxFilesReachedClass()})}},{key:"enqueueFiles",value:function(e){var t=!0,n=!1,i=void 0;try{for(var r,o=e[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;this.enqueueFile(a)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}return null}},{key:"enqueueFile",value:function(e){var t=this;if(e.status!==C.ADDED||!0!==e.accepted)throw new Error("This file can't be queued because it has already been processed or was rejected.");if(e.status=C.QUEUED,this.options.autoProcessQueue)return setTimeout(function(){return t.processQueue()},0)}},{key:"_enqueueThumbnail",value:function(e){var t=this;if(this.options.createImageThumbnails&&e.type.match(/image.*/)&&e.size<=1024*this.options.maxThumbnailFilesize*1024)return this._thumbnailQueue.push(e),setTimeout(function(){return t._processThumbnailQueue()},0)}},{key:"_processThumbnailQueue",value:function(){var t=this;if(!this._processingThumbnail&&0!==this._thumbnailQueue.length){this._processingThumbnail=!0;var n=this._thumbnailQueue.shift();return this.createThumbnail(n,this.options.thumbnailWidth,this.options.thumbnailHeight,this.options.thumbnailMethod,!0,function(e){return t.emit("thumbnail",n,e),t._processingThumbnail=!1,t._processThumbnailQueue()})}}},{key:"removeFile",value:function(e){if(e.status===C.UPLOADING&&this.cancelUpload(e),this.files=without(this.files,e),this.emit("removedfile",e),0===this.files.length)return this.emit("reset")}},{key:"removeAllFiles",value:function(e){null==e&&(e=!1);var t=!0,n=!1,i=void 0;try{for(var r,o=this.files.slice()[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;a.status===C.UPLOADING&&!e||this.removeFile(a)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}return null}},{key:"resizeImage",value:function(r,e,t,n,o){var a=this;return this.createThumbnail(r,e,t,n,!0,function(e,t){if(null==t)return o(r);var n=a.options.resizeMimeType;null==n&&(n=r.type);var i=t.toDataURL(n,a.options.resizeQuality);return"image/jpeg"!==n&&"image/jpg"!==n||(i=ExifRestore.restore(r.dataURL,i)),o(C.dataURItoBlob(i))})}},{key:"createThumbnail",value:function(e,t,n,i,r,o){var a=this,l=new FileReader;l.onload=function(){e.dataURL=l.result,"image/svg+xml"!==e.type?a.createThumbnailFromUrl(e,t,n,i,r,o):null!=o&&o(l.result)},l.readAsDataURL(e)}},{key:"displayExistingFile",value:function(t,e,n,i,r){var o=this,a=!(4<arguments.length&&void 0!==r)||r;if(this.emit("addedfile",t),this.emit("complete",t),a){t.dataURL=e,this.createThumbnailFromUrl(t,this.options.thumbnailWidth,this.options.thumbnailHeight,this.options.resizeMethod,this.options.fixOrientation,function(e){o.emit("thumbnail",t,e),n&&n()},i)}else this.emit("thumbnail",t,e),n&&n()}},{key:"createThumbnailFromUrl",value:function(o,a,l,s,t,u,e){var c=this,d=document.createElement("img");return e&&(d.crossOrigin=e),d.onload=function(){var e=function(e){return e(1)};return"undefined"!=typeof EXIF&&null!==EXIF&&t&&(e=function(e){return EXIF.getData(d,function(){return e(EXIF.getTag(this,"Orientation"))})}),e(function(e){o.width=d.width,o.height=d.height;var t=c.options.resize.call(c,o,a,l,s),n=document.createElement("canvas"),i=n.getContext("2d");switch(n.width=t.trgWidth,n.height=t.trgHeight,4<e&&(n.width=t.trgHeight,n.height=t.trgWidth),e){case 2:i.translate(n.width,0),i.scale(-1,1);break;case 3:i.translate(n.width,n.height),i.rotate(Math.PI);break;case 4:i.translate(0,n.height),i.scale(1,-1);break;case 5:i.rotate(.5*Math.PI),i.scale(1,-1);break;case 6:i.rotate(.5*Math.PI),i.translate(0,-n.width);break;case 7:i.rotate(.5*Math.PI),i.translate(n.height,-n.width),i.scale(-1,1);break;case 8:i.rotate(-.5*Math.PI),i.translate(-n.height,0)}drawImageIOSFix(i,d,null!=t.srcX?t.srcX:0,null!=t.srcY?t.srcY:0,t.srcWidth,t.srcHeight,null!=t.trgX?t.trgX:0,null!=t.trgY?t.trgY:0,t.trgWidth,t.trgHeight);var r=n.toDataURL("image/png");if(null!=u)return u(r,n)})},null!=u&&(d.onerror=u),d.src=o.dataURL}},{key:"processQueue",value:function(){var e=this.options.parallelUploads,t=this.getUploadingFiles().length,n=t;if(!(e<=t)){var i=this.getQueuedFiles();if(0<i.length){if(this.options.uploadMultiple)return this.processFiles(i.slice(0,e-t));for(;n<e;){if(!i.length)return;this.processFile(i.shift()),n++}}}}},{key:"processFile",value:function(e){return this.processFiles([e])}},{key:"processFiles",value:function(e){var t=!0,n=!1,i=void 0;try{for(var r,o=e[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;a.processing=!0,a.status=C.UPLOADING,this.emit("processing",a)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}return this.options.uploadMultiple&&this.emit("processingmultiple",e),this.uploadFiles(e)}},{key:"_getFilesWithXhr",value:function(t){return this.files.filter(function(e){return e.xhr===t}).map(function(e){return e})}},{key:"cancelUpload",value:function(e){if(e.status===C.UPLOADING){var t=this._getFilesWithXhr(e.xhr),n=!0,i=!1,r=void 0;try{for(var o,a=t[Symbol.iterator]();!(n=(o=a.next()).done);n=!0){o.value.status=C.CANCELED}}catch(e){i=!0,r=e}finally{try{n||null==a.return||a.return()}finally{if(i)throw r}}void 0!==e.xhr&&e.xhr.abort();var l=!0,s=!1,u=void 0;try{for(var c,d=t[Symbol.iterator]();!(l=(c=d.next()).done);l=!0){var p=c.value;this.emit("canceled",p)}}catch(e){s=!0,u=e}finally{try{l||null==d.return||d.return()}finally{if(s)throw u}}this.options.uploadMultiple&&this.emit("canceledmultiple",t)}else e.status!==C.ADDED&&e.status!==C.QUEUED||(e.status=C.CANCELED,this.emit("canceled",e),this.options.uploadMultiple&&this.emit("canceledmultiple",[e]));if(this.options.autoProcessQueue)return this.processQueue()}},{key:"resolveOption",value:function(e){if("function"!=typeof e)return e;for(var t=arguments.length,n=new Array(1<t?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];return e.apply(this,n)}},{key:"uploadFile",value:function(e){return this.uploadFiles([e])}},{key:"uploadFiles",value:function(s){var u=this;this._transformFiles(s,function(e){if(u.options.chunking){var t=e[0];s[0].upload.chunked=u.options.chunking&&(u.options.forceChunking||t.size>u.options.chunkSize),s[0].upload.totalChunkCount=Math.ceil(t.size/u.options.chunkSize)}if(s[0].upload.chunked){var r=s[0],o=e[0];r.upload.chunks=[];var i=function(){for(var e=0;void 0!==r.upload.chunks[e];)e++;if(!(e>=r.upload.totalChunkCount)){0;var t=e*u.options.chunkSize,n=Math.min(t+u.options.chunkSize,r.size),i={name:u._getParamName(0),data:o.webkitSlice?o.webkitSlice(t,n):o.slice(t,n),filename:r.upload.filename,chunkIndex:e};r.upload.chunks[e]={file:r,index:e,dataBlock:i,status:C.UPLOADING,progress:0,retries:0},u._uploadData(s,[i])}};if(r.upload.finishedChunkUpload=function(e){var t=!0;e.status=C.SUCCESS,e.dataBlock=null,e.xhr=null;for(var n=0;n<r.upload.totalChunkCount;n++){if(void 0===r.upload.chunks[n])return i();r.upload.chunks[n].status!==C.SUCCESS&&(t=!1)}t&&u.options.chunksUploaded(r,function(){u._finished(s,"",null)})},u.options.parallelChunkUploads)for(var n=0;n<r.upload.totalChunkCount;n++)i();else i()}else{for(var a=[],l=0;l<s.length;l++)a[l]={name:u._getParamName(l),data:e[l],filename:s[l].upload.filename};u._uploadData(s,a)}})}},{key:"_getChunk",value:function(e,t){for(var n=0;n<e.upload.totalChunkCount;n++)if(void 0!==e.upload.chunks[n]&&e.upload.chunks[n].xhr===t)return e.upload.chunks[n]}},{key:"_uploadData",value:function(t,e){var n=this,i=new XMLHttpRequest,r=!0,o=!1,a=void 0;try{for(var l,s=t[Symbol.iterator]();!(r=(l=s.next()).done);r=!0){l.value.xhr=i}}catch(e){o=!0,a=e}finally{try{r||null==s.return||s.return()}finally{if(o)throw a}}t[0].upload.chunked&&(t[0].upload.chunks[e[0].chunkIndex].xhr=i);var u=this.resolveOption(this.options.method,t),c=this.resolveOption(this.options.url,t);i.open(u,c,!0),i.timeout=this.resolveOption(this.options.timeout,t),i.withCredentials=!!this.options.withCredentials,i.onload=function(e){n._finishedUploading(t,i,e)},i.ontimeout=function(){n._handleUploadError(t,i,"Request timedout after ".concat(n.options.timeout," seconds"))},i.onerror=function(){n._handleUploadError(t,i)},(null!=i.upload?i.upload:i).onprogress=function(e){return n._updateFilesUploadProgress(t,i,e)};var d={Accept:"application/json","Cache-Control":"no-cache","X-Requested-With":"XMLHttpRequest"};for(var p in this.options.headers&&C.extend(d,this.options.headers),d){var h=d[p];h&&i.setRequestHeader(p,h)}var f=new FormData;if(this.options.params){var v=this.options.params;for(var m in"function"==typeof v&&(v=v.call(this,t,i,t[0].upload.chunked?this._getChunk(t[0],i):null)),v){var y=v[m];f.append(m,y)}}var g=!0,b=!1,k=void 0;try{for(var w,F=t[Symbol.iterator]();!(g=(w=F.next()).done);g=!0){var z=w.value;this.emit("sending",z,i,f)}}catch(e){b=!0,k=e}finally{try{g||null==F.return||F.return()}finally{if(b)throw k}}this.options.uploadMultiple&&this.emit("sendingmultiple",t,i,f),this._addFormElementData(f);for(var x=0;x<e.length;x++){var E=e[x];f.append(E.name,E.data,E.filename)}this.submitRequest(i,f,t)}},{key:"_transformFiles",value:function(n,i){for(var e=this,r=[],o=0,t=function(t){e.options.transformFile.call(e,n[t],function(e){r[t]=e,++o===n.length&&i(r)})},a=0;a<n.length;a++)t(a)}},{key:"_addFormElementData",value:function(e){if("FORM"===this.element.tagName){var t=!0,n=!1,i=void 0;try{for(var r,o=this.element.querySelectorAll("input, textarea, select, button")[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value,l=a.getAttribute("name"),s=a.getAttribute("type");if(s=s&&s.toLowerCase(),null!=l)if("SELECT"===a.tagName&&a.hasAttribute("multiple")){var u=!0,c=!1,d=void 0;try{for(var p,h=a.options[Symbol.iterator]();!(u=(p=h.next()).done);u=!0){var f=p.value;f.selected&&e.append(l,f.value)}}catch(e){c=!0,d=e}finally{try{u||null==h.return||h.return()}finally{if(c)throw d}}}else(!s||"checkbox"!==s&&"radio"!==s||a.checked)&&e.append(l,a.value)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}}}},{key:"_updateFilesUploadProgress",value:function(e,t,n){var i;if(void 0!==n){if(i=100*n.loaded/n.total,e[0].upload.chunked){var r=e[0],o=this._getChunk(r,t);o.progress=i,o.total=n.total,o.bytesSent=n.loaded;r.upload.progress=0,r.upload.total=0;for(var a=r.upload.bytesSent=0;a<r.upload.totalChunkCount;a++)void 0!==r.upload.chunks[a]&&void 0!==r.upload.chunks[a].progress&&(r.upload.progress+=r.upload.chunks[a].progress,r.upload.total+=r.upload.chunks[a].total,r.upload.bytesSent+=r.upload.chunks[a].bytesSent);r.upload.progress=r.upload.progress/r.upload.totalChunkCount}else{var l=!0,s=!1,u=void 0;try{for(var c,d=e[Symbol.iterator]();!(l=(c=d.next()).done);l=!0){var p=c.value;p.upload.progress=i,p.upload.total=n.total,p.upload.bytesSent=n.loaded}}catch(e){s=!0,u=e}finally{try{l||null==d.return||d.return()}finally{if(s)throw u}}}var h=!0,f=!1,v=void 0;try{for(var m,y=e[Symbol.iterator]();!(h=(m=y.next()).done);h=!0){var g=m.value;this.emit("uploadprogress",g,g.upload.progress,g.upload.bytesSent)}}catch(e){f=!0,v=e}finally{try{h||null==y.return||y.return()}finally{if(f)throw v}}}else{var b=!0,k=!0,w=!(i=100),F=void 0;try{for(var z,x=e[Symbol.iterator]();!(k=(z=x.next()).done);k=!0){var E=z.value;100===E.upload.progress&&E.upload.bytesSent===E.upload.total||(b=!1),E.upload.progress=i,E.upload.bytesSent=E.upload.total}}catch(e){w=!0,F=e}finally{try{k||null==x.return||x.return()}finally{if(w)throw F}}if(b)return;var C=!0,_=!1,S=void 0;try{for(var D,T=e[Symbol.iterator]();!(C=(D=T.next()).done);C=!0){var L=D.value;this.emit("uploadprogress",L,i,L.upload.bytesSent)}}catch(e){_=!0,S=e}finally{try{C||null==T.return||T.return()}finally{if(_)throw S}}}}},{key:"_finishedUploading",value:function(e,t,n){var i;if(e[0].status!==C.CANCELED&&4===t.readyState){if("arraybuffer"!==t.responseType&&"blob"!==t.responseType&&(i=t.responseText,t.getResponseHeader("content-type")&&~t.getResponseHeader("content-type").indexOf("application/json")))try{i=JSON.parse(i)}catch(e){n=e,i="Invalid JSON response from server."}this._updateFilesUploadProgress(e),200<=t.status&&t.status<300?e[0].upload.chunked?e[0].upload.finishedChunkUpload(this._getChunk(e[0],t)):this._finished(e,i,n):this._handleUploadError(e,t,i)}}},{key:"_handleUploadError",value:function(e,t,n){if(e[0].status!==C.CANCELED){if(e[0].upload.chunked&&this.options.retryChunks){var i=this._getChunk(e[0],t);if(i.retries++<this.options.retryChunksLimit)return void this._uploadData(e,[i.dataBlock]);console.warn("Retried this chunk too often. Giving up.")}this._errorProcessing(e,n||this.options.dictResponseError.replace("{{statusCode}}",t.status),t)}}},{key:"submitRequest",value:function(e,t){e.send(t)}},{key:"_finished",value:function(e,t,n){var i=!0,r=!1,o=void 0;try{for(var a,l=e[Symbol.iterator]();!(i=(a=l.next()).done);i=!0){var s=a.value;s.status=C.SUCCESS,this.emit("success",s,t,n),this.emit("complete",s)}}catch(e){r=!0,o=e}finally{try{i||null==l.return||l.return()}finally{if(r)throw o}}if(this.options.uploadMultiple&&(this.emit("successmultiple",e,t,n),this.emit("completemultiple",e)),this.options.autoProcessQueue)return this.processQueue()}},{key:"_errorProcessing",value:function(e,t,n){var i=!0,r=!1,o=void 0;try{for(var a,l=e[Symbol.iterator]();!(i=(a=l.next()).done);i=!0){var s=a.value;s.status=C.ERROR,this.emit("error",s,t,n),this.emit("complete",s)}}catch(e){r=!0,o=e}finally{try{i||null==l.return||l.return()}finally{if(r)throw o}}if(this.options.uploadMultiple&&(this.emit("errormultiple",e,t,n),this.emit("completemultiple",e)),this.options.autoProcessQueue)return this.processQueue()}}],[{key:"uuidv4",value:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)})}}]),C}();Dropzone.initClass(),Dropzone.version="5.7.0",Dropzone.options={},Dropzone.optionsForElement=function(e){return e.getAttribute("id")?Dropzone.options[camelize(e.getAttribute("id"))]:void 0},Dropzone.instances=[],Dropzone.forElement=function(e){if("string"==typeof e&&(e=document.querySelector(e)),null==(null!=e?e.dropzone:void 0))throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");return e.dropzone},Dropzone.autoDiscover=!0,Dropzone.discover=function(){var s;if(document.querySelectorAll)s=document.querySelectorAll(".dropzone");else{s=[];var e=function(l){return function(){var e=[],t=!0,n=!1,i=void 0;try{for(var r,o=l[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;/(^| )dropzone($| )/.test(a.className)?e.push(s.push(a)):e.push(void 0)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}return e}()};e(document.getElementsByTagName("div")),e(document.getElementsByTagName("form"))}return function(){var e=[],t=!0,n=!1,i=void 0;try{for(var r,o=s[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value;!1!==Dropzone.optionsForElement(a)?e.push(new Dropzone(a)):e.push(void 0)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}return e}()},Dropzone.blacklistedBrowsers=[/opera.*(Macintosh|Windows Phone).*version\/12/i],Dropzone.isBrowserSupported=function(){var e=!0;if(window.File&&window.FileReader&&window.FileList&&window.Blob&&window.FormData&&document.querySelector)if("classList"in document.createElement("a")){var t=!0,n=!1,i=void 0;try{for(var r,o=Dropzone.blacklistedBrowsers[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){r.value.test(navigator.userAgent)&&(e=!1)}}catch(e){n=!0,i=e}finally{try{t||null==o.return||o.return()}finally{if(n)throw i}}}else e=!1;else e=!1;return e},Dropzone.dataURItoBlob=function(e){for(var t=atob(e.split(",")[1]),n=e.split(",")[0].split(":")[1].split(";")[0],i=new ArrayBuffer(t.length),r=new Uint8Array(i),o=0,a=t.length,l=0<=a;l?o<=a:a<=o;l?o++:o--)r[o]=t.charCodeAt(o);return new Blob([i],{type:n})};var without=function(e,t){return e.filter(function(e){return e!==t}).map(function(e){return e})},camelize=function(e){return e.replace(/[\-_](\w)/g,function(e){return e.charAt(1).toUpperCase()})};Dropzone.createElement=function(e){var t=document.createElement("div");return t.innerHTML=e,t.childNodes[0]},Dropzone.elementInside=function(e,t){if(e===t)return!0;for(;e=e.parentNode;)if(e===t)return!0;return!1},Dropzone.getElement=function(e,t){var n;if("string"==typeof e?n=document.querySelector(e):null!=e.nodeType&&(n=e),null==n)throw new Error("Invalid `".concat(t,"` option provided. Please provide a CSS selector or a plain HTML element."));return n},Dropzone.getElements=function(e,t){var n,i;if(e instanceof Array){i=[];try{var r=!0,o=!1,a=void 0;try{for(var l,s=e[Symbol.iterator]();!(r=(l=s.next()).done);r=!0)n=l.value,i.push(this.getElement(n,t))}catch(e){o=!0,a=e}finally{try{r||null==s.return||s.return()}finally{if(o)throw a}}}catch(e){i=null}}else if("string"==typeof e){var u=!0,c=!(i=[]),d=void 0;try{for(var p,h=document.querySelectorAll(e)[Symbol.iterator]();!(u=(p=h.next()).done);u=!0)n=p.value,i.push(n)}catch(e){c=!0,d=e}finally{try{u||null==h.return||h.return()}finally{if(c)throw d}}}else null!=e.nodeType&&(i=[e]);if(null==i||!i.length)throw new Error("Invalid `".concat(t,"` option provided. Please provide a CSS selector, a plain HTML element or a list of those."));return i},Dropzone.confirm=function(e,t,n){return window.confirm(e)?t():null!=n?n():void 0},Dropzone.isValidFile=function(e,t){if(!t)return!0;t=t.split(",");var n=e.type,i=n.replace(/\/.*$/,""),r=!0,o=!1,a=void 0;try{for(var l,s=t[Symbol.iterator]();!(r=(l=s.next()).done);r=!0){var u=l.value;if("."===(u=u.trim()).charAt(0)){if(-1!==e.name.toLowerCase().indexOf(u.toLowerCase(),e.name.length-u.length))return!0}else if(/\/\*$/.test(u)){if(i===u.replace(/\/.*$/,""))return!0}else if(n===u)return!0}}catch(e){o=!0,a=e}finally{try{r||null==s.return||s.return()}finally{if(o)throw a}}return!1},"undefined"!=typeof jQuery&&null!==jQuery&&(jQuery.fn.dropzone=function(e){return this.each(function(){return new Dropzone(this,e)})}),"undefined"!=typeof module&&null!==module?module.exports=Dropzone:window.Dropzone=Dropzone,Dropzone.ADDED="added",Dropzone.QUEUED="queued",Dropzone.ACCEPTED=Dropzone.QUEUED,Dropzone.UPLOADING="uploading",Dropzone.PROCESSING=Dropzone.UPLOADING,Dropzone.CANCELED="canceled",Dropzone.ERROR="error",Dropzone.SUCCESS="success";var detectVerticalSquash=function(e){e.naturalWidth;var t=e.naturalHeight,n=document.createElement("canvas");n.width=1,n.height=t;var i=n.getContext("2d");i.drawImage(e,0,0);for(var r=i.getImageData(1,0,1,t).data,o=0,a=t,l=t;o<l;){0===r[4*(l-1)+3]?a=l:o=l,l=a+o>>1}var s=l/t;return 0==s?1:s},drawImageIOSFix=function(e,t,n,i,r,o,a,l,s,u){var c=detectVerticalSquash(t);return e.drawImage(t,n,i,r,o,a,l,s,u/c)},ExifRestore=function(){function e(){_classCallCheck(this,e)}return _createClass(e,null,[{key:"initClass",value:function(){this.KEY_STR="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}},{key:"encode64",value:function(e){for(var t="",n=void 0,i=void 0,r="",o=void 0,a=void 0,l=void 0,s="",u=0;o=(n=e[u++])>>2,a=(3&n)<<4|(i=e[u++])>>4,l=(15&i)<<2|(r=e[u++])>>6,s=63&r,isNaN(i)?l=s=64:isNaN(r)&&(s=64),t=t+this.KEY_STR.charAt(o)+this.KEY_STR.charAt(a)+this.KEY_STR.charAt(l)+this.KEY_STR.charAt(s),n=i=r="",o=a=l=s="",u<e.length;);return t}},{key:"restore",value:function(e,t){if(!e.match("data:image/jpeg;base64,"))return t;var n=this.decode64(e.replace("data:image/jpeg;base64,","")),i=this.slice2Segments(n),r=this.exifManipulation(t,i);return"data:image/jpeg;base64,".concat(this.encode64(r))}},{key:"exifManipulation",value:function(e,t){var n=this.getExifArray(t),i=this.insertExif(e,n);return new Uint8Array(i)}},{key:"getExifArray",value:function(e){for(var t=void 0,n=0;n<e.length;){if(255===(t=e[n])[0]&225===t[1])return t;n++}return[]}},{key:"insertExif",value:function(e,t){var n=e.replace("data:image/jpeg;base64,",""),i=this.decode64(n),r=i.indexOf(255,3),o=i.slice(0,r),a=i.slice(r),l=o;return l=(l=l.concat(t)).concat(a)}},{key:"slice2Segments",value:function(e){for(var t=0,n=[];;){if(255===e[t]&218===e[t+1])break;if(255===e[t]&216===e[t+1])t+=2;else{var i=t+(256*e[t+2]+e[t+3])+2,r=e.slice(t,i);n.push(r),t=i}if(t>e.length)break}return n}},{key:"decode64",value:function(e){var t=void 0,n=void 0,i="",r=void 0,o=void 0,a="",l=0,s=[];for(/[^A-Za-z0-9\+\/\=]/g.exec(e)&&console.warn("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding."),e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");t=this.KEY_STR.indexOf(e.charAt(l++))<<2|(r=this.KEY_STR.indexOf(e.charAt(l++)))>>4,n=(15&r)<<4|(o=this.KEY_STR.indexOf(e.charAt(l++)))>>2,i=(3&o)<<6|(a=this.KEY_STR.indexOf(e.charAt(l++))),s.push(t),64!==o&&s.push(n),64!==a&&s.push(i),t=n=i="",r=o=a="",l<e.length;);return s}}]),e}();ExifRestore.initClass();var contentLoaded=function(t,n){function i(e){if("readystatechange"!==e.type||"complete"===o.readyState)return("load"===e.type?t:o)[s](u+e.type,i,!1),!r&&(r=!0)?n.call(t,e.type||e):void 0}var r=!1,e=!0,o=t.document,a=o.documentElement,l=o.addEventListener?"addEventListener":"attachEvent",s=o.addEventListener?"removeEventListener":"detachEvent",u=o.addEventListener?"":"on";if("complete"!==o.readyState){if(o.createEventObject&&a.doScroll){try{e=!t.frameElement}catch(e){}e&&!function t(){try{a.doScroll("left")}catch(e){return void setTimeout(t,50)}return i("poll")}()}return o[l](u+"DOMContentLoaded",i,!1),o[l](u+"readystatechange",i,!1),t[l](u+"load",i,!1)}};function __guard__(e,t){return null!=e?t(e):void 0}function __guardMethod__(e,t,n){return null!=e&&"function"==typeof e[t]?n(e,t):void 0}Dropzone._autoDiscoverFunction=function(){if(Dropzone.autoDiscover)return Dropzone.discover()},contentLoaded(window,Dropzone._autoDiscoverFunction);
window["PizZip"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./es6/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./es6/arrayReader.js":
/*!****************************!*\
  !*** ./es6/arrayReader.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar DataReader = __webpack_require__(/*! ./dataReader */ \"./es6/dataReader.js\");\n\nfunction ArrayReader(data) {\n  if (data) {\n    this.data = data;\n    this.length = this.data.length;\n    this.index = 0;\n    this.zero = 0;\n\n    for (var i = 0; i < this.data.length; i++) {\n      data[i] &= data[i];\n    }\n  }\n}\n\nArrayReader.prototype = new DataReader();\n/**\n * @see DataReader.byteAt\n */\n\nArrayReader.prototype.byteAt = function (i) {\n  return this.data[this.zero + i];\n};\n/**\n * @see DataReader.lastIndexOfSignature\n */\n\n\nArrayReader.prototype.lastIndexOfSignature = function (sig) {\n  var sig0 = sig.charCodeAt(0),\n      sig1 = sig.charCodeAt(1),\n      sig2 = sig.charCodeAt(2),\n      sig3 = sig.charCodeAt(3);\n\n  for (var i = this.length - 4; i >= 0; --i) {\n    if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {\n      return i - this.zero;\n    }\n  }\n\n  return -1;\n};\n/**\n * @see DataReader.readData\n */\n\n\nArrayReader.prototype.readData = function (size) {\n  this.checkOffset(size);\n\n  if (size === 0) {\n    return [];\n  }\n\n  var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);\n  this.index += size;\n  return result;\n};\n\nmodule.exports = ArrayReader;\n\n//# sourceURL=webpack://PizZip/./es6/arrayReader.js?");

/***/ }),

/***/ "./es6/base64.js":
/*!***********************!*\
  !*** ./es6/base64.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval(" // private property\n\nvar _keyStr = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\"; // public method for encoding\n\nexports.encode = function (input) {\n  var output = \"\";\n  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;\n  var i = 0;\n\n  while (i < input.length) {\n    chr1 = input.charCodeAt(i++);\n    chr2 = input.charCodeAt(i++);\n    chr3 = input.charCodeAt(i++);\n    enc1 = chr1 >> 2;\n    enc2 = (chr1 & 3) << 4 | chr2 >> 4;\n    enc3 = (chr2 & 15) << 2 | chr3 >> 6;\n    enc4 = chr3 & 63;\n\n    if (isNaN(chr2)) {\n      enc3 = enc4 = 64;\n    } else if (isNaN(chr3)) {\n      enc4 = 64;\n    }\n\n    output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);\n  }\n\n  return output;\n}; // public method for decoding\n\n\nexports.decode = function (input) {\n  var output = \"\";\n  var chr1, chr2, chr3;\n  var enc1, enc2, enc3, enc4;\n  var i = 0;\n  input = input.replace(/[^A-Za-z0-9\\+\\/\\=]/g, \"\");\n\n  while (i < input.length) {\n    enc1 = _keyStr.indexOf(input.charAt(i++));\n    enc2 = _keyStr.indexOf(input.charAt(i++));\n    enc3 = _keyStr.indexOf(input.charAt(i++));\n    enc4 = _keyStr.indexOf(input.charAt(i++));\n    chr1 = enc1 << 2 | enc2 >> 4;\n    chr2 = (enc2 & 15) << 4 | enc3 >> 2;\n    chr3 = (enc3 & 3) << 6 | enc4;\n    output += String.fromCharCode(chr1);\n\n    if (enc3 !== 64) {\n      output += String.fromCharCode(chr2);\n    }\n\n    if (enc4 !== 64) {\n      output += String.fromCharCode(chr3);\n    }\n  }\n\n  return output;\n};\n\n//# sourceURL=webpack://PizZip/./es6/base64.js?");

/***/ }),

/***/ "./es6/compressedObject.js":
/*!*********************************!*\
  !*** ./es6/compressedObject.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction CompressedObject() {\n  this.compressedSize = 0;\n  this.uncompressedSize = 0;\n  this.crc32 = 0;\n  this.compressionMethod = null;\n  this.compressedContent = null;\n}\n\nCompressedObject.prototype = {\n  /**\n   * Return the decompressed content in an unspecified format.\n   * The format will depend on the decompressor.\n   * @return {Object} the decompressed content.\n   */\n  getContent: function getContent() {\n    return null; // see implementation\n  },\n\n  /**\n   * Return the compressed content in an unspecified format.\n   * The format will depend on the compressed conten source.\n   * @return {Object} the compressed content.\n   */\n  getCompressedContent: function getCompressedContent() {\n    return null; // see implementation\n  }\n};\nmodule.exports = CompressedObject;\n\n//# sourceURL=webpack://PizZip/./es6/compressedObject.js?");

/***/ }),

/***/ "./es6/compressions.js":
/*!*****************************!*\
  !*** ./es6/compressions.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nexports.STORE = {\n  magic: \"\\x00\\x00\",\n  compress: function compress(content) {\n    return content; // no compression\n  },\n  uncompress: function uncompress(content) {\n    return content; // no compression\n  },\n  compressInputType: null,\n  uncompressInputType: null\n};\nexports.DEFLATE = __webpack_require__(/*! ./flate */ \"./es6/flate.js\");\n\n//# sourceURL=webpack://PizZip/./es6/compressions.js?");

/***/ }),

/***/ "./es6/crc32.js":
/*!**********************!*\
  !*** ./es6/crc32.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\"); // prettier-ignore\n\n\nvar table = [0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3, 0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91, 0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7, 0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5, 0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B, 0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F, 0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D, 0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433, 0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01, 0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457, 0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65, 0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9, 0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F, 0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683, 0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7, 0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5, 0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B, 0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79, 0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D, 0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713, 0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777, 0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB, 0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9, 0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF, 0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D];\n/**\n *\n *  Javascript crc32\n *  http://www.webtoolkit.info/\n *\n */\n\nmodule.exports = function crc32(input, crc) {\n  if (typeof input === \"undefined\" || !input.length) {\n    return 0;\n  }\n\n  var isArray = utils.getTypeOf(input) !== \"string\";\n\n  if (typeof crc == \"undefined\") {\n    crc = 0;\n  }\n\n  var x = 0;\n  var y = 0;\n  var b = 0;\n  crc ^= -1;\n\n  for (var i = 0, iTop = input.length; i < iTop; i++) {\n    b = isArray ? input[i] : input.charCodeAt(i);\n    y = (crc ^ b) & 0xff;\n    x = table[y];\n    crc = crc >>> 8 ^ x;\n  }\n\n  return crc ^ -1;\n};\n\n//# sourceURL=webpack://PizZip/./es6/crc32.js?");

/***/ }),

/***/ "./es6/dataReader.js":
/*!***************************!*\
  !*** ./es6/dataReader.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n\nfunction DataReader() {\n  this.data = null; // type : see implementation\n\n  this.length = 0;\n  this.index = 0;\n  this.zero = 0;\n}\n\nDataReader.prototype = {\n  /**\n   * Check that the offset will not go too far.\n   * @param {string} offset the additional offset to check.\n   * @throws {Error} an Error if the offset is out of bounds.\n   */\n  checkOffset: function checkOffset(offset) {\n    this.checkIndex(this.index + offset);\n  },\n\n  /**\n   * Check that the specifed index will not be too far.\n   * @param {string} newIndex the index to check.\n   * @throws {Error} an Error if the index is out of bounds.\n   */\n  checkIndex: function checkIndex(newIndex) {\n    if (this.length < this.zero + newIndex || newIndex < 0) {\n      throw new Error(\"End of data reached (data length = \" + this.length + \", asked index = \" + newIndex + \"). Corrupted zip ?\");\n    }\n  },\n\n  /**\n   * Change the index.\n   * @param {number} newIndex The new index.\n   * @throws {Error} if the new index is out of the data.\n   */\n  setIndex: function setIndex(newIndex) {\n    this.checkIndex(newIndex);\n    this.index = newIndex;\n  },\n\n  /**\n   * Skip the next n bytes.\n   * @param {number} n the number of bytes to skip.\n   * @throws {Error} if the new index is out of the data.\n   */\n  skip: function skip(n) {\n    this.setIndex(this.index + n);\n  },\n\n  /**\n   * Get the byte at the specified index.\n   * @param {number} i the index to use.\n   * @return {number} a byte.\n   */\n  byteAt: function byteAt() {// see implementations\n  },\n\n  /**\n   * Get the next number with a given byte size.\n   * @param {number} size the number of bytes to read.\n   * @return {number} the corresponding number.\n   */\n  readInt: function readInt(size) {\n    var result = 0,\n        i;\n    this.checkOffset(size);\n\n    for (i = this.index + size - 1; i >= this.index; i--) {\n      result = (result << 8) + this.byteAt(i);\n    }\n\n    this.index += size;\n    return result;\n  },\n\n  /**\n   * Get the next string with a given byte size.\n   * @param {number} size the number of bytes to read.\n   * @return {string} the corresponding string.\n   */\n  readString: function readString(size) {\n    return utils.transformTo(\"string\", this.readData(size));\n  },\n\n  /**\n   * Get raw data without conversion, <size> bytes.\n   * @param {number} size the number of bytes to read.\n   * @return {Object} the raw data, implementation specific.\n   */\n  readData: function readData() {// see implementations\n  },\n\n  /**\n   * Find the last occurence of a zip signature (4 bytes).\n   * @param {string} sig the signature to find.\n   * @return {number} the index of the last occurence, -1 if not found.\n   */\n  lastIndexOfSignature: function lastIndexOfSignature() {// see implementations\n  },\n\n  /**\n   * Get the next date.\n   * @return {Date} the date.\n   */\n  readDate: function readDate() {\n    var dostime = this.readInt(4);\n    return new Date((dostime >> 25 & 0x7f) + 1980, // year\n    (dostime >> 21 & 0x0f) - 1, // month\n    dostime >> 16 & 0x1f, // day\n    dostime >> 11 & 0x1f, // hour\n    dostime >> 5 & 0x3f, // minute\n    (dostime & 0x1f) << 1); // second\n  }\n};\nmodule.exports = DataReader;\n\n//# sourceURL=webpack://PizZip/./es6/dataReader.js?");

/***/ }),

/***/ "./es6/defaults.js":
/*!*************************!*\
  !*** ./es6/defaults.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nexports.base64 = false;\nexports.binary = false;\nexports.dir = false;\nexports.createFolders = false;\nexports.date = null;\nexports.compression = null;\nexports.compressionOptions = null;\nexports.comment = null;\nexports.unixPermissions = null;\nexports.dosPermissions = null;\n\n//# sourceURL=webpack://PizZip/./es6/defaults.js?");

/***/ }),

/***/ "./es6/deprecatedPublicUtils.js":
/*!**************************************!*\
  !*** ./es6/deprecatedPublicUtils.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.string2binary = function (str) {\n  return utils.string2binary(str);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.string2Uint8Array = function (str) {\n  return utils.transformTo(\"uint8array\", str);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.uint8Array2String = function (array) {\n  return utils.transformTo(\"string\", array);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.string2Blob = function (str) {\n  var buffer = utils.transformTo(\"arraybuffer\", str);\n  return utils.arrayBuffer2Blob(buffer);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.arrayBuffer2Blob = function (buffer) {\n  return utils.arrayBuffer2Blob(buffer);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.transformTo = function (outputType, input) {\n  return utils.transformTo(outputType, input);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.getTypeOf = function (input) {\n  return utils.getTypeOf(input);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.checkSupport = function (type) {\n  return utils.checkSupport(type);\n};\n/**\n * @deprecated\n * This value will be removed in a future version without replacement.\n */\n\n\nexports.MAX_VALUE_16BITS = utils.MAX_VALUE_16BITS;\n/**\n * @deprecated\n * This value will be removed in a future version without replacement.\n */\n\nexports.MAX_VALUE_32BITS = utils.MAX_VALUE_32BITS;\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\nexports.pretty = function (str) {\n  return utils.pretty(str);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.findCompression = function (compressionMethod) {\n  return utils.findCompression(compressionMethod);\n};\n/**\n * @deprecated\n * This function will be removed in a future version without replacement.\n */\n\n\nexports.isRegExp = function (object) {\n  return utils.isRegExp(object);\n};\n\n//# sourceURL=webpack://PizZip/./es6/deprecatedPublicUtils.js?");

/***/ }),

/***/ "./es6/flate.js":
/*!**********************!*\
  !*** ./es6/flate.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar USE_TYPEDARRAY = typeof Uint8Array !== \"undefined\" && typeof Uint16Array !== \"undefined\" && typeof Uint32Array !== \"undefined\";\n\nvar pako = __webpack_require__(/*! pako */ \"./node_modules/pako/index.js\");\n\nexports.uncompressInputType = USE_TYPEDARRAY ? \"uint8array\" : \"array\";\nexports.compressInputType = USE_TYPEDARRAY ? \"uint8array\" : \"array\";\nexports.magic = \"\\x08\\x00\";\n\nexports.compress = function (input, compressionOptions) {\n  return pako.deflateRaw(input, {\n    level: compressionOptions.level || -1 // default compression\n\n  });\n};\n\nexports.uncompress = function (input) {\n  return pako.inflateRaw(input);\n};\n\n//# sourceURL=webpack://PizZip/./es6/flate.js?");

/***/ }),

/***/ "./es6/index.js":
/*!**********************!*\
  !*** ./es6/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar base64 = __webpack_require__(/*! ./base64 */ \"./es6/base64.js\");\n/**\nUsage:\n   zip = new PizZip();\n   zip.file(\"hello.txt\", \"Hello, World!\").file(\"tempfile\", \"nothing\");\n   zip.folder(\"images\").file(\"smile.gif\", base64Data, {base64: true});\n   zip.file(\"Xmas.txt\", \"Ho ho ho !\", {date : new Date(\"December 25, 2007 00:00:01\")});\n   zip.remove(\"tempfile\");\n\n   base64zip = zip.generate();\n\n**/\n\n/**\n * Representation a of zip file in js\n * @constructor\n * @param {String=|ArrayBuffer=|Uint8Array=} data the data to load, if any (optional).\n * @param {Object=} options the options for creating this objects (optional).\n */\n\n\nfunction PizZip(data, options) {\n  // if this constructor is used without `new`, it adds `new` before itself:\n  if (!(this instanceof PizZip)) {\n    return new PizZip(data, options);\n  } // object containing the files :\n  // {\n  //   \"folder/\" : {...},\n  //   \"folder/data.txt\" : {...}\n  // }\n\n\n  this.files = {};\n  this.comment = null; // Where we are in the hierarchy\n\n  this.root = \"\";\n\n  if (data) {\n    this.load(data, options);\n  }\n\n  this.clone = function () {\n    var newObj = new PizZip();\n\n    for (var i in this) {\n      if (typeof this[i] !== \"function\") {\n        newObj[i] = this[i];\n      }\n    }\n\n    return newObj;\n  };\n}\n\nPizZip.prototype = __webpack_require__(/*! ./object */ \"./es6/object.js\");\nPizZip.prototype.load = __webpack_require__(/*! ./load */ \"./es6/load.js\");\nPizZip.support = __webpack_require__(/*! ./support */ \"./es6/support.js\");\nPizZip.defaults = __webpack_require__(/*! ./defaults */ \"./es6/defaults.js\");\n/**\n * @deprecated\n * This namespace will be removed in a future version without replacement.\n */\n\nPizZip.utils = __webpack_require__(/*! ./deprecatedPublicUtils */ \"./es6/deprecatedPublicUtils.js\");\nPizZip.base64 = {\n  /**\n   * @deprecated\n   * This method will be removed in a future version without replacement.\n   */\n  encode: function encode(input) {\n    return base64.encode(input);\n  },\n\n  /**\n   * @deprecated\n   * This method will be removed in a future version without replacement.\n   */\n  decode: function decode(input) {\n    return base64.decode(input);\n  }\n};\nPizZip.compressions = __webpack_require__(/*! ./compressions */ \"./es6/compressions.js\");\nmodule.exports = PizZip;\n\n//# sourceURL=webpack://PizZip/./es6/index.js?");

/***/ }),

/***/ "./es6/load.js":
/*!*********************!*\
  !*** ./es6/load.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar base64 = __webpack_require__(/*! ./base64 */ \"./es6/base64.js\");\n\nvar utf8 = __webpack_require__(/*! ./utf8 */ \"./es6/utf8.js\");\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n\nvar ZipEntries = __webpack_require__(/*! ./zipEntries */ \"./es6/zipEntries.js\");\n\nmodule.exports = function (data, options) {\n  var i, input;\n  options = utils.extend(options || {}, {\n    base64: false,\n    checkCRC32: false,\n    optimizedBinaryString: false,\n    createFolders: false,\n    decodeFileName: utf8.utf8decode\n  });\n\n  if (options.base64) {\n    data = base64.decode(data);\n  }\n\n  var zipEntries = new ZipEntries(data, options);\n  var files = zipEntries.files;\n\n  for (i = 0; i < files.length; i++) {\n    input = files[i];\n    this.file(input.fileNameStr, input.decompressed, {\n      binary: true,\n      optimizedBinaryString: true,\n      date: input.date,\n      dir: input.dir,\n      comment: input.fileCommentStr.length ? input.fileCommentStr : null,\n      unixPermissions: input.unixPermissions,\n      dosPermissions: input.dosPermissions,\n      createFolders: options.createFolders\n    });\n  }\n\n  if (zipEntries.zipComment.length) {\n    this.comment = zipEntries.zipComment;\n  }\n\n  return this;\n};\n\n//# sourceURL=webpack://PizZip/./es6/load.js?");

/***/ }),

/***/ "./es6/nodeBuffer.js":
/*!***************************!*\
  !*** ./es6/nodeBuffer.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(Buffer) {\n\nmodule.exports = function (data, encoding) {\n  return new Buffer(data, encoding);\n};\n\nmodule.exports.test = function (b) {\n  return Buffer.isBuffer(b);\n};\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/buffer/index.js */ \"./node_modules/buffer/index.js\").Buffer))\n\n//# sourceURL=webpack://PizZip/./es6/nodeBuffer.js?");

/***/ }),

/***/ "./es6/nodeBufferReader.js":
/*!*********************************!*\
  !*** ./es6/nodeBufferReader.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Uint8ArrayReader = __webpack_require__(/*! ./uint8ArrayReader */ \"./es6/uint8ArrayReader.js\");\n\nfunction NodeBufferReader(data) {\n  this.data = data;\n  this.length = this.data.length;\n  this.index = 0;\n  this.zero = 0;\n}\n\nNodeBufferReader.prototype = new Uint8ArrayReader();\n/**\n * @see DataReader.readData\n */\n\nNodeBufferReader.prototype.readData = function (size) {\n  this.checkOffset(size);\n  var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);\n  this.index += size;\n  return result;\n};\n\nmodule.exports = NodeBufferReader;\n\n//# sourceURL=webpack://PizZip/./es6/nodeBufferReader.js?");

/***/ }),

/***/ "./es6/object.js":
/*!***********************!*\
  !*** ./es6/object.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar support = __webpack_require__(/*! ./support */ \"./es6/support.js\");\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n\nvar _crc = __webpack_require__(/*! ./crc32 */ \"./es6/crc32.js\");\n\nvar signature = __webpack_require__(/*! ./signature */ \"./es6/signature.js\");\n\nvar defaults = __webpack_require__(/*! ./defaults */ \"./es6/defaults.js\");\n\nvar base64 = __webpack_require__(/*! ./base64 */ \"./es6/base64.js\");\n\nvar compressions = __webpack_require__(/*! ./compressions */ \"./es6/compressions.js\");\n\nvar CompressedObject = __webpack_require__(/*! ./compressedObject */ \"./es6/compressedObject.js\");\n\nvar nodeBuffer = __webpack_require__(/*! ./nodeBuffer */ \"./es6/nodeBuffer.js\");\n\nvar utf8 = __webpack_require__(/*! ./utf8 */ \"./es6/utf8.js\");\n\nvar StringWriter = __webpack_require__(/*! ./stringWriter */ \"./es6/stringWriter.js\");\n\nvar Uint8ArrayWriter = __webpack_require__(/*! ./uint8ArrayWriter */ \"./es6/uint8ArrayWriter.js\");\n/**\n * Returns the raw data of a ZipObject, decompress the content if necessary.\n * @param {ZipObject} file the file to use.\n * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.\n */\n\n\nfunction getRawData(file) {\n  if (file._data instanceof CompressedObject) {\n    file._data = file._data.getContent();\n    file.options.binary = true;\n    file.options.base64 = false;\n\n    if (utils.getTypeOf(file._data) === \"uint8array\") {\n      var copy = file._data; // when reading an arraybuffer, the CompressedObject mechanism will keep it and subarray() a Uint8Array.\n      // if we request a file in the same format, we might get the same Uint8Array or its ArrayBuffer (the original zip file).\n\n      file._data = new Uint8Array(copy.length); // with an empty Uint8Array, Opera fails with a \"Offset larger than array size\"\n\n      if (copy.length !== 0) {\n        file._data.set(copy, 0);\n      }\n    }\n  }\n\n  return file._data;\n}\n/**\n * Returns the data of a ZipObject in a binary form. If the content is an unicode string, encode it.\n * @param {ZipObject} file the file to use.\n * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.\n */\n\n\nfunction getBinaryData(file) {\n  var result = getRawData(file),\n      type = utils.getTypeOf(result);\n\n  if (type === \"string\") {\n    if (!file.options.binary) {\n      // unicode text !\n      // unicode string => binary string is a painful process, check if we can avoid it.\n      if (support.nodebuffer) {\n        return nodeBuffer(result, \"utf-8\");\n      }\n    }\n\n    return file.asBinary();\n  }\n\n  return result;\n} // return the actual prototype of PizZip\n\n\nvar out = {\n  /**\n   * Read an existing zip and merge the data in the current PizZip object.\n   * The implementation is in pizzip-load.js, don't forget to include it.\n   * @param {String|ArrayBuffer|Uint8Array|Buffer} stream  The stream to load\n   * @param {Object} options Options for loading the stream.\n   *  options.base64 : is the stream in base64 ? default : false\n   * @return {PizZip} the current PizZip object\n   */\n  load: function load() {\n    throw new Error(\"Load method is not defined. Is the file pizzip-load.js included ?\");\n  },\n\n  /**\n   * Filter nested files/folders with the specified function.\n   * @param {Function} search the predicate to use :\n   * function (relativePath, file) {...}\n   * It takes 2 arguments : the relative path and the file.\n   * @return {Array} An array of matching elements.\n   */\n  filter: function filter(search) {\n    var result = [];\n    var filename, relativePath, file, fileClone;\n\n    for (filename in this.files) {\n      if (!this.files.hasOwnProperty(filename)) {\n        continue;\n      }\n\n      file = this.files[filename]; // return a new object, don't let the user mess with our internal objects :)\n\n      fileClone = new ZipObject(file.name, file._data, utils.extend(file.options));\n      relativePath = filename.slice(this.root.length, filename.length);\n\n      if (filename.slice(0, this.root.length) === this.root && // the file is in the current root\n      search(relativePath, fileClone)) {\n        // and the file matches the function\n        result.push(fileClone);\n      }\n    }\n\n    return result;\n  },\n\n  /**\n   * Add a file to the zip file, or search a file.\n   * @param   {string|RegExp} name The name of the file to add (if data is defined),\n   * the name of the file to find (if no data) or a regex to match files.\n   * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded\n   * @param   {Object} o     File options\n   * @return  {PizZip|Object|Array} this PizZip object (when adding a file),\n   * a file (when searching by string) or an array of files (when searching by regex).\n   */\n  file: function file(name, data, o) {\n    if (arguments.length === 1) {\n      if (utils.isRegExp(name)) {\n        var regexp = name;\n        return this.filter(function (relativePath, file) {\n          return !file.dir && regexp.test(relativePath);\n        });\n      } // text\n\n\n      return this.filter(function (relativePath, file) {\n        return !file.dir && relativePath === name;\n      })[0] || null;\n    } // more than one argument : we have data !\n\n\n    name = this.root + name;\n    fileAdd.call(this, name, data, o);\n    return this;\n  },\n\n  /**\n   * Add a directory to the zip file, or search.\n   * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.\n   * @return  {PizZip} an object with the new directory as the root, or an array containing matching folders.\n   */\n  folder: function folder(arg) {\n    if (!arg) {\n      return this;\n    }\n\n    if (utils.isRegExp(arg)) {\n      return this.filter(function (relativePath, file) {\n        return file.dir && arg.test(relativePath);\n      });\n    } // else, name is a new folder\n\n\n    var name = this.root + arg;\n    var newFolder = folderAdd.call(this, name); // Allow chaining by returning a new object with this folder as the root\n\n    var ret = this.clone();\n    ret.root = newFolder.name;\n    return ret;\n  },\n\n  /**\n   * Delete a file, or a directory and all sub-files, from the zip\n   * @param {string} name the name of the file to delete\n   * @return {PizZip} this PizZip object\n   */\n  remove: function remove(name) {\n    name = this.root + name;\n    var file = this.files[name];\n\n    if (!file) {\n      // Look for any folders\n      if (name.slice(-1) !== \"/\") {\n        name += \"/\";\n      }\n\n      file = this.files[name];\n    }\n\n    if (file && !file.dir) {\n      // file\n      delete this.files[name];\n    } else {\n      // maybe a folder, delete recursively\n      var kids = this.filter(function (relativePath, file) {\n        return file.name.slice(0, name.length) === name;\n      });\n\n      for (var i = 0; i < kids.length; i++) {\n        delete this.files[kids[i].name];\n      }\n    }\n\n    return this;\n  },\n\n  /**\n   * Generate the complete zip file\n   * @param {Object} options the options to generate the zip file :\n   * - base64, (deprecated, use type instead) true to generate base64.\n   * - compression, \"STORE\" by default.\n   * - type, \"base64\" by default. Values are : string, base64, uint8array, arraybuffer, blob.\n   * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the zip file\n   */\n  generate: function generate(options) {\n    options = utils.extend(options || {}, {\n      base64: true,\n      compression: \"STORE\",\n      compressionOptions: null,\n      type: \"base64\",\n      platform: \"DOS\",\n      comment: null,\n      mimeType: \"application/zip\",\n      encodeFileName: utf8.utf8encode\n    });\n    utils.checkSupport(options.type); // accept nodejs `process.platform`\n\n    if (options.platform === \"darwin\" || options.platform === \"freebsd\" || options.platform === \"linux\" || options.platform === \"sunos\") {\n      options.platform = \"UNIX\";\n    }\n\n    if (options.platform === \"win32\") {\n      options.platform = \"DOS\";\n    }\n\n    var zipData = [],\n        encodedComment = utils.transformTo(\"string\", options.encodeFileName(options.comment || this.comment || \"\"));\n    var localDirLength = 0,\n        centralDirLength = 0,\n        writer,\n        i; // first, generate all the zip parts.\n\n    for (var name in this.files) {\n      if (!this.files.hasOwnProperty(name)) {\n        continue;\n      }\n\n      var file = this.files[name];\n      var compressionName = file.options.compression || options.compression.toUpperCase();\n      var compression = compressions[compressionName];\n\n      if (!compression) {\n        throw new Error(compressionName + \" is not a valid compression method !\");\n      }\n\n      var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};\n      var compressedObject = generateCompressedObjectFrom.call(this, file, compression, compressionOptions);\n      var zipPart = generateZipParts.call(this, name, file, compressedObject, localDirLength, options.platform, options.encodeFileName);\n      localDirLength += zipPart.fileRecord.length + compressedObject.compressedSize;\n      centralDirLength += zipPart.dirRecord.length;\n      zipData.push(zipPart);\n    }\n\n    var dirEnd = \"\"; // end of central dir signature\n\n    dirEnd = signature.CENTRAL_DIRECTORY_END + // number of this disk\n    \"\\x00\\x00\" + // number of the disk with the start of the central directory\n    \"\\x00\\x00\" + // total number of entries in the central directory on this disk\n    decToHex(zipData.length, 2) + // total number of entries in the central directory\n    decToHex(zipData.length, 2) + // size of the central directory   4 bytes\n    decToHex(centralDirLength, 4) + // offset of start of central directory with respect to the starting disk number\n    decToHex(localDirLength, 4) + // .ZIP file comment length\n    decToHex(encodedComment.length, 2) + // .ZIP file comment\n    encodedComment; // we have all the parts (and the total length)\n    // time to create a writer !\n\n    var typeName = options.type.toLowerCase();\n\n    if (typeName === \"uint8array\" || typeName === \"arraybuffer\" || typeName === \"blob\" || typeName === \"nodebuffer\") {\n      writer = new Uint8ArrayWriter(localDirLength + centralDirLength + dirEnd.length);\n    } else {\n      writer = new StringWriter(localDirLength + centralDirLength + dirEnd.length);\n    }\n\n    for (i = 0; i < zipData.length; i++) {\n      writer.append(zipData[i].fileRecord);\n      writer.append(zipData[i].compressedObject.compressedContent);\n    }\n\n    for (i = 0; i < zipData.length; i++) {\n      writer.append(zipData[i].dirRecord);\n    }\n\n    writer.append(dirEnd);\n    var zip = writer.finalize();\n\n    switch (options.type.toLowerCase()) {\n      // case \"zip is an Uint8Array\"\n      case \"uint8array\":\n      case \"arraybuffer\":\n      case \"nodebuffer\":\n        return utils.transformTo(options.type.toLowerCase(), zip);\n\n      case \"blob\":\n        return utils.arrayBuffer2Blob(utils.transformTo(\"arraybuffer\", zip), options.mimeType);\n      // case \"zip is a string\"\n\n      case \"base64\":\n        return options.base64 ? base64.encode(zip) : zip;\n\n      default:\n        // case \"string\" :\n        return zip;\n    }\n  },\n\n  /**\n   * @deprecated\n   * This method will be removed in a future version without replacement.\n   */\n  crc32: function crc32(input, crc) {\n    return _crc(input, crc);\n  },\n\n  /**\n   * @deprecated\n   * This method will be removed in a future version without replacement.\n   */\n  utf8encode: function utf8encode(string) {\n    return utils.transformTo(\"string\", utf8.utf8encode(string));\n  },\n\n  /**\n   * @deprecated\n   * This method will be removed in a future version without replacement.\n   */\n  utf8decode: function utf8decode(input) {\n    return utf8.utf8decode(input);\n  }\n};\n/**\n * Transform this._data into a string.\n * @param {function} filter a function String -> String, applied if not null on the result.\n * @return {String} the string representing this._data.\n */\n\nfunction dataToString(asUTF8) {\n  var result = getRawData(this);\n\n  if (result === null || typeof result === \"undefined\") {\n    return \"\";\n  } // if the data is a base64 string, we decode it before checking the encoding !\n\n\n  if (this.options.base64) {\n    result = base64.decode(result);\n  }\n\n  if (asUTF8 && this.options.binary) {\n    // PizZip.prototype.utf8decode supports arrays as input\n    // skip to array => string step, utf8decode will do it.\n    result = out.utf8decode(result);\n  } else {\n    // no utf8 transformation, do the array => string step.\n    result = utils.transformTo(\"string\", result);\n  }\n\n  if (!asUTF8 && !this.options.binary) {\n    result = utils.transformTo(\"string\", out.utf8encode(result));\n  }\n\n  return result;\n}\n/**\n * A simple object representing a file in the zip file.\n * @constructor\n * @param {string} name the name of the file\n * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data\n * @param {Object} options the options of the file\n */\n\n\nfunction ZipObject(name, data, options) {\n  this.name = name;\n  this.dir = options.dir;\n  this.date = options.date;\n  this.comment = options.comment;\n  this.unixPermissions = options.unixPermissions;\n  this.dosPermissions = options.dosPermissions;\n  this._data = data;\n  this.options = options;\n  /*\n   * This object contains initial values for dir and date.\n   * With them, we can check if the user changed the deprecated metadata in\n   * `ZipObject#options` or not.\n   */\n\n  this._initialMetadata = {\n    dir: options.dir,\n    date: options.date\n  };\n}\n\nZipObject.prototype = {\n  /**\n   * Return the content as UTF8 string.\n   * @return {string} the UTF8 string.\n   */\n  asText: function asText() {\n    return dataToString.call(this, true);\n  },\n\n  /**\n   * Returns the binary content.\n   * @return {string} the content as binary.\n   */\n  asBinary: function asBinary() {\n    return dataToString.call(this, false);\n  },\n\n  /**\n   * Returns the content as a nodejs Buffer.\n   * @return {Buffer} the content as a Buffer.\n   */\n  asNodeBuffer: function asNodeBuffer() {\n    var result = getBinaryData(this);\n    return utils.transformTo(\"nodebuffer\", result);\n  },\n\n  /**\n   * Returns the content as an Uint8Array.\n   * @return {Uint8Array} the content as an Uint8Array.\n   */\n  asUint8Array: function asUint8Array() {\n    var result = getBinaryData(this);\n    return utils.transformTo(\"uint8array\", result);\n  },\n\n  /**\n   * Returns the content as an ArrayBuffer.\n   * @return {ArrayBuffer} the content as an ArrayBufer.\n   */\n  asArrayBuffer: function asArrayBuffer() {\n    return this.asUint8Array().buffer;\n  }\n};\n/**\n * Transform an integer into a string in hexadecimal.\n * @private\n * @param {number} dec the number to convert.\n * @param {number} bytes the number of bytes to generate.\n * @returns {string} the result.\n */\n\nfunction decToHex(dec, bytes) {\n  var hex = \"\",\n      i;\n\n  for (i = 0; i < bytes; i++) {\n    hex += String.fromCharCode(dec & 0xff);\n    dec >>>= 8;\n  }\n\n  return hex;\n}\n/**\n * Transforms the (incomplete) options from the user into the complete\n * set of options to create a file.\n * @private\n * @param {Object} o the options from the user.\n * @return {Object} the complete set of options.\n */\n\n\nfunction prepareFileAttrs(o) {\n  o = o || {};\n\n  if (o.base64 === true && (o.binary === null || o.binary === undefined)) {\n    o.binary = true;\n  }\n\n  o = utils.extend(o, defaults);\n  o.date = o.date || new Date();\n\n  if (o.compression !== null) {\n    o.compression = o.compression.toUpperCase();\n  }\n\n  return o;\n}\n/**\n * Add a file in the current folder.\n * @private\n * @param {string} name the name of the file\n * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data of the file\n * @param {Object} o the options of the file\n * @return {Object} the new file.\n */\n\n\nfunction fileAdd(name, data, o) {\n  // be sure sub folders exist\n  var dataType = utils.getTypeOf(data),\n      parent;\n  o = prepareFileAttrs(o);\n\n  if (typeof o.unixPermissions === \"string\") {\n    o.unixPermissions = parseInt(o.unixPermissions, 8);\n  } // UNX_IFDIR  0040000 see zipinfo.c\n\n\n  if (o.unixPermissions && o.unixPermissions & 0x4000) {\n    o.dir = true;\n  } // Bit 4    Directory\n\n\n  if (o.dosPermissions && o.dosPermissions & 0x0010) {\n    o.dir = true;\n  }\n\n  if (o.dir) {\n    name = forceTrailingSlash(name);\n  }\n\n  if (o.createFolders && (parent = parentFolder(name))) {\n    folderAdd.call(this, parent, true);\n  }\n\n  if (o.dir || data === null || typeof data === \"undefined\") {\n    o.base64 = false;\n    o.binary = false;\n    data = null;\n    dataType = null;\n  } else if (dataType === \"string\") {\n    if (o.binary && !o.base64) {\n      // optimizedBinaryString == true means that the file has already been filtered with a 0xFF mask\n      if (o.optimizedBinaryString !== true) {\n        // this is a string, not in a base64 format.\n        // Be sure that this is a correct \"binary string\"\n        data = utils.string2binary(data);\n      }\n    }\n  } else {\n    // arraybuffer, uint8array, ...\n    o.base64 = false;\n    o.binary = true;\n\n    if (!dataType && !(data instanceof CompressedObject)) {\n      throw new Error(\"The data of '\" + name + \"' is in an unsupported format !\");\n    } // special case : it's way easier to work with Uint8Array than with ArrayBuffer\n\n\n    if (dataType === \"arraybuffer\") {\n      data = utils.transformTo(\"uint8array\", data);\n    }\n  }\n\n  var object = new ZipObject(name, data, o);\n  this.files[name] = object;\n  return object;\n}\n/**\n * Find the parent folder of the path.\n * @private\n * @param {string} path the path to use\n * @return {string} the parent folder, or \"\"\n */\n\n\nfunction parentFolder(path) {\n  if (path.slice(-1) === \"/\") {\n    path = path.substring(0, path.length - 1);\n  }\n\n  var lastSlash = path.lastIndexOf(\"/\");\n  return lastSlash > 0 ? path.substring(0, lastSlash) : \"\";\n}\n/**\n * Returns the path with a slash at the end.\n * @private\n * @param {String} path the path to check.\n * @return {String} the path with a trailing slash.\n */\n\n\nfunction forceTrailingSlash(path) {\n  // Check the name ends with a /\n  if (path.slice(-1) !== \"/\") {\n    path += \"/\"; // IE doesn't like substr(-1)\n  }\n\n  return path;\n}\n/**\n * Add a (sub) folder in the current folder.\n * @private\n * @param {string} name the folder's name\n * @param {boolean=} [createFolders] If true, automatically create sub\n *  folders. Defaults to false.\n * @return {Object} the new folder.\n */\n\n\nfunction folderAdd(name, createFolders) {\n  createFolders = typeof createFolders !== \"undefined\" ? createFolders : false;\n  name = forceTrailingSlash(name); // Does this folder already exist?\n\n  if (!this.files[name]) {\n    fileAdd.call(this, name, null, {\n      dir: true,\n      createFolders: createFolders\n    });\n  }\n\n  return this.files[name];\n}\n/**\n * Generate a PizZip.CompressedObject for a given zipOject.\n * @param {ZipObject} file the object to read.\n * @param {PizZip.compression} compression the compression to use.\n * @param {Object} compressionOptions the options to use when compressing.\n * @return {PizZip.CompressedObject} the compressed result.\n */\n\n\nfunction generateCompressedObjectFrom(file, compression, compressionOptions) {\n  var result = new CompressedObject();\n  var content; // the data has not been decompressed, we might reuse things !\n\n  if (file._data instanceof CompressedObject) {\n    result.uncompressedSize = file._data.uncompressedSize;\n    result.crc32 = file._data.crc32;\n\n    if (result.uncompressedSize === 0 || file.dir) {\n      compression = compressions.STORE;\n      result.compressedContent = \"\";\n      result.crc32 = 0;\n    } else if (file._data.compressionMethod === compression.magic) {\n      result.compressedContent = file._data.getCompressedContent();\n    } else {\n      content = file._data.getContent(); // need to decompress / recompress\n\n      result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content), compressionOptions);\n    }\n  } else {\n    // have uncompressed data\n    content = getBinaryData(file);\n\n    if (!content || content.length === 0 || file.dir) {\n      compression = compressions.STORE;\n      content = \"\";\n    }\n\n    result.uncompressedSize = content.length;\n    result.crc32 = _crc(content);\n    result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content), compressionOptions);\n  }\n\n  result.compressedSize = result.compressedContent.length;\n  result.compressionMethod = compression.magic;\n  return result;\n}\n/**\n * Generate the UNIX part of the external file attributes.\n * @param {Object} unixPermissions the unix permissions or null.\n * @param {Boolean} isDir true if the entry is a directory, false otherwise.\n * @return {Number} a 32 bit integer.\n *\n * adapted from http://unix.stackexchange.com/questions/14705/the-zip-formats-external-file-attribute :\n *\n * TTTTsstrwxrwxrwx0000000000ADVSHR\n * ^^^^____________________________ file type, see zipinfo.c (UNX_*)\n *     ^^^_________________________ setuid, setgid, sticky\n *        ^^^^^^^^^________________ permissions\n *                 ^^^^^^^^^^______ not used ?\n *                           ^^^^^^ DOS attribute bits : Archive, Directory, Volume label, System file, Hidden, Read only\n */\n\n\nfunction generateUnixExternalFileAttr(unixPermissions, isDir) {\n  var result = unixPermissions;\n\n  if (!unixPermissions) {\n    // I can't use octal values in strict mode, hence the hexa.\n    //  040775 => 0x41fd\n    // 0100664 => 0x81b4\n    result = isDir ? 0x41fd : 0x81b4;\n  }\n\n  return (result & 0xffff) << 16;\n}\n/**\n * Generate the DOS part of the external file attributes.\n * @param {Object} dosPermissions the dos permissions or null.\n * @param {Boolean} isDir true if the entry is a directory, false otherwise.\n * @return {Number} a 32 bit integer.\n *\n * Bit 0     Read-Only\n * Bit 1     Hidden\n * Bit 2     System\n * Bit 3     Volume Label\n * Bit 4     Directory\n * Bit 5     Archive\n */\n\n\nfunction generateDosExternalFileAttr(dosPermissions) {\n  // the dir flag is already set for compatibility\n  return (dosPermissions || 0) & 0x3f;\n}\n/**\n * Generate the various parts used in the construction of the final zip file.\n * @param {string} name the file name.\n * @param {ZipObject} file the file content.\n * @param {PizZip.CompressedObject} compressedObject the compressed object.\n * @param {number} offset the current offset from the start of the zip file.\n * @param {String} platform let's pretend we are this platform (change platform dependents fields)\n * @param {Function} encodeFileName the function to encode the file name / comment.\n * @return {object} the zip parts.\n */\n\n\nfunction generateZipParts(name, file, compressedObject, offset, platform, encodeFileName) {\n  var useCustomEncoding = encodeFileName !== utf8.utf8encode,\n      encodedFileName = utils.transformTo(\"string\", encodeFileName(file.name)),\n      utfEncodedFileName = utils.transformTo(\"string\", utf8.utf8encode(file.name)),\n      comment = file.comment || \"\",\n      encodedComment = utils.transformTo(\"string\", encodeFileName(comment)),\n      utfEncodedComment = utils.transformTo(\"string\", utf8.utf8encode(comment)),\n      useUTF8ForFileName = utfEncodedFileName.length !== file.name.length,\n      useUTF8ForComment = utfEncodedComment.length !== comment.length,\n      o = file.options;\n  var dosTime,\n      dosDate,\n      extraFields = \"\",\n      unicodePathExtraField = \"\",\n      unicodeCommentExtraField = \"\",\n      dir,\n      date; // handle the deprecated options.dir\n\n  if (file._initialMetadata.dir !== file.dir) {\n    dir = file.dir;\n  } else {\n    dir = o.dir;\n  } // handle the deprecated options.date\n\n\n  if (file._initialMetadata.date !== file.date) {\n    date = file.date;\n  } else {\n    date = o.date;\n  }\n\n  var extFileAttr = 0;\n  var versionMadeBy = 0;\n\n  if (dir) {\n    // dos or unix, we set the dos dir flag\n    extFileAttr |= 0x00010;\n  }\n\n  if (platform === \"UNIX\") {\n    versionMadeBy = 0x031e; // UNIX, version 3.0\n\n    extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);\n  } else {\n    // DOS or other, fallback to DOS\n    versionMadeBy = 0x0014; // DOS, version 2.0\n\n    extFileAttr |= generateDosExternalFileAttr(file.dosPermissions, dir);\n  } // date\n  // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html\n  // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html\n  // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html\n\n\n  dosTime = date.getHours();\n  dosTime <<= 6;\n  dosTime |= date.getMinutes();\n  dosTime <<= 5;\n  dosTime |= date.getSeconds() / 2;\n  dosDate = date.getFullYear() - 1980;\n  dosDate <<= 4;\n  dosDate |= date.getMonth() + 1;\n  dosDate <<= 5;\n  dosDate |= date.getDate();\n\n  if (useUTF8ForFileName) {\n    // set the unicode path extra field. unzip needs at least one extra\n    // field to correctly handle unicode path, so using the path is as good\n    // as any other information. This could improve the situation with\n    // other archive managers too.\n    // This field is usually used without the utf8 flag, with a non\n    // unicode path in the header (winrar, winzip). This helps (a bit)\n    // with the messy Windows' default compressed folders feature but\n    // breaks on p7zip which doesn't seek the unicode path extra field.\n    // So for now, UTF-8 everywhere !\n    unicodePathExtraField = // Version\n    decToHex(1, 1) + // NameCRC32\n    decToHex(_crc(encodedFileName), 4) + // UnicodeName\n    utfEncodedFileName;\n    extraFields += // Info-ZIP Unicode Path Extra Field\n    \"\\x75\\x70\" + // size\n    decToHex(unicodePathExtraField.length, 2) + // content\n    unicodePathExtraField;\n  }\n\n  if (useUTF8ForComment) {\n    unicodeCommentExtraField = // Version\n    decToHex(1, 1) + // CommentCRC32\n    decToHex(this.crc32(encodedComment), 4) + // UnicodeName\n    utfEncodedComment;\n    extraFields += // Info-ZIP Unicode Path Extra Field\n    \"\\x75\\x63\" + // size\n    decToHex(unicodeCommentExtraField.length, 2) + // content\n    unicodeCommentExtraField;\n  }\n\n  var header = \"\"; // version needed to extract\n\n  header += \"\\x0A\\x00\"; // general purpose bit flag\n  // set bit 11 if utf8\n\n  header += !useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment) ? \"\\x00\\x08\" : \"\\x00\\x00\"; // compression method\n\n  header += compressedObject.compressionMethod; // last mod file time\n\n  header += decToHex(dosTime, 2); // last mod file date\n\n  header += decToHex(dosDate, 2); // crc-32\n\n  header += decToHex(compressedObject.crc32, 4); // compressed size\n\n  header += decToHex(compressedObject.compressedSize, 4); // uncompressed size\n\n  header += decToHex(compressedObject.uncompressedSize, 4); // file name length\n\n  header += decToHex(encodedFileName.length, 2); // extra field length\n\n  header += decToHex(extraFields.length, 2);\n  var fileRecord = signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;\n  var dirRecord = signature.CENTRAL_FILE_HEADER + // version made by (00: DOS)\n  decToHex(versionMadeBy, 2) + // file header (common to file and central directory)\n  header + // file comment length\n  decToHex(encodedComment.length, 2) + // disk number start\n  \"\\x00\\x00\" + // internal file attributes\n  \"\\x00\\x00\" + // external file attributes\n  decToHex(extFileAttr, 4) + // relative offset of local header\n  decToHex(offset, 4) + // file name\n  encodedFileName + // extra field\n  extraFields + // file comment\n  encodedComment;\n  return {\n    fileRecord: fileRecord,\n    dirRecord: dirRecord,\n    compressedObject: compressedObject\n  };\n}\n\nmodule.exports = out;\n\n//# sourceURL=webpack://PizZip/./es6/object.js?");

/***/ }),

/***/ "./es6/signature.js":
/*!**************************!*\
  !*** ./es6/signature.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nexports.LOCAL_FILE_HEADER = \"PK\\x03\\x04\";\nexports.CENTRAL_FILE_HEADER = \"PK\\x01\\x02\";\nexports.CENTRAL_DIRECTORY_END = \"PK\\x05\\x06\";\nexports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = \"PK\\x06\\x07\";\nexports.ZIP64_CENTRAL_DIRECTORY_END = \"PK\\x06\\x06\";\nexports.DATA_DESCRIPTOR = \"PK\\x07\\x08\";\n\n//# sourceURL=webpack://PizZip/./es6/signature.js?");

/***/ }),

/***/ "./es6/stringReader.js":
/*!*****************************!*\
  !*** ./es6/stringReader.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar DataReader = __webpack_require__(/*! ./dataReader */ \"./es6/dataReader.js\");\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n\nfunction StringReader(data, optimizedBinaryString) {\n  this.data = data;\n\n  if (!optimizedBinaryString) {\n    this.data = utils.string2binary(this.data);\n  }\n\n  this.length = this.data.length;\n  this.index = 0;\n  this.zero = 0;\n}\n\nStringReader.prototype = new DataReader();\n/**\n * @see DataReader.byteAt\n */\n\nStringReader.prototype.byteAt = function (i) {\n  return this.data.charCodeAt(this.zero + i);\n};\n/**\n * @see DataReader.lastIndexOfSignature\n */\n\n\nStringReader.prototype.lastIndexOfSignature = function (sig) {\n  return this.data.lastIndexOf(sig) - this.zero;\n};\n/**\n * @see DataReader.readData\n */\n\n\nStringReader.prototype.readData = function (size) {\n  this.checkOffset(size); // this will work because the constructor applied the \"& 0xff\" mask.\n\n  var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);\n  this.index += size;\n  return result;\n};\n\nmodule.exports = StringReader;\n\n//# sourceURL=webpack://PizZip/./es6/stringReader.js?");

/***/ }),

/***/ "./es6/stringWriter.js":
/*!*****************************!*\
  !*** ./es6/stringWriter.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n/**\n * An object to write any content to a string.\n * @constructor\n */\n\n\nfunction StringWriter() {\n  this.data = [];\n}\n\nStringWriter.prototype = {\n  /**\n   * Append any content to the current string.\n   * @param {Object} input the content to add.\n   */\n  append: function append(input) {\n    input = utils.transformTo(\"string\", input);\n    this.data.push(input);\n  },\n\n  /**\n   * Finalize the construction an return the result.\n   * @return {string} the generated string.\n   */\n  finalize: function finalize() {\n    return this.data.join(\"\");\n  }\n};\nmodule.exports = StringWriter;\n\n//# sourceURL=webpack://PizZip/./es6/stringWriter.js?");

/***/ }),

/***/ "./es6/support.js":
/*!************************!*\
  !*** ./es6/support.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(Buffer) {\n\nexports.base64 = true;\nexports.array = true;\nexports.string = true;\nexports.arraybuffer = typeof ArrayBuffer !== \"undefined\" && typeof Uint8Array !== \"undefined\"; // contains true if PizZip can read/generate nodejs Buffer, false otherwise.\n// Browserify will provide a Buffer implementation for browsers, which is\n// an augmented Uint8Array (i.e., can be used as either Buffer or U8).\n\nexports.nodebuffer = typeof Buffer !== \"undefined\"; // contains true if PizZip can read/generate Uint8Array, false otherwise.\n\nexports.uint8array = typeof Uint8Array !== \"undefined\";\n\nif (typeof ArrayBuffer === \"undefined\") {\n  exports.blob = false;\n} else {\n  var buffer = new ArrayBuffer(0);\n\n  try {\n    exports.blob = new Blob([buffer], {\n      type: \"application/zip\"\n    }).size === 0;\n  } catch (e) {\n    try {\n      var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;\n      var builder = new Builder();\n      builder.append(buffer);\n      exports.blob = builder.getBlob(\"application/zip\").size === 0;\n    } catch (e) {\n      exports.blob = false;\n    }\n  }\n}\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/buffer/index.js */ \"./node_modules/buffer/index.js\").Buffer))\n\n//# sourceURL=webpack://PizZip/./es6/support.js?");

/***/ }),

/***/ "./es6/uint8ArrayReader.js":
/*!*********************************!*\
  !*** ./es6/uint8ArrayReader.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar ArrayReader = __webpack_require__(/*! ./arrayReader */ \"./es6/arrayReader.js\");\n\nfunction Uint8ArrayReader(data) {\n  if (data) {\n    this.data = data;\n    this.length = this.data.length;\n    this.index = 0;\n    this.zero = 0;\n  }\n}\n\nUint8ArrayReader.prototype = new ArrayReader();\n/**\n * @see DataReader.readData\n */\n\nUint8ArrayReader.prototype.readData = function (size) {\n  this.checkOffset(size);\n\n  if (size === 0) {\n    // in IE10, when using subarray(idx, idx), we get the array [0x00] instead of [].\n    return new Uint8Array(0);\n  }\n\n  var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);\n  this.index += size;\n  return result;\n};\n\nmodule.exports = Uint8ArrayReader;\n\n//# sourceURL=webpack://PizZip/./es6/uint8ArrayReader.js?");

/***/ }),

/***/ "./es6/uint8ArrayWriter.js":
/*!*********************************!*\
  !*** ./es6/uint8ArrayWriter.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n/**\n * An object to write any content to an Uint8Array.\n * @constructor\n * @param {number} length The length of the array.\n */\n\n\nfunction Uint8ArrayWriter(length) {\n  this.data = new Uint8Array(length);\n  this.index = 0;\n}\n\nUint8ArrayWriter.prototype = {\n  /**\n   * Append any content to the current array.\n   * @param {Object} input the content to add.\n   */\n  append: function append(input) {\n    if (input.length !== 0) {\n      // with an empty Uint8Array, Opera fails with a \"Offset larger than array size\"\n      input = utils.transformTo(\"uint8array\", input);\n      this.data.set(input, this.index);\n      this.index += input.length;\n    }\n  },\n\n  /**\n   * Finalize the construction an return the result.\n   * @return {Uint8Array} the generated array.\n   */\n  finalize: function finalize() {\n    return this.data;\n  }\n};\nmodule.exports = Uint8ArrayWriter;\n\n//# sourceURL=webpack://PizZip/./es6/uint8ArrayWriter.js?");

/***/ }),

/***/ "./es6/utf8.js":
/*!*********************!*\
  !*** ./es6/utf8.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n\nvar support = __webpack_require__(/*! ./support */ \"./es6/support.js\");\n\nvar nodeBuffer = __webpack_require__(/*! ./nodeBuffer */ \"./es6/nodeBuffer.js\");\n/**\n * The following functions come from pako, from pako/lib/utils/strings\n * released under the MIT license, see pako https://github.com/nodeca/pako/\n */\n// Table with utf8 lengths (calculated by first byte of sequence)\n// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,\n// because max possible codepoint is 0x10ffff\n\n\nvar _utf8len = new Array(256);\n\nfor (var i = 0; i < 256; i++) {\n  _utf8len[i] = i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1;\n}\n\n_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start\n// convert string to array (typed, when possible)\n\nfunction string2buf(str) {\n  var buf,\n      c,\n      c2,\n      mPos,\n      i,\n      bufLen = 0;\n  var strLen = str.length; // count binary size\n\n  for (mPos = 0; mPos < strLen; mPos++) {\n    c = str.charCodeAt(mPos);\n\n    if ((c & 0xfc00) === 0xd800 && mPos + 1 < strLen) {\n      c2 = str.charCodeAt(mPos + 1);\n\n      if ((c2 & 0xfc00) === 0xdc00) {\n        c = 0x10000 + (c - 0xd800 << 10) + (c2 - 0xdc00);\n        mPos++;\n      }\n    }\n\n    bufLen += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;\n  } // allocate buffer\n\n\n  if (support.uint8array) {\n    buf = new Uint8Array(bufLen);\n  } else {\n    buf = new Array(bufLen);\n  } // convert\n\n\n  for (i = 0, mPos = 0; i < bufLen; mPos++) {\n    c = str.charCodeAt(mPos);\n\n    if ((c & 0xfc00) === 0xd800 && mPos + 1 < strLen) {\n      c2 = str.charCodeAt(mPos + 1);\n\n      if ((c2 & 0xfc00) === 0xdc00) {\n        c = 0x10000 + (c - 0xd800 << 10) + (c2 - 0xdc00);\n        mPos++;\n      }\n    }\n\n    if (c < 0x80) {\n      /* one byte */\n      buf[i++] = c;\n    } else if (c < 0x800) {\n      /* two bytes */\n      buf[i++] = 0xc0 | c >>> 6;\n      buf[i++] = 0x80 | c & 0x3f;\n    } else if (c < 0x10000) {\n      /* three bytes */\n      buf[i++] = 0xe0 | c >>> 12;\n      buf[i++] = 0x80 | c >>> 6 & 0x3f;\n      buf[i++] = 0x80 | c & 0x3f;\n    } else {\n      /* four bytes */\n      buf[i++] = 0xf0 | c >>> 18;\n      buf[i++] = 0x80 | c >>> 12 & 0x3f;\n      buf[i++] = 0x80 | c >>> 6 & 0x3f;\n      buf[i++] = 0x80 | c & 0x3f;\n    }\n  }\n\n  return buf;\n} // Calculate max possible position in utf8 buffer,\n// that will not break sequence. If that's not possible\n// - (very small limits) return max size as is.\n//\n// buf[] - utf8 bytes array\n// max   - length limit (mandatory);\n\n\nfunction utf8border(buf, max) {\n  var pos;\n  max = max || buf.length;\n\n  if (max > buf.length) {\n    max = buf.length;\n  } // go back from last position, until start of sequence found\n\n\n  pos = max - 1;\n\n  while (pos >= 0 && (buf[pos] & 0xc0) === 0x80) {\n    pos--;\n  } // Fuckup - very small and broken sequence,\n  // return max, because we should return something anyway.\n\n\n  if (pos < 0) {\n    return max;\n  } // If we came to start of buffer - that means vuffer is too small,\n  // return max too.\n\n\n  if (pos === 0) {\n    return max;\n  }\n\n  return pos + _utf8len[buf[pos]] > max ? pos : max;\n} // convert array to string\n\n\nfunction buf2string(buf) {\n  var i, out, c, cLen;\n  var len = buf.length; // Reserve max possible length (2 words per char)\n  // NB: by unknown reasons, Array is significantly faster for\n  //     String.fromCharCode.apply than Uint16Array.\n\n  var utf16buf = new Array(len * 2);\n\n  for (out = 0, i = 0; i < len;) {\n    c = buf[i++]; // quick process ascii\n\n    if (c < 0x80) {\n      utf16buf[out++] = c;\n      continue;\n    }\n\n    cLen = _utf8len[c]; // skip 5 & 6 byte codes\n\n    if (cLen > 4) {\n      utf16buf[out++] = 0xfffd;\n      i += cLen - 1;\n      continue;\n    } // apply mask on first byte\n\n\n    c &= cLen === 2 ? 0x1f : cLen === 3 ? 0x0f : 0x07; // join the rest\n\n    while (cLen > 1 && i < len) {\n      c = c << 6 | buf[i++] & 0x3f;\n      cLen--;\n    } // terminated by end of string?\n\n\n    if (cLen > 1) {\n      utf16buf[out++] = 0xfffd;\n      continue;\n    }\n\n    if (c < 0x10000) {\n      utf16buf[out++] = c;\n    } else {\n      c -= 0x10000;\n      utf16buf[out++] = 0xd800 | c >> 10 & 0x3ff;\n      utf16buf[out++] = 0xdc00 | c & 0x3ff;\n    }\n  } // shrinkBuf(utf16buf, out)\n\n\n  if (utf16buf.length !== out) {\n    if (utf16buf.subarray) {\n      utf16buf = utf16buf.subarray(0, out);\n    } else {\n      utf16buf.length = out;\n    }\n  } // return String.fromCharCode.apply(null, utf16buf);\n\n\n  return utils.applyFromCharCode(utf16buf);\n} // That's all for the pako functions.\n\n/**\n * Transform a javascript string into an array (typed if possible) of bytes,\n * UTF-8 encoded.\n * @param {String} str the string to encode\n * @return {Array|Uint8Array|Buffer} the UTF-8 encoded string.\n */\n\n\nexports.utf8encode = function utf8encode(str) {\n  if (support.nodebuffer) {\n    return nodeBuffer(str, \"utf-8\");\n  }\n\n  return string2buf(str);\n};\n/**\n * Transform a bytes array (or a representation) representing an UTF-8 encoded\n * string into a javascript string.\n * @param {Array|Uint8Array|Buffer} buf the data de decode\n * @return {String} the decoded string.\n */\n\n\nexports.utf8decode = function utf8decode(buf) {\n  if (support.nodebuffer) {\n    return utils.transformTo(\"nodebuffer\", buf).toString(\"utf-8\");\n  }\n\n  buf = utils.transformTo(support.uint8array ? \"uint8array\" : \"array\", buf); // return buf2string(buf);\n  // Chrome prefers to work with \"small\" chunks of data\n  // for the method buf2string.\n  // Firefox and Chrome has their own shortcut, IE doesn't seem to really care.\n\n  var result = [],\n      len = buf.length,\n      chunk = 65536;\n  var k = 0;\n\n  while (k < len) {\n    var nextBoundary = utf8border(buf, Math.min(k + chunk, len));\n\n    if (support.uint8array) {\n      result.push(buf2string(buf.subarray(k, nextBoundary)));\n    } else {\n      result.push(buf2string(buf.slice(k, nextBoundary)));\n    }\n\n    k = nextBoundary;\n  }\n\n  return result.join(\"\");\n};\n\n//# sourceURL=webpack://PizZip/./es6/utf8.js?");

/***/ }),

/***/ "./es6/utils.js":
/*!**********************!*\
  !*** ./es6/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar support = __webpack_require__(/*! ./support */ \"./es6/support.js\");\n\nvar compressions = __webpack_require__(/*! ./compressions */ \"./es6/compressions.js\");\n\nvar nodeBuffer = __webpack_require__(/*! ./nodeBuffer */ \"./es6/nodeBuffer.js\");\n/**\n * Convert a string to a \"binary string\" : a string containing only char codes between 0 and 255.\n * @param {string} str the string to transform.\n * @return {String} the binary string.\n */\n\n\nexports.string2binary = function (str) {\n  var result = \"\";\n\n  for (var i = 0; i < str.length; i++) {\n    result += String.fromCharCode(str.charCodeAt(i) & 0xff);\n  }\n\n  return result;\n};\n\nexports.arrayBuffer2Blob = function (buffer, mimeType) {\n  exports.checkSupport(\"blob\");\n  mimeType = mimeType || \"application/zip\";\n\n  try {\n    // Blob constructor\n    return new Blob([buffer], {\n      type: mimeType\n    });\n  } catch (e) {\n    try {\n      // deprecated, browser only, old way\n      var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;\n      var builder = new Builder();\n      builder.append(buffer);\n      return builder.getBlob(mimeType);\n    } catch (e) {\n      // well, fuck ?!\n      throw new Error(\"Bug : can't construct the Blob.\");\n    }\n  }\n};\n/**\n * The identity function.\n * @param {Object} input the input.\n * @return {Object} the same input.\n */\n\n\nfunction identity(input) {\n  return input;\n}\n/**\n * Fill in an array with a string.\n * @param {String} str the string to use.\n * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).\n * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.\n */\n\n\nfunction stringToArrayLike(str, array) {\n  for (var i = 0; i < str.length; ++i) {\n    array[i] = str.charCodeAt(i) & 0xff;\n  }\n\n  return array;\n}\n/**\n * Transform an array-like object to a string.\n * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.\n * @return {String} the result.\n */\n\n\nfunction arrayLikeToString(array) {\n  // Performances notes :\n  // --------------------\n  // String.fromCharCode.apply(null, array) is the fastest, see\n  // see http://jsperf.com/converting-a-uint8array-to-a-string/2\n  // but the stack is limited (and we can get huge arrays !).\n  //\n  // result += String.fromCharCode(array[i]); generate too many strings !\n  //\n  // This code is inspired by http://jsperf.com/arraybuffer-to-string-apply-performance/2\n  var chunk = 65536;\n  var result = [],\n      len = array.length,\n      type = exports.getTypeOf(array);\n  var k = 0,\n      canUseApply = true;\n\n  try {\n    switch (type) {\n      case \"uint8array\":\n        String.fromCharCode.apply(null, new Uint8Array(0));\n        break;\n\n      case \"nodebuffer\":\n        String.fromCharCode.apply(null, nodeBuffer(0));\n        break;\n    }\n  } catch (e) {\n    canUseApply = false;\n  } // no apply : slow and painful algorithm\n  // default browser on android 4.*\n\n\n  if (!canUseApply) {\n    var resultStr = \"\";\n\n    for (var i = 0; i < array.length; i++) {\n      resultStr += String.fromCharCode(array[i]);\n    }\n\n    return resultStr;\n  }\n\n  while (k < len && chunk > 1) {\n    try {\n      if (type === \"array\" || type === \"nodebuffer\") {\n        result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));\n      } else {\n        result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));\n      }\n\n      k += chunk;\n    } catch (e) {\n      chunk = Math.floor(chunk / 2);\n    }\n  }\n\n  return result.join(\"\");\n}\n\nexports.applyFromCharCode = arrayLikeToString;\n/**\n * Copy the data from an array-like to an other array-like.\n * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.\n * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.\n * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.\n */\n\nfunction arrayLikeToArrayLike(arrayFrom, arrayTo) {\n  for (var i = 0; i < arrayFrom.length; i++) {\n    arrayTo[i] = arrayFrom[i];\n  }\n\n  return arrayTo;\n} // a matrix containing functions to transform everything into everything.\n\n\nvar transform = {}; // string to ?\n\ntransform.string = {\n  string: identity,\n  array: function array(input) {\n    return stringToArrayLike(input, new Array(input.length));\n  },\n  arraybuffer: function arraybuffer(input) {\n    return transform.string.uint8array(input).buffer;\n  },\n  uint8array: function uint8array(input) {\n    return stringToArrayLike(input, new Uint8Array(input.length));\n  },\n  nodebuffer: function nodebuffer(input) {\n    return stringToArrayLike(input, nodeBuffer(input.length));\n  }\n}; // array to ?\n\ntransform.array = {\n  string: arrayLikeToString,\n  array: identity,\n  arraybuffer: function arraybuffer(input) {\n    return new Uint8Array(input).buffer;\n  },\n  uint8array: function uint8array(input) {\n    return new Uint8Array(input);\n  },\n  nodebuffer: function nodebuffer(input) {\n    return nodeBuffer(input);\n  }\n}; // arraybuffer to ?\n\ntransform.arraybuffer = {\n  string: function string(input) {\n    return arrayLikeToString(new Uint8Array(input));\n  },\n  array: function array(input) {\n    return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));\n  },\n  arraybuffer: identity,\n  uint8array: function uint8array(input) {\n    return new Uint8Array(input);\n  },\n  nodebuffer: function nodebuffer(input) {\n    return nodeBuffer(new Uint8Array(input));\n  }\n}; // uint8array to ?\n\ntransform.uint8array = {\n  string: arrayLikeToString,\n  array: function array(input) {\n    return arrayLikeToArrayLike(input, new Array(input.length));\n  },\n  arraybuffer: function arraybuffer(input) {\n    return input.buffer;\n  },\n  uint8array: identity,\n  nodebuffer: function nodebuffer(input) {\n    return nodeBuffer(input);\n  }\n}; // nodebuffer to ?\n\ntransform.nodebuffer = {\n  string: arrayLikeToString,\n  array: function array(input) {\n    return arrayLikeToArrayLike(input, new Array(input.length));\n  },\n  arraybuffer: function arraybuffer(input) {\n    return transform.nodebuffer.uint8array(input).buffer;\n  },\n  uint8array: function uint8array(input) {\n    return arrayLikeToArrayLike(input, new Uint8Array(input.length));\n  },\n  nodebuffer: identity\n};\n/**\n * Transform an input into any type.\n * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.\n * If no output type is specified, the unmodified input will be returned.\n * @param {String} outputType the output type.\n * @param {String|Array|ArrayBuffer|Uint8Array|Buffer} input the input to convert.\n * @throws {Error} an Error if the browser doesn't support the requested output type.\n */\n\nexports.transformTo = function (outputType, input) {\n  if (!input) {\n    // undefined, null, etc\n    // an empty string won't harm.\n    input = \"\";\n  }\n\n  if (!outputType) {\n    return input;\n  }\n\n  exports.checkSupport(outputType);\n  var inputType = exports.getTypeOf(input);\n  var result = transform[inputType][outputType](input);\n  return result;\n};\n/**\n * Return the type of the input.\n * The type will be in a format valid for PizZip.utils.transformTo : string, array, uint8array, arraybuffer.\n * @param {Object} input the input to identify.\n * @return {String} the (lowercase) type of the input.\n */\n\n\nexports.getTypeOf = function (input) {\n  if (typeof input === \"string\") {\n    return \"string\";\n  }\n\n  if (Object.prototype.toString.call(input) === \"[object Array]\") {\n    return \"array\";\n  }\n\n  if (support.nodebuffer && nodeBuffer.test(input)) {\n    return \"nodebuffer\";\n  }\n\n  if (support.uint8array && input instanceof Uint8Array) {\n    return \"uint8array\";\n  }\n\n  if (support.arraybuffer && input instanceof ArrayBuffer) {\n    return \"arraybuffer\";\n  }\n};\n/**\n * Throw an exception if the type is not supported.\n * @param {String} type the type to check.\n * @throws {Error} an Error if the browser doesn't support the requested type.\n */\n\n\nexports.checkSupport = function (type) {\n  var supported = support[type.toLowerCase()];\n\n  if (!supported) {\n    throw new Error(type + \" is not supported by this browser\");\n  }\n};\n\nexports.MAX_VALUE_16BITS = 65535;\nexports.MAX_VALUE_32BITS = -1; // well, \"\\xFF\\xFF\\xFF\\xFF\\xFF\\xFF\\xFF\\xFF\" is parsed as -1\n\n/**\n * Prettify a string read as binary.\n * @param {string} str the string to prettify.\n * @return {string} a pretty string.\n */\n\nexports.pretty = function (str) {\n  var res = \"\",\n      code,\n      i;\n\n  for (i = 0; i < (str || \"\").length; i++) {\n    code = str.charCodeAt(i);\n    res += \"\\\\x\" + (code < 16 ? \"0\" : \"\") + code.toString(16).toUpperCase();\n  }\n\n  return res;\n};\n/**\n * Find a compression registered in PizZip.\n * @param {string} compressionMethod the method magic to find.\n * @return {Object|null} the PizZip compression object, null if none found.\n */\n\n\nexports.findCompression = function (compressionMethod) {\n  for (var method in compressions) {\n    if (!compressions.hasOwnProperty(method)) {\n      continue;\n    }\n\n    if (compressions[method].magic === compressionMethod) {\n      return compressions[method];\n    }\n  }\n\n  return null;\n};\n/**\n * Cross-window, cross-Node-context regular expression detection\n * @param  {Object}  object Anything\n * @return {Boolean}        true if the object is a regular expression,\n * false otherwise\n */\n\n\nexports.isRegExp = function (object) {\n  return Object.prototype.toString.call(object) === \"[object RegExp]\";\n};\n/**\n * Merge the objects passed as parameters into a new one.\n * @private\n * @param {...Object} var_args All objects to merge.\n * @return {Object} a new object with the data of the others.\n */\n\n\nexports.extend = function () {\n  var result = {};\n  var i, attr;\n\n  for (i = 0; i < arguments.length; i++) {\n    // arguments is not enumerable in some browsers\n    for (attr in arguments[i]) {\n      if (arguments[i].hasOwnProperty(attr) && typeof result[attr] === \"undefined\") {\n        result[attr] = arguments[i][attr];\n      }\n    }\n  }\n\n  return result;\n};\n\n//# sourceURL=webpack://PizZip/./es6/utils.js?");

/***/ }),

/***/ "./es6/zipEntries.js":
/*!***************************!*\
  !*** ./es6/zipEntries.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar StringReader = __webpack_require__(/*! ./stringReader */ \"./es6/stringReader.js\");\n\nvar NodeBufferReader = __webpack_require__(/*! ./nodeBufferReader */ \"./es6/nodeBufferReader.js\");\n\nvar Uint8ArrayReader = __webpack_require__(/*! ./uint8ArrayReader */ \"./es6/uint8ArrayReader.js\");\n\nvar ArrayReader = __webpack_require__(/*! ./arrayReader */ \"./es6/arrayReader.js\");\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n\nvar sig = __webpack_require__(/*! ./signature */ \"./es6/signature.js\");\n\nvar ZipEntry = __webpack_require__(/*! ./zipEntry */ \"./es6/zipEntry.js\");\n\nvar support = __webpack_require__(/*! ./support */ \"./es6/support.js\"); //  class ZipEntries {{{\n\n/**\n * All the entries in the zip file.\n * @constructor\n * @param {String|ArrayBuffer|Uint8Array} data the binary stream to load.\n * @param {Object} loadOptions Options for loading the stream.\n */\n\n\nfunction ZipEntries(data, loadOptions) {\n  this.files = [];\n  this.loadOptions = loadOptions;\n\n  if (data) {\n    this.load(data);\n  }\n}\n\nZipEntries.prototype = {\n  /**\n   * Check that the reader is on the speficied signature.\n   * @param {string} expectedSignature the expected signature.\n   * @throws {Error} if it is an other signature.\n   */\n  checkSignature: function checkSignature(expectedSignature) {\n    var signature = this.reader.readString(4);\n\n    if (signature !== expectedSignature) {\n      throw new Error(\"Corrupted zip or bug : unexpected signature \" + \"(\" + utils.pretty(signature) + \", expected \" + utils.pretty(expectedSignature) + \")\");\n    }\n  },\n\n  /**\n   * Check if the given signature is at the given index.\n   * @param {number} askedIndex the index to check.\n   * @param {string} expectedSignature the signature to expect.\n   * @return {boolean} true if the signature is here, false otherwise.\n   */\n  isSignature: function isSignature(askedIndex, expectedSignature) {\n    var currentIndex = this.reader.index;\n    this.reader.setIndex(askedIndex);\n    var signature = this.reader.readString(4);\n    var result = signature === expectedSignature;\n    this.reader.setIndex(currentIndex);\n    return result;\n  },\n\n  /**\n   * Read the end of the central directory.\n   */\n  readBlockEndOfCentral: function readBlockEndOfCentral() {\n    this.diskNumber = this.reader.readInt(2);\n    this.diskWithCentralDirStart = this.reader.readInt(2);\n    this.centralDirRecordsOnThisDisk = this.reader.readInt(2);\n    this.centralDirRecords = this.reader.readInt(2);\n    this.centralDirSize = this.reader.readInt(4);\n    this.centralDirOffset = this.reader.readInt(4);\n    this.zipCommentLength = this.reader.readInt(2); // warning : the encoding depends of the system locale\n    // On a linux machine with LANG=en_US.utf8, this field is utf8 encoded.\n    // On a windows machine, this field is encoded with the localized windows code page.\n\n    var zipComment = this.reader.readData(this.zipCommentLength);\n    var decodeParamType = support.uint8array ? \"uint8array\" : \"array\"; // To get consistent behavior with the generation part, we will assume that\n    // this is utf8 encoded unless specified otherwise.\n\n    var decodeContent = utils.transformTo(decodeParamType, zipComment);\n    this.zipComment = this.loadOptions.decodeFileName(decodeContent);\n  },\n\n  /**\n   * Read the end of the Zip 64 central directory.\n   * Not merged with the method readEndOfCentral :\n   * The end of central can coexist with its Zip64 brother,\n   * I don't want to read the wrong number of bytes !\n   */\n  readBlockZip64EndOfCentral: function readBlockZip64EndOfCentral() {\n    this.zip64EndOfCentralSize = this.reader.readInt(8);\n    this.versionMadeBy = this.reader.readString(2);\n    this.versionNeeded = this.reader.readInt(2);\n    this.diskNumber = this.reader.readInt(4);\n    this.diskWithCentralDirStart = this.reader.readInt(4);\n    this.centralDirRecordsOnThisDisk = this.reader.readInt(8);\n    this.centralDirRecords = this.reader.readInt(8);\n    this.centralDirSize = this.reader.readInt(8);\n    this.centralDirOffset = this.reader.readInt(8);\n    this.zip64ExtensibleData = {};\n    var extraDataSize = this.zip64EndOfCentralSize - 44;\n    var index = 0;\n    var extraFieldId, extraFieldLength, extraFieldValue;\n\n    while (index < extraDataSize) {\n      extraFieldId = this.reader.readInt(2);\n      extraFieldLength = this.reader.readInt(4);\n      extraFieldValue = this.reader.readString(extraFieldLength);\n      this.zip64ExtensibleData[extraFieldId] = {\n        id: extraFieldId,\n        length: extraFieldLength,\n        value: extraFieldValue\n      };\n    }\n  },\n\n  /**\n   * Read the end of the Zip 64 central directory locator.\n   */\n  readBlockZip64EndOfCentralLocator: function readBlockZip64EndOfCentralLocator() {\n    this.diskWithZip64CentralDirStart = this.reader.readInt(4);\n    this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);\n    this.disksCount = this.reader.readInt(4);\n\n    if (this.disksCount > 1) {\n      throw new Error(\"Multi-volumes zip are not supported\");\n    }\n  },\n\n  /**\n   * Read the local files, based on the offset read in the central part.\n   */\n  readLocalFiles: function readLocalFiles() {\n    var i, file;\n\n    for (i = 0; i < this.files.length; i++) {\n      file = this.files[i];\n      this.reader.setIndex(file.localHeaderOffset);\n      this.checkSignature(sig.LOCAL_FILE_HEADER);\n      file.readLocalPart(this.reader);\n      file.handleUTF8();\n      file.processAttributes();\n    }\n  },\n\n  /**\n   * Read the central directory.\n   */\n  readCentralDir: function readCentralDir() {\n    var file;\n    this.reader.setIndex(this.centralDirOffset);\n\n    while (this.reader.readString(4) === sig.CENTRAL_FILE_HEADER) {\n      file = new ZipEntry({\n        zip64: this.zip64\n      }, this.loadOptions);\n      file.readCentralPart(this.reader);\n      this.files.push(file);\n    }\n\n    if (this.centralDirRecords !== this.files.length) {\n      if (this.centralDirRecords !== 0 && this.files.length === 0) {\n        // We expected some records but couldn't find ANY.\n        // This is really suspicious, as if something went wrong.\n        throw new Error(\"Corrupted zip or bug: expected \" + this.centralDirRecords + \" records in central dir, got \" + this.files.length);\n      } else {// We found some records but not all.\n        // Something is wrong but we got something for the user: no error here.\n        // console.warn(\"expected\", this.centralDirRecords, \"records in central dir, got\", this.files.length);\n      }\n    }\n  },\n\n  /**\n   * Read the end of central directory.\n   */\n  readEndOfCentral: function readEndOfCentral() {\n    var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);\n\n    if (offset < 0) {\n      // Check if the content is a truncated zip or complete garbage.\n      // A \"LOCAL_FILE_HEADER\" is not required at the beginning (auto\n      // extractible zip for example) but it can give a good hint.\n      // If an ajax request was used without responseType, we will also\n      // get unreadable data.\n      var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);\n\n      if (isGarbage) {\n        throw new Error(\"Can't find end of central directory : is this a zip file ?\");\n      } else {\n        throw new Error(\"Corrupted zip : can't find end of central directory\");\n      }\n    }\n\n    this.reader.setIndex(offset);\n    var endOfCentralDirOffset = offset;\n    this.checkSignature(sig.CENTRAL_DIRECTORY_END);\n    this.readBlockEndOfCentral();\n    /* extract from the zip spec :\n              4)  If one of the fields in the end of central directory\n                  record is too small to hold required data, the field\n                  should be set to -1 (0xFFFF or 0xFFFFFFFF) and the\n                  ZIP64 format record should be created.\n              5)  The end of central directory record and the\n                  Zip64 end of central directory locator record must\n                  reside on the same disk when splitting or spanning\n                  an archive.\n           */\n\n    if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {\n      this.zip64 = true;\n      /*\n               Warning : the zip64 extension is supported, but ONLY if the 64bits integer read from\n               the zip file can fit into a 32bits integer. This cannot be solved : Javascript represents\n               all numbers as 64-bit double precision IEEE 754 floating point numbers.\n               So, we have 53bits for integers and bitwise operations treat everything as 32bits.\n               see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Bitwise_Operators\n               and http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf section 8.5\n               */\n      // should look for a zip64 EOCD locator\n\n      offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);\n\n      if (offset < 0) {\n        throw new Error(\"Corrupted zip : can't find the ZIP64 end of central directory locator\");\n      }\n\n      this.reader.setIndex(offset);\n      this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);\n      this.readBlockZip64EndOfCentralLocator(); // now the zip64 EOCD record\n\n      if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {\n        // console.warn(\"ZIP64 end of central directory not where expected.\");\n        this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);\n\n        if (this.relativeOffsetEndOfZip64CentralDir < 0) {\n          throw new Error(\"Corrupted zip : can't find the ZIP64 end of central directory\");\n        }\n      }\n\n      this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);\n      this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);\n      this.readBlockZip64EndOfCentral();\n    }\n\n    var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;\n\n    if (this.zip64) {\n      expectedEndOfCentralDirOffset += 20; // end of central dir 64 locator\n\n      expectedEndOfCentralDirOffset += 12\n      /* should not include the leading 12 bytes */\n      + this.zip64EndOfCentralSize;\n    }\n\n    var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;\n\n    if (extraBytes > 0) {\n      // console.warn(extraBytes, \"extra bytes at beginning or within zipfile\");\n      if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) {// The offsets seem wrong, but we have something at the specified offset.\n        // So… we keep it.\n      } else {\n        // the offset is wrong, update the \"zero\" of the reader\n        // this happens if data has been prepended (crx files for example)\n        this.reader.zero = extraBytes;\n      }\n    } else if (extraBytes < 0) {\n      throw new Error(\"Corrupted zip: missing \" + Math.abs(extraBytes) + \" bytes.\");\n    }\n  },\n  prepareReader: function prepareReader(data) {\n    var type = utils.getTypeOf(data);\n    utils.checkSupport(type);\n\n    if (type === \"string\" && !support.uint8array) {\n      this.reader = new StringReader(data, this.loadOptions.optimizedBinaryString);\n    } else if (type === \"nodebuffer\") {\n      this.reader = new NodeBufferReader(data);\n    } else if (support.uint8array) {\n      this.reader = new Uint8ArrayReader(utils.transformTo(\"uint8array\", data));\n    } else if (support.array) {\n      this.reader = new ArrayReader(utils.transformTo(\"array\", data));\n    } else {\n      throw new Error(\"Unexpected error: unsupported type '\" + type + \"'\");\n    }\n  },\n\n  /**\n   * Read a zip file and create ZipEntries.\n   * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.\n   */\n  load: function load(data) {\n    this.prepareReader(data);\n    this.readEndOfCentral();\n    this.readCentralDir();\n    this.readLocalFiles();\n  }\n}; // }}} end of ZipEntries\n\nmodule.exports = ZipEntries;\n\n//# sourceURL=webpack://PizZip/./es6/zipEntries.js?");

/***/ }),

/***/ "./es6/zipEntry.js":
/*!*************************!*\
  !*** ./es6/zipEntry.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar StringReader = __webpack_require__(/*! ./stringReader */ \"./es6/stringReader.js\");\n\nvar utils = __webpack_require__(/*! ./utils */ \"./es6/utils.js\");\n\nvar CompressedObject = __webpack_require__(/*! ./compressedObject */ \"./es6/compressedObject.js\");\n\nvar pizzipProto = __webpack_require__(/*! ./object */ \"./es6/object.js\");\n\nvar support = __webpack_require__(/*! ./support */ \"./es6/support.js\");\n\nvar MADE_BY_DOS = 0x00;\nvar MADE_BY_UNIX = 0x03; // class ZipEntry {{{\n\n/**\n * An entry in the zip file.\n * @constructor\n * @param {Object} options Options of the current file.\n * @param {Object} loadOptions Options for loading the stream.\n */\n\nfunction ZipEntry(options, loadOptions) {\n  this.options = options;\n  this.loadOptions = loadOptions;\n}\n\nZipEntry.prototype = {\n  /**\n   * say if the file is encrypted.\n   * @return {boolean} true if the file is encrypted, false otherwise.\n   */\n  isEncrypted: function isEncrypted() {\n    // bit 1 is set\n    return (this.bitFlag & 0x0001) === 0x0001;\n  },\n\n  /**\n   * say if the file has utf-8 filename/comment.\n   * @return {boolean} true if the filename/comment is in utf-8, false otherwise.\n   */\n  useUTF8: function useUTF8() {\n    // bit 11 is set\n    return (this.bitFlag & 0x0800) === 0x0800;\n  },\n\n  /**\n   * Prepare the function used to generate the compressed content from this ZipFile.\n   * @param {DataReader} reader the reader to use.\n   * @param {number} from the offset from where we should read the data.\n   * @param {number} length the length of the data to read.\n   * @return {Function} the callback to get the compressed content (the type depends of the DataReader class).\n   */\n  prepareCompressedContent: function prepareCompressedContent(reader, from, length) {\n    return function () {\n      var previousIndex = reader.index;\n      reader.setIndex(from);\n      var compressedFileData = reader.readData(length);\n      reader.setIndex(previousIndex);\n      return compressedFileData;\n    };\n  },\n\n  /**\n   * Prepare the function used to generate the uncompressed content from this ZipFile.\n   * @param {DataReader} reader the reader to use.\n   * @param {number} from the offset from where we should read the data.\n   * @param {number} length the length of the data to read.\n   * @param {PizZip.compression} compression the compression used on this file.\n   * @param {number} uncompressedSize the uncompressed size to expect.\n   * @return {Function} the callback to get the uncompressed content (the type depends of the DataReader class).\n   */\n  prepareContent: function prepareContent(reader, from, length, compression, uncompressedSize) {\n    return function () {\n      var compressedFileData = utils.transformTo(compression.uncompressInputType, this.getCompressedContent());\n      var uncompressedFileData = compression.uncompress(compressedFileData);\n\n      if (uncompressedFileData.length !== uncompressedSize) {\n        throw new Error(\"Bug : uncompressed data size mismatch\");\n      }\n\n      return uncompressedFileData;\n    };\n  },\n\n  /**\n   * Read the local part of a zip file and add the info in this object.\n   * @param {DataReader} reader the reader to use.\n   */\n  readLocalPart: function readLocalPart(reader) {\n    // we already know everything from the central dir !\n    // If the central dir data are false, we are doomed.\n    // On the bright side, the local part is scary  : zip64, data descriptors, both, etc.\n    // The less data we get here, the more reliable this should be.\n    // Let's skip the whole header and dash to the data !\n    reader.skip(22); // in some zip created on windows, the filename stored in the central dir contains \\ instead of /.\n    // Strangely, the filename here is OK.\n    // I would love to treat these zip files as corrupted (see http://www.info-zip.org/FAQ.html#backslashes\n    // or APPNOTE#4.4.17.1, \"All slashes MUST be forward slashes '/'\") but there are a lot of bad zip generators...\n    // Search \"unzip mismatching \"local\" filename continuing with \"central\" filename version\" on\n    // the internet.\n    //\n    // I think I see the logic here : the central directory is used to display\n    // content and the local directory is used to extract the files. Mixing / and \\\n    // may be used to display \\ to windows users and use / when extracting the files.\n    // Unfortunately, this lead also to some issues : http://seclists.org/fulldisclosure/2009/Sep/394\n\n    this.fileNameLength = reader.readInt(2);\n    var localExtraFieldsLength = reader.readInt(2); // can't be sure this will be the same as the central dir\n\n    this.fileName = reader.readData(this.fileNameLength);\n    reader.skip(localExtraFieldsLength);\n\n    if (this.compressedSize === -1 || this.uncompressedSize === -1) {\n      throw new Error(\"Bug or corrupted zip : didn't get enough informations from the central directory \" + \"(compressedSize == -1 || uncompressedSize == -1)\");\n    }\n\n    var compression = utils.findCompression(this.compressionMethod);\n\n    if (compression === null) {\n      // no compression found\n      throw new Error(\"Corrupted zip : compression \" + utils.pretty(this.compressionMethod) + \" unknown (inner file : \" + utils.transformTo(\"string\", this.fileName) + \")\");\n    }\n\n    this.decompressed = new CompressedObject();\n    this.decompressed.compressedSize = this.compressedSize;\n    this.decompressed.uncompressedSize = this.uncompressedSize;\n    this.decompressed.crc32 = this.crc32;\n    this.decompressed.compressionMethod = this.compressionMethod;\n    this.decompressed.getCompressedContent = this.prepareCompressedContent(reader, reader.index, this.compressedSize, compression);\n    this.decompressed.getContent = this.prepareContent(reader, reader.index, this.compressedSize, compression, this.uncompressedSize); // we need to compute the crc32...\n\n    if (this.loadOptions.checkCRC32) {\n      this.decompressed = utils.transformTo(\"string\", this.decompressed.getContent());\n\n      if (pizzipProto.crc32(this.decompressed) !== this.crc32) {\n        throw new Error(\"Corrupted zip : CRC32 mismatch\");\n      }\n    }\n  },\n\n  /**\n   * Read the central part of a zip file and add the info in this object.\n   * @param {DataReader} reader the reader to use.\n   */\n  readCentralPart: function readCentralPart(reader) {\n    this.versionMadeBy = reader.readInt(2);\n    this.versionNeeded = reader.readInt(2);\n    this.bitFlag = reader.readInt(2);\n    this.compressionMethod = reader.readString(2);\n    this.date = reader.readDate();\n    this.crc32 = reader.readInt(4);\n    this.compressedSize = reader.readInt(4);\n    this.uncompressedSize = reader.readInt(4);\n    this.fileNameLength = reader.readInt(2);\n    this.extraFieldsLength = reader.readInt(2);\n    this.fileCommentLength = reader.readInt(2);\n    this.diskNumberStart = reader.readInt(2);\n    this.internalFileAttributes = reader.readInt(2);\n    this.externalFileAttributes = reader.readInt(4);\n    this.localHeaderOffset = reader.readInt(4);\n\n    if (this.isEncrypted()) {\n      throw new Error(\"Encrypted zip are not supported\");\n    }\n\n    this.fileName = reader.readData(this.fileNameLength);\n    this.readExtraFields(reader);\n    this.parseZIP64ExtraField(reader);\n    this.fileComment = reader.readData(this.fileCommentLength);\n  },\n\n  /**\n   * Parse the external file attributes and get the unix/dos permissions.\n   */\n  processAttributes: function processAttributes() {\n    this.unixPermissions = null;\n    this.dosPermissions = null;\n    var madeBy = this.versionMadeBy >> 8; // Check if we have the DOS directory flag set.\n    // We look for it in the DOS and UNIX permissions\n    // but some unknown platform could set it as a compatibility flag.\n\n    this.dir = !!(this.externalFileAttributes & 0x0010);\n\n    if (madeBy === MADE_BY_DOS) {\n      // first 6 bits (0 to 5)\n      this.dosPermissions = this.externalFileAttributes & 0x3f;\n    }\n\n    if (madeBy === MADE_BY_UNIX) {\n      this.unixPermissions = this.externalFileAttributes >> 16 & 0xffff; // the octal permissions are in (this.unixPermissions & 0x01FF).toString(8);\n    } // fail safe : if the name ends with a / it probably means a folder\n\n\n    if (!this.dir && this.fileNameStr.slice(-1) === \"/\") {\n      this.dir = true;\n    }\n  },\n\n  /**\n   * Parse the ZIP64 extra field and merge the info in the current ZipEntry.\n   */\n  parseZIP64ExtraField: function parseZIP64ExtraField() {\n    if (!this.extraFields[0x0001]) {\n      return;\n    } // should be something, preparing the extra reader\n\n\n    var extraReader = new StringReader(this.extraFields[0x0001].value); // I really hope that these 64bits integer can fit in 32 bits integer, because js\n    // won't let us have more.\n\n    if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {\n      this.uncompressedSize = extraReader.readInt(8);\n    }\n\n    if (this.compressedSize === utils.MAX_VALUE_32BITS) {\n      this.compressedSize = extraReader.readInt(8);\n    }\n\n    if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {\n      this.localHeaderOffset = extraReader.readInt(8);\n    }\n\n    if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {\n      this.diskNumberStart = extraReader.readInt(4);\n    }\n  },\n\n  /**\n   * Read the central part of a zip file and add the info in this object.\n   * @param {DataReader} reader the reader to use.\n   */\n  readExtraFields: function readExtraFields(reader) {\n    var start = reader.index;\n    var extraFieldId, extraFieldLength, extraFieldValue;\n    this.extraFields = this.extraFields || {};\n\n    while (reader.index < start + this.extraFieldsLength) {\n      extraFieldId = reader.readInt(2);\n      extraFieldLength = reader.readInt(2);\n      extraFieldValue = reader.readString(extraFieldLength);\n      this.extraFields[extraFieldId] = {\n        id: extraFieldId,\n        length: extraFieldLength,\n        value: extraFieldValue\n      };\n    }\n  },\n\n  /**\n   * Apply an UTF8 transformation if needed.\n   */\n  handleUTF8: function handleUTF8() {\n    var decodeParamType = support.uint8array ? \"uint8array\" : \"array\";\n\n    if (this.useUTF8()) {\n      this.fileNameStr = pizzipProto.utf8decode(this.fileName);\n      this.fileCommentStr = pizzipProto.utf8decode(this.fileComment);\n    } else {\n      var upath = this.findExtraFieldUnicodePath();\n\n      if (upath !== null) {\n        this.fileNameStr = upath;\n      } else {\n        var fileNameByteArray = utils.transformTo(decodeParamType, this.fileName);\n        this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);\n      }\n\n      var ucomment = this.findExtraFieldUnicodeComment();\n\n      if (ucomment !== null) {\n        this.fileCommentStr = ucomment;\n      } else {\n        var commentByteArray = utils.transformTo(decodeParamType, this.fileComment);\n        this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);\n      }\n    }\n  },\n\n  /**\n   * Find the unicode path declared in the extra field, if any.\n   * @return {String} the unicode path, null otherwise.\n   */\n  findExtraFieldUnicodePath: function findExtraFieldUnicodePath() {\n    var upathField = this.extraFields[0x7075];\n\n    if (upathField) {\n      var extraReader = new StringReader(upathField.value); // wrong version\n\n      if (extraReader.readInt(1) !== 1) {\n        return null;\n      } // the crc of the filename changed, this field is out of date.\n\n\n      if (pizzipProto.crc32(this.fileName) !== extraReader.readInt(4)) {\n        return null;\n      }\n\n      return pizzipProto.utf8decode(extraReader.readString(upathField.length - 5));\n    }\n\n    return null;\n  },\n\n  /**\n   * Find the unicode comment declared in the extra field, if any.\n   * @return {String} the unicode comment, null otherwise.\n   */\n  findExtraFieldUnicodeComment: function findExtraFieldUnicodeComment() {\n    var ucommentField = this.extraFields[0x6375];\n\n    if (ucommentField) {\n      var extraReader = new StringReader(ucommentField.value); // wrong version\n\n      if (extraReader.readInt(1) !== 1) {\n        return null;\n      } // the crc of the comment changed, this field is out of date.\n\n\n      if (pizzipProto.crc32(this.fileComment) !== extraReader.readInt(4)) {\n        return null;\n      }\n\n      return pizzipProto.utf8decode(extraReader.readString(ucommentField.length - 5));\n    }\n\n    return null;\n  }\n};\nmodule.exports = ZipEntry;\n\n//# sourceURL=webpack://PizZip/./es6/zipEntry.js?");

/***/ }),

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nexports.byteLength = byteLength\nexports.toByteArray = toByteArray\nexports.fromByteArray = fromByteArray\n\nvar lookup = []\nvar revLookup = []\nvar Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array\n\nvar code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'\nfor (var i = 0, len = code.length; i < len; ++i) {\n  lookup[i] = code[i]\n  revLookup[code.charCodeAt(i)] = i\n}\n\n// Support decoding URL-safe base64 strings, as Node.js does.\n// See: https://en.wikipedia.org/wiki/Base64#URL_applications\nrevLookup['-'.charCodeAt(0)] = 62\nrevLookup['_'.charCodeAt(0)] = 63\n\nfunction getLens (b64) {\n  var len = b64.length\n\n  if (len % 4 > 0) {\n    throw new Error('Invalid string. Length must be a multiple of 4')\n  }\n\n  // Trim off extra bytes after placeholder bytes are found\n  // See: https://github.com/beatgammit/base64-js/issues/42\n  var validLen = b64.indexOf('=')\n  if (validLen === -1) validLen = len\n\n  var placeHoldersLen = validLen === len\n    ? 0\n    : 4 - (validLen % 4)\n\n  return [validLen, placeHoldersLen]\n}\n\n// base64 is 4/3 + up to two characters of the original data\nfunction byteLength (b64) {\n  var lens = getLens(b64)\n  var validLen = lens[0]\n  var placeHoldersLen = lens[1]\n  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen\n}\n\nfunction _byteLength (b64, validLen, placeHoldersLen) {\n  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen\n}\n\nfunction toByteArray (b64) {\n  var tmp\n  var lens = getLens(b64)\n  var validLen = lens[0]\n  var placeHoldersLen = lens[1]\n\n  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))\n\n  var curByte = 0\n\n  // if there are placeholders, only get up to the last complete 4 chars\n  var len = placeHoldersLen > 0\n    ? validLen - 4\n    : validLen\n\n  for (var i = 0; i < len; i += 4) {\n    tmp =\n      (revLookup[b64.charCodeAt(i)] << 18) |\n      (revLookup[b64.charCodeAt(i + 1)] << 12) |\n      (revLookup[b64.charCodeAt(i + 2)] << 6) |\n      revLookup[b64.charCodeAt(i + 3)]\n    arr[curByte++] = (tmp >> 16) & 0xFF\n    arr[curByte++] = (tmp >> 8) & 0xFF\n    arr[curByte++] = tmp & 0xFF\n  }\n\n  if (placeHoldersLen === 2) {\n    tmp =\n      (revLookup[b64.charCodeAt(i)] << 2) |\n      (revLookup[b64.charCodeAt(i + 1)] >> 4)\n    arr[curByte++] = tmp & 0xFF\n  }\n\n  if (placeHoldersLen === 1) {\n    tmp =\n      (revLookup[b64.charCodeAt(i)] << 10) |\n      (revLookup[b64.charCodeAt(i + 1)] << 4) |\n      (revLookup[b64.charCodeAt(i + 2)] >> 2)\n    arr[curByte++] = (tmp >> 8) & 0xFF\n    arr[curByte++] = tmp & 0xFF\n  }\n\n  return arr\n}\n\nfunction tripletToBase64 (num) {\n  return lookup[num >> 18 & 0x3F] +\n    lookup[num >> 12 & 0x3F] +\n    lookup[num >> 6 & 0x3F] +\n    lookup[num & 0x3F]\n}\n\nfunction encodeChunk (uint8, start, end) {\n  var tmp\n  var output = []\n  for (var i = start; i < end; i += 3) {\n    tmp =\n      ((uint8[i] << 16) & 0xFF0000) +\n      ((uint8[i + 1] << 8) & 0xFF00) +\n      (uint8[i + 2] & 0xFF)\n    output.push(tripletToBase64(tmp))\n  }\n  return output.join('')\n}\n\nfunction fromByteArray (uint8) {\n  var tmp\n  var len = uint8.length\n  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes\n  var parts = []\n  var maxChunkLength = 16383 // must be multiple of 3\n\n  // go through the array every three bytes, we'll deal with trailing stuff later\n  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {\n    parts.push(encodeChunk(\n      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)\n    ))\n  }\n\n  // pad the end with zeros, but make sure to not forget the extra bytes\n  if (extraBytes === 1) {\n    tmp = uint8[len - 1]\n    parts.push(\n      lookup[tmp >> 2] +\n      lookup[(tmp << 4) & 0x3F] +\n      '=='\n    )\n  } else if (extraBytes === 2) {\n    tmp = (uint8[len - 2] << 8) + uint8[len - 1]\n    parts.push(\n      lookup[tmp >> 10] +\n      lookup[(tmp >> 4) & 0x3F] +\n      lookup[(tmp << 2) & 0x3F] +\n      '='\n    )\n  }\n\n  return parts.join('')\n}\n\n\n//# sourceURL=webpack://PizZip/./node_modules/base64-js/index.js?");

/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(global) {/*!\n * The buffer module from node.js, for the browser.\n *\n * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>\n * @license  MIT\n */\n/* eslint-disable no-proto */\n\n\n\nvar base64 = __webpack_require__(/*! base64-js */ \"./node_modules/base64-js/index.js\")\nvar ieee754 = __webpack_require__(/*! ieee754 */ \"./node_modules/ieee754/index.js\")\nvar isArray = __webpack_require__(/*! isarray */ \"./node_modules/isarray/index.js\")\n\nexports.Buffer = Buffer\nexports.SlowBuffer = SlowBuffer\nexports.INSPECT_MAX_BYTES = 50\n\n/**\n * If `Buffer.TYPED_ARRAY_SUPPORT`:\n *   === true    Use Uint8Array implementation (fastest)\n *   === false   Use Object implementation (most compatible, even IE6)\n *\n * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,\n * Opera 11.6+, iOS 4.2+.\n *\n * Due to various browser bugs, sometimes the Object implementation will be used even\n * when the browser supports typed arrays.\n *\n * Note:\n *\n *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,\n *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.\n *\n *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.\n *\n *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of\n *     incorrect length in some situations.\n\n * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they\n * get the Object implementation, which is slower but behaves correctly.\n */\nBuffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined\n  ? global.TYPED_ARRAY_SUPPORT\n  : typedArraySupport()\n\n/*\n * Export kMaxLength after typed array support is determined.\n */\nexports.kMaxLength = kMaxLength()\n\nfunction typedArraySupport () {\n  try {\n    var arr = new Uint8Array(1)\n    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}\n    return arr.foo() === 42 && // typed array instances can be augmented\n        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`\n        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`\n  } catch (e) {\n    return false\n  }\n}\n\nfunction kMaxLength () {\n  return Buffer.TYPED_ARRAY_SUPPORT\n    ? 0x7fffffff\n    : 0x3fffffff\n}\n\nfunction createBuffer (that, length) {\n  if (kMaxLength() < length) {\n    throw new RangeError('Invalid typed array length')\n  }\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    // Return an augmented `Uint8Array` instance, for best performance\n    that = new Uint8Array(length)\n    that.__proto__ = Buffer.prototype\n  } else {\n    // Fallback: Return an object instance of the Buffer class\n    if (that === null) {\n      that = new Buffer(length)\n    }\n    that.length = length\n  }\n\n  return that\n}\n\n/**\n * The Buffer constructor returns instances of `Uint8Array` that have their\n * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of\n * `Uint8Array`, so the returned instances will have all the node `Buffer` methods\n * and the `Uint8Array` methods. Square bracket notation works as expected -- it\n * returns a single octet.\n *\n * The `Uint8Array` prototype remains unmodified.\n */\n\nfunction Buffer (arg, encodingOrOffset, length) {\n  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {\n    return new Buffer(arg, encodingOrOffset, length)\n  }\n\n  // Common case.\n  if (typeof arg === 'number') {\n    if (typeof encodingOrOffset === 'string') {\n      throw new Error(\n        'If encoding is specified then the first argument must be a string'\n      )\n    }\n    return allocUnsafe(this, arg)\n  }\n  return from(this, arg, encodingOrOffset, length)\n}\n\nBuffer.poolSize = 8192 // not used by this implementation\n\n// TODO: Legacy, not needed anymore. Remove in next major version.\nBuffer._augment = function (arr) {\n  arr.__proto__ = Buffer.prototype\n  return arr\n}\n\nfunction from (that, value, encodingOrOffset, length) {\n  if (typeof value === 'number') {\n    throw new TypeError('\"value\" argument must not be a number')\n  }\n\n  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {\n    return fromArrayBuffer(that, value, encodingOrOffset, length)\n  }\n\n  if (typeof value === 'string') {\n    return fromString(that, value, encodingOrOffset)\n  }\n\n  return fromObject(that, value)\n}\n\n/**\n * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError\n * if value is a number.\n * Buffer.from(str[, encoding])\n * Buffer.from(array)\n * Buffer.from(buffer)\n * Buffer.from(arrayBuffer[, byteOffset[, length]])\n **/\nBuffer.from = function (value, encodingOrOffset, length) {\n  return from(null, value, encodingOrOffset, length)\n}\n\nif (Buffer.TYPED_ARRAY_SUPPORT) {\n  Buffer.prototype.__proto__ = Uint8Array.prototype\n  Buffer.__proto__ = Uint8Array\n  if (typeof Symbol !== 'undefined' && Symbol.species &&\n      Buffer[Symbol.species] === Buffer) {\n    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97\n    Object.defineProperty(Buffer, Symbol.species, {\n      value: null,\n      configurable: true\n    })\n  }\n}\n\nfunction assertSize (size) {\n  if (typeof size !== 'number') {\n    throw new TypeError('\"size\" argument must be a number')\n  } else if (size < 0) {\n    throw new RangeError('\"size\" argument must not be negative')\n  }\n}\n\nfunction alloc (that, size, fill, encoding) {\n  assertSize(size)\n  if (size <= 0) {\n    return createBuffer(that, size)\n  }\n  if (fill !== undefined) {\n    // Only pay attention to encoding if it's a string. This\n    // prevents accidentally sending in a number that would\n    // be interpretted as a start offset.\n    return typeof encoding === 'string'\n      ? createBuffer(that, size).fill(fill, encoding)\n      : createBuffer(that, size).fill(fill)\n  }\n  return createBuffer(that, size)\n}\n\n/**\n * Creates a new filled Buffer instance.\n * alloc(size[, fill[, encoding]])\n **/\nBuffer.alloc = function (size, fill, encoding) {\n  return alloc(null, size, fill, encoding)\n}\n\nfunction allocUnsafe (that, size) {\n  assertSize(size)\n  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)\n  if (!Buffer.TYPED_ARRAY_SUPPORT) {\n    for (var i = 0; i < size; ++i) {\n      that[i] = 0\n    }\n  }\n  return that\n}\n\n/**\n * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.\n * */\nBuffer.allocUnsafe = function (size) {\n  return allocUnsafe(null, size)\n}\n/**\n * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.\n */\nBuffer.allocUnsafeSlow = function (size) {\n  return allocUnsafe(null, size)\n}\n\nfunction fromString (that, string, encoding) {\n  if (typeof encoding !== 'string' || encoding === '') {\n    encoding = 'utf8'\n  }\n\n  if (!Buffer.isEncoding(encoding)) {\n    throw new TypeError('\"encoding\" must be a valid string encoding')\n  }\n\n  var length = byteLength(string, encoding) | 0\n  that = createBuffer(that, length)\n\n  var actual = that.write(string, encoding)\n\n  if (actual !== length) {\n    // Writing a hex string, for example, that contains invalid characters will\n    // cause everything after the first invalid character to be ignored. (e.g.\n    // 'abxxcd' will be treated as 'ab')\n    that = that.slice(0, actual)\n  }\n\n  return that\n}\n\nfunction fromArrayLike (that, array) {\n  var length = array.length < 0 ? 0 : checked(array.length) | 0\n  that = createBuffer(that, length)\n  for (var i = 0; i < length; i += 1) {\n    that[i] = array[i] & 255\n  }\n  return that\n}\n\nfunction fromArrayBuffer (that, array, byteOffset, length) {\n  array.byteLength // this throws if `array` is not a valid ArrayBuffer\n\n  if (byteOffset < 0 || array.byteLength < byteOffset) {\n    throw new RangeError('\\'offset\\' is out of bounds')\n  }\n\n  if (array.byteLength < byteOffset + (length || 0)) {\n    throw new RangeError('\\'length\\' is out of bounds')\n  }\n\n  if (byteOffset === undefined && length === undefined) {\n    array = new Uint8Array(array)\n  } else if (length === undefined) {\n    array = new Uint8Array(array, byteOffset)\n  } else {\n    array = new Uint8Array(array, byteOffset, length)\n  }\n\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    // Return an augmented `Uint8Array` instance, for best performance\n    that = array\n    that.__proto__ = Buffer.prototype\n  } else {\n    // Fallback: Return an object instance of the Buffer class\n    that = fromArrayLike(that, array)\n  }\n  return that\n}\n\nfunction fromObject (that, obj) {\n  if (Buffer.isBuffer(obj)) {\n    var len = checked(obj.length) | 0\n    that = createBuffer(that, len)\n\n    if (that.length === 0) {\n      return that\n    }\n\n    obj.copy(that, 0, 0, len)\n    return that\n  }\n\n  if (obj) {\n    if ((typeof ArrayBuffer !== 'undefined' &&\n        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {\n      if (typeof obj.length !== 'number' || isnan(obj.length)) {\n        return createBuffer(that, 0)\n      }\n      return fromArrayLike(that, obj)\n    }\n\n    if (obj.type === 'Buffer' && isArray(obj.data)) {\n      return fromArrayLike(that, obj.data)\n    }\n  }\n\n  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')\n}\n\nfunction checked (length) {\n  // Note: cannot use `length < kMaxLength()` here because that fails when\n  // length is NaN (which is otherwise coerced to zero.)\n  if (length >= kMaxLength()) {\n    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +\n                         'size: 0x' + kMaxLength().toString(16) + ' bytes')\n  }\n  return length | 0\n}\n\nfunction SlowBuffer (length) {\n  if (+length != length) { // eslint-disable-line eqeqeq\n    length = 0\n  }\n  return Buffer.alloc(+length)\n}\n\nBuffer.isBuffer = function isBuffer (b) {\n  return !!(b != null && b._isBuffer)\n}\n\nBuffer.compare = function compare (a, b) {\n  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {\n    throw new TypeError('Arguments must be Buffers')\n  }\n\n  if (a === b) return 0\n\n  var x = a.length\n  var y = b.length\n\n  for (var i = 0, len = Math.min(x, y); i < len; ++i) {\n    if (a[i] !== b[i]) {\n      x = a[i]\n      y = b[i]\n      break\n    }\n  }\n\n  if (x < y) return -1\n  if (y < x) return 1\n  return 0\n}\n\nBuffer.isEncoding = function isEncoding (encoding) {\n  switch (String(encoding).toLowerCase()) {\n    case 'hex':\n    case 'utf8':\n    case 'utf-8':\n    case 'ascii':\n    case 'latin1':\n    case 'binary':\n    case 'base64':\n    case 'ucs2':\n    case 'ucs-2':\n    case 'utf16le':\n    case 'utf-16le':\n      return true\n    default:\n      return false\n  }\n}\n\nBuffer.concat = function concat (list, length) {\n  if (!isArray(list)) {\n    throw new TypeError('\"list\" argument must be an Array of Buffers')\n  }\n\n  if (list.length === 0) {\n    return Buffer.alloc(0)\n  }\n\n  var i\n  if (length === undefined) {\n    length = 0\n    for (i = 0; i < list.length; ++i) {\n      length += list[i].length\n    }\n  }\n\n  var buffer = Buffer.allocUnsafe(length)\n  var pos = 0\n  for (i = 0; i < list.length; ++i) {\n    var buf = list[i]\n    if (!Buffer.isBuffer(buf)) {\n      throw new TypeError('\"list\" argument must be an Array of Buffers')\n    }\n    buf.copy(buffer, pos)\n    pos += buf.length\n  }\n  return buffer\n}\n\nfunction byteLength (string, encoding) {\n  if (Buffer.isBuffer(string)) {\n    return string.length\n  }\n  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&\n      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {\n    return string.byteLength\n  }\n  if (typeof string !== 'string') {\n    string = '' + string\n  }\n\n  var len = string.length\n  if (len === 0) return 0\n\n  // Use a for loop to avoid recursion\n  var loweredCase = false\n  for (;;) {\n    switch (encoding) {\n      case 'ascii':\n      case 'latin1':\n      case 'binary':\n        return len\n      case 'utf8':\n      case 'utf-8':\n      case undefined:\n        return utf8ToBytes(string).length\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return len * 2\n      case 'hex':\n        return len >>> 1\n      case 'base64':\n        return base64ToBytes(string).length\n      default:\n        if (loweredCase) return utf8ToBytes(string).length // assume utf8\n        encoding = ('' + encoding).toLowerCase()\n        loweredCase = true\n    }\n  }\n}\nBuffer.byteLength = byteLength\n\nfunction slowToString (encoding, start, end) {\n  var loweredCase = false\n\n  // No need to verify that \"this.length <= MAX_UINT32\" since it's a read-only\n  // property of a typed array.\n\n  // This behaves neither like String nor Uint8Array in that we set start/end\n  // to their upper/lower bounds if the value passed is out of range.\n  // undefined is handled specially as per ECMA-262 6th Edition,\n  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.\n  if (start === undefined || start < 0) {\n    start = 0\n  }\n  // Return early if start > this.length. Done here to prevent potential uint32\n  // coercion fail below.\n  if (start > this.length) {\n    return ''\n  }\n\n  if (end === undefined || end > this.length) {\n    end = this.length\n  }\n\n  if (end <= 0) {\n    return ''\n  }\n\n  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.\n  end >>>= 0\n  start >>>= 0\n\n  if (end <= start) {\n    return ''\n  }\n\n  if (!encoding) encoding = 'utf8'\n\n  while (true) {\n    switch (encoding) {\n      case 'hex':\n        return hexSlice(this, start, end)\n\n      case 'utf8':\n      case 'utf-8':\n        return utf8Slice(this, start, end)\n\n      case 'ascii':\n        return asciiSlice(this, start, end)\n\n      case 'latin1':\n      case 'binary':\n        return latin1Slice(this, start, end)\n\n      case 'base64':\n        return base64Slice(this, start, end)\n\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return utf16leSlice(this, start, end)\n\n      default:\n        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)\n        encoding = (encoding + '').toLowerCase()\n        loweredCase = true\n    }\n  }\n}\n\n// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect\n// Buffer instances.\nBuffer.prototype._isBuffer = true\n\nfunction swap (b, n, m) {\n  var i = b[n]\n  b[n] = b[m]\n  b[m] = i\n}\n\nBuffer.prototype.swap16 = function swap16 () {\n  var len = this.length\n  if (len % 2 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 16-bits')\n  }\n  for (var i = 0; i < len; i += 2) {\n    swap(this, i, i + 1)\n  }\n  return this\n}\n\nBuffer.prototype.swap32 = function swap32 () {\n  var len = this.length\n  if (len % 4 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 32-bits')\n  }\n  for (var i = 0; i < len; i += 4) {\n    swap(this, i, i + 3)\n    swap(this, i + 1, i + 2)\n  }\n  return this\n}\n\nBuffer.prototype.swap64 = function swap64 () {\n  var len = this.length\n  if (len % 8 !== 0) {\n    throw new RangeError('Buffer size must be a multiple of 64-bits')\n  }\n  for (var i = 0; i < len; i += 8) {\n    swap(this, i, i + 7)\n    swap(this, i + 1, i + 6)\n    swap(this, i + 2, i + 5)\n    swap(this, i + 3, i + 4)\n  }\n  return this\n}\n\nBuffer.prototype.toString = function toString () {\n  var length = this.length | 0\n  if (length === 0) return ''\n  if (arguments.length === 0) return utf8Slice(this, 0, length)\n  return slowToString.apply(this, arguments)\n}\n\nBuffer.prototype.equals = function equals (b) {\n  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')\n  if (this === b) return true\n  return Buffer.compare(this, b) === 0\n}\n\nBuffer.prototype.inspect = function inspect () {\n  var str = ''\n  var max = exports.INSPECT_MAX_BYTES\n  if (this.length > 0) {\n    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')\n    if (this.length > max) str += ' ... '\n  }\n  return '<Buffer ' + str + '>'\n}\n\nBuffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {\n  if (!Buffer.isBuffer(target)) {\n    throw new TypeError('Argument must be a Buffer')\n  }\n\n  if (start === undefined) {\n    start = 0\n  }\n  if (end === undefined) {\n    end = target ? target.length : 0\n  }\n  if (thisStart === undefined) {\n    thisStart = 0\n  }\n  if (thisEnd === undefined) {\n    thisEnd = this.length\n  }\n\n  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {\n    throw new RangeError('out of range index')\n  }\n\n  if (thisStart >= thisEnd && start >= end) {\n    return 0\n  }\n  if (thisStart >= thisEnd) {\n    return -1\n  }\n  if (start >= end) {\n    return 1\n  }\n\n  start >>>= 0\n  end >>>= 0\n  thisStart >>>= 0\n  thisEnd >>>= 0\n\n  if (this === target) return 0\n\n  var x = thisEnd - thisStart\n  var y = end - start\n  var len = Math.min(x, y)\n\n  var thisCopy = this.slice(thisStart, thisEnd)\n  var targetCopy = target.slice(start, end)\n\n  for (var i = 0; i < len; ++i) {\n    if (thisCopy[i] !== targetCopy[i]) {\n      x = thisCopy[i]\n      y = targetCopy[i]\n      break\n    }\n  }\n\n  if (x < y) return -1\n  if (y < x) return 1\n  return 0\n}\n\n// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,\n// OR the last index of `val` in `buffer` at offset <= `byteOffset`.\n//\n// Arguments:\n// - buffer - a Buffer to search\n// - val - a string, Buffer, or number\n// - byteOffset - an index into `buffer`; will be clamped to an int32\n// - encoding - an optional encoding, relevant is val is a string\n// - dir - true for indexOf, false for lastIndexOf\nfunction bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {\n  // Empty buffer means no match\n  if (buffer.length === 0) return -1\n\n  // Normalize byteOffset\n  if (typeof byteOffset === 'string') {\n    encoding = byteOffset\n    byteOffset = 0\n  } else if (byteOffset > 0x7fffffff) {\n    byteOffset = 0x7fffffff\n  } else if (byteOffset < -0x80000000) {\n    byteOffset = -0x80000000\n  }\n  byteOffset = +byteOffset  // Coerce to Number.\n  if (isNaN(byteOffset)) {\n    // byteOffset: it it's undefined, null, NaN, \"foo\", etc, search whole buffer\n    byteOffset = dir ? 0 : (buffer.length - 1)\n  }\n\n  // Normalize byteOffset: negative offsets start from the end of the buffer\n  if (byteOffset < 0) byteOffset = buffer.length + byteOffset\n  if (byteOffset >= buffer.length) {\n    if (dir) return -1\n    else byteOffset = buffer.length - 1\n  } else if (byteOffset < 0) {\n    if (dir) byteOffset = 0\n    else return -1\n  }\n\n  // Normalize val\n  if (typeof val === 'string') {\n    val = Buffer.from(val, encoding)\n  }\n\n  // Finally, search either indexOf (if dir is true) or lastIndexOf\n  if (Buffer.isBuffer(val)) {\n    // Special case: looking for empty string/buffer always fails\n    if (val.length === 0) {\n      return -1\n    }\n    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)\n  } else if (typeof val === 'number') {\n    val = val & 0xFF // Search for a byte value [0-255]\n    if (Buffer.TYPED_ARRAY_SUPPORT &&\n        typeof Uint8Array.prototype.indexOf === 'function') {\n      if (dir) {\n        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)\n      } else {\n        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)\n      }\n    }\n    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)\n  }\n\n  throw new TypeError('val must be string, number or Buffer')\n}\n\nfunction arrayIndexOf (arr, val, byteOffset, encoding, dir) {\n  var indexSize = 1\n  var arrLength = arr.length\n  var valLength = val.length\n\n  if (encoding !== undefined) {\n    encoding = String(encoding).toLowerCase()\n    if (encoding === 'ucs2' || encoding === 'ucs-2' ||\n        encoding === 'utf16le' || encoding === 'utf-16le') {\n      if (arr.length < 2 || val.length < 2) {\n        return -1\n      }\n      indexSize = 2\n      arrLength /= 2\n      valLength /= 2\n      byteOffset /= 2\n    }\n  }\n\n  function read (buf, i) {\n    if (indexSize === 1) {\n      return buf[i]\n    } else {\n      return buf.readUInt16BE(i * indexSize)\n    }\n  }\n\n  var i\n  if (dir) {\n    var foundIndex = -1\n    for (i = byteOffset; i < arrLength; i++) {\n      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {\n        if (foundIndex === -1) foundIndex = i\n        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize\n      } else {\n        if (foundIndex !== -1) i -= i - foundIndex\n        foundIndex = -1\n      }\n    }\n  } else {\n    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength\n    for (i = byteOffset; i >= 0; i--) {\n      var found = true\n      for (var j = 0; j < valLength; j++) {\n        if (read(arr, i + j) !== read(val, j)) {\n          found = false\n          break\n        }\n      }\n      if (found) return i\n    }\n  }\n\n  return -1\n}\n\nBuffer.prototype.includes = function includes (val, byteOffset, encoding) {\n  return this.indexOf(val, byteOffset, encoding) !== -1\n}\n\nBuffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {\n  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)\n}\n\nBuffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {\n  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)\n}\n\nfunction hexWrite (buf, string, offset, length) {\n  offset = Number(offset) || 0\n  var remaining = buf.length - offset\n  if (!length) {\n    length = remaining\n  } else {\n    length = Number(length)\n    if (length > remaining) {\n      length = remaining\n    }\n  }\n\n  // must be an even number of digits\n  var strLen = string.length\n  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')\n\n  if (length > strLen / 2) {\n    length = strLen / 2\n  }\n  for (var i = 0; i < length; ++i) {\n    var parsed = parseInt(string.substr(i * 2, 2), 16)\n    if (isNaN(parsed)) return i\n    buf[offset + i] = parsed\n  }\n  return i\n}\n\nfunction utf8Write (buf, string, offset, length) {\n  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)\n}\n\nfunction asciiWrite (buf, string, offset, length) {\n  return blitBuffer(asciiToBytes(string), buf, offset, length)\n}\n\nfunction latin1Write (buf, string, offset, length) {\n  return asciiWrite(buf, string, offset, length)\n}\n\nfunction base64Write (buf, string, offset, length) {\n  return blitBuffer(base64ToBytes(string), buf, offset, length)\n}\n\nfunction ucs2Write (buf, string, offset, length) {\n  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)\n}\n\nBuffer.prototype.write = function write (string, offset, length, encoding) {\n  // Buffer#write(string)\n  if (offset === undefined) {\n    encoding = 'utf8'\n    length = this.length\n    offset = 0\n  // Buffer#write(string, encoding)\n  } else if (length === undefined && typeof offset === 'string') {\n    encoding = offset\n    length = this.length\n    offset = 0\n  // Buffer#write(string, offset[, length][, encoding])\n  } else if (isFinite(offset)) {\n    offset = offset | 0\n    if (isFinite(length)) {\n      length = length | 0\n      if (encoding === undefined) encoding = 'utf8'\n    } else {\n      encoding = length\n      length = undefined\n    }\n  // legacy write(string, encoding, offset, length) - remove in v0.13\n  } else {\n    throw new Error(\n      'Buffer.write(string, encoding, offset[, length]) is no longer supported'\n    )\n  }\n\n  var remaining = this.length - offset\n  if (length === undefined || length > remaining) length = remaining\n\n  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {\n    throw new RangeError('Attempt to write outside buffer bounds')\n  }\n\n  if (!encoding) encoding = 'utf8'\n\n  var loweredCase = false\n  for (;;) {\n    switch (encoding) {\n      case 'hex':\n        return hexWrite(this, string, offset, length)\n\n      case 'utf8':\n      case 'utf-8':\n        return utf8Write(this, string, offset, length)\n\n      case 'ascii':\n        return asciiWrite(this, string, offset, length)\n\n      case 'latin1':\n      case 'binary':\n        return latin1Write(this, string, offset, length)\n\n      case 'base64':\n        // Warning: maxLength not taken into account in base64Write\n        return base64Write(this, string, offset, length)\n\n      case 'ucs2':\n      case 'ucs-2':\n      case 'utf16le':\n      case 'utf-16le':\n        return ucs2Write(this, string, offset, length)\n\n      default:\n        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)\n        encoding = ('' + encoding).toLowerCase()\n        loweredCase = true\n    }\n  }\n}\n\nBuffer.prototype.toJSON = function toJSON () {\n  return {\n    type: 'Buffer',\n    data: Array.prototype.slice.call(this._arr || this, 0)\n  }\n}\n\nfunction base64Slice (buf, start, end) {\n  if (start === 0 && end === buf.length) {\n    return base64.fromByteArray(buf)\n  } else {\n    return base64.fromByteArray(buf.slice(start, end))\n  }\n}\n\nfunction utf8Slice (buf, start, end) {\n  end = Math.min(buf.length, end)\n  var res = []\n\n  var i = start\n  while (i < end) {\n    var firstByte = buf[i]\n    var codePoint = null\n    var bytesPerSequence = (firstByte > 0xEF) ? 4\n      : (firstByte > 0xDF) ? 3\n      : (firstByte > 0xBF) ? 2\n      : 1\n\n    if (i + bytesPerSequence <= end) {\n      var secondByte, thirdByte, fourthByte, tempCodePoint\n\n      switch (bytesPerSequence) {\n        case 1:\n          if (firstByte < 0x80) {\n            codePoint = firstByte\n          }\n          break\n        case 2:\n          secondByte = buf[i + 1]\n          if ((secondByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)\n            if (tempCodePoint > 0x7F) {\n              codePoint = tempCodePoint\n            }\n          }\n          break\n        case 3:\n          secondByte = buf[i + 1]\n          thirdByte = buf[i + 2]\n          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)\n            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {\n              codePoint = tempCodePoint\n            }\n          }\n          break\n        case 4:\n          secondByte = buf[i + 1]\n          thirdByte = buf[i + 2]\n          fourthByte = buf[i + 3]\n          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {\n            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)\n            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {\n              codePoint = tempCodePoint\n            }\n          }\n      }\n    }\n\n    if (codePoint === null) {\n      // we did not generate a valid codePoint so insert a\n      // replacement char (U+FFFD) and advance only 1 byte\n      codePoint = 0xFFFD\n      bytesPerSequence = 1\n    } else if (codePoint > 0xFFFF) {\n      // encode to utf16 (surrogate pair dance)\n      codePoint -= 0x10000\n      res.push(codePoint >>> 10 & 0x3FF | 0xD800)\n      codePoint = 0xDC00 | codePoint & 0x3FF\n    }\n\n    res.push(codePoint)\n    i += bytesPerSequence\n  }\n\n  return decodeCodePointsArray(res)\n}\n\n// Based on http://stackoverflow.com/a/22747272/680742, the browser with\n// the lowest limit is Chrome, with 0x10000 args.\n// We go 1 magnitude less, for safety\nvar MAX_ARGUMENTS_LENGTH = 0x1000\n\nfunction decodeCodePointsArray (codePoints) {\n  var len = codePoints.length\n  if (len <= MAX_ARGUMENTS_LENGTH) {\n    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()\n  }\n\n  // Decode in chunks to avoid \"call stack size exceeded\".\n  var res = ''\n  var i = 0\n  while (i < len) {\n    res += String.fromCharCode.apply(\n      String,\n      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)\n    )\n  }\n  return res\n}\n\nfunction asciiSlice (buf, start, end) {\n  var ret = ''\n  end = Math.min(buf.length, end)\n\n  for (var i = start; i < end; ++i) {\n    ret += String.fromCharCode(buf[i] & 0x7F)\n  }\n  return ret\n}\n\nfunction latin1Slice (buf, start, end) {\n  var ret = ''\n  end = Math.min(buf.length, end)\n\n  for (var i = start; i < end; ++i) {\n    ret += String.fromCharCode(buf[i])\n  }\n  return ret\n}\n\nfunction hexSlice (buf, start, end) {\n  var len = buf.length\n\n  if (!start || start < 0) start = 0\n  if (!end || end < 0 || end > len) end = len\n\n  var out = ''\n  for (var i = start; i < end; ++i) {\n    out += toHex(buf[i])\n  }\n  return out\n}\n\nfunction utf16leSlice (buf, start, end) {\n  var bytes = buf.slice(start, end)\n  var res = ''\n  for (var i = 0; i < bytes.length; i += 2) {\n    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)\n  }\n  return res\n}\n\nBuffer.prototype.slice = function slice (start, end) {\n  var len = this.length\n  start = ~~start\n  end = end === undefined ? len : ~~end\n\n  if (start < 0) {\n    start += len\n    if (start < 0) start = 0\n  } else if (start > len) {\n    start = len\n  }\n\n  if (end < 0) {\n    end += len\n    if (end < 0) end = 0\n  } else if (end > len) {\n    end = len\n  }\n\n  if (end < start) end = start\n\n  var newBuf\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    newBuf = this.subarray(start, end)\n    newBuf.__proto__ = Buffer.prototype\n  } else {\n    var sliceLen = end - start\n    newBuf = new Buffer(sliceLen, undefined)\n    for (var i = 0; i < sliceLen; ++i) {\n      newBuf[i] = this[i + start]\n    }\n  }\n\n  return newBuf\n}\n\n/*\n * Need to make sure that buffer isn't trying to write out of bounds.\n */\nfunction checkOffset (offset, ext, length) {\n  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')\n  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')\n}\n\nBuffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {\n  offset = offset | 0\n  byteLength = byteLength | 0\n  if (!noAssert) checkOffset(offset, byteLength, this.length)\n\n  var val = this[offset]\n  var mul = 1\n  var i = 0\n  while (++i < byteLength && (mul *= 0x100)) {\n    val += this[offset + i] * mul\n  }\n\n  return val\n}\n\nBuffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {\n  offset = offset | 0\n  byteLength = byteLength | 0\n  if (!noAssert) {\n    checkOffset(offset, byteLength, this.length)\n  }\n\n  var val = this[offset + --byteLength]\n  var mul = 1\n  while (byteLength > 0 && (mul *= 0x100)) {\n    val += this[offset + --byteLength] * mul\n  }\n\n  return val\n}\n\nBuffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 1, this.length)\n  return this[offset]\n}\n\nBuffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 2, this.length)\n  return this[offset] | (this[offset + 1] << 8)\n}\n\nBuffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 2, this.length)\n  return (this[offset] << 8) | this[offset + 1]\n}\n\nBuffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length)\n\n  return ((this[offset]) |\n      (this[offset + 1] << 8) |\n      (this[offset + 2] << 16)) +\n      (this[offset + 3] * 0x1000000)\n}\n\nBuffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length)\n\n  return (this[offset] * 0x1000000) +\n    ((this[offset + 1] << 16) |\n    (this[offset + 2] << 8) |\n    this[offset + 3])\n}\n\nBuffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {\n  offset = offset | 0\n  byteLength = byteLength | 0\n  if (!noAssert) checkOffset(offset, byteLength, this.length)\n\n  var val = this[offset]\n  var mul = 1\n  var i = 0\n  while (++i < byteLength && (mul *= 0x100)) {\n    val += this[offset + i] * mul\n  }\n  mul *= 0x80\n\n  if (val >= mul) val -= Math.pow(2, 8 * byteLength)\n\n  return val\n}\n\nBuffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {\n  offset = offset | 0\n  byteLength = byteLength | 0\n  if (!noAssert) checkOffset(offset, byteLength, this.length)\n\n  var i = byteLength\n  var mul = 1\n  var val = this[offset + --i]\n  while (i > 0 && (mul *= 0x100)) {\n    val += this[offset + --i] * mul\n  }\n  mul *= 0x80\n\n  if (val >= mul) val -= Math.pow(2, 8 * byteLength)\n\n  return val\n}\n\nBuffer.prototype.readInt8 = function readInt8 (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 1, this.length)\n  if (!(this[offset] & 0x80)) return (this[offset])\n  return ((0xff - this[offset] + 1) * -1)\n}\n\nBuffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 2, this.length)\n  var val = this[offset] | (this[offset + 1] << 8)\n  return (val & 0x8000) ? val | 0xFFFF0000 : val\n}\n\nBuffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 2, this.length)\n  var val = this[offset + 1] | (this[offset] << 8)\n  return (val & 0x8000) ? val | 0xFFFF0000 : val\n}\n\nBuffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length)\n\n  return (this[offset]) |\n    (this[offset + 1] << 8) |\n    (this[offset + 2] << 16) |\n    (this[offset + 3] << 24)\n}\n\nBuffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length)\n\n  return (this[offset] << 24) |\n    (this[offset + 1] << 16) |\n    (this[offset + 2] << 8) |\n    (this[offset + 3])\n}\n\nBuffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length)\n  return ieee754.read(this, offset, true, 23, 4)\n}\n\nBuffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 4, this.length)\n  return ieee754.read(this, offset, false, 23, 4)\n}\n\nBuffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 8, this.length)\n  return ieee754.read(this, offset, true, 52, 8)\n}\n\nBuffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {\n  if (!noAssert) checkOffset(offset, 8, this.length)\n  return ieee754.read(this, offset, false, 52, 8)\n}\n\nfunction checkInt (buf, value, offset, ext, max, min) {\n  if (!Buffer.isBuffer(buf)) throw new TypeError('\"buffer\" argument must be a Buffer instance')\n  if (value > max || value < min) throw new RangeError('\"value\" argument is out of bounds')\n  if (offset + ext > buf.length) throw new RangeError('Index out of range')\n}\n\nBuffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {\n  value = +value\n  offset = offset | 0\n  byteLength = byteLength | 0\n  if (!noAssert) {\n    var maxBytes = Math.pow(2, 8 * byteLength) - 1\n    checkInt(this, value, offset, byteLength, maxBytes, 0)\n  }\n\n  var mul = 1\n  var i = 0\n  this[offset] = value & 0xFF\n  while (++i < byteLength && (mul *= 0x100)) {\n    this[offset + i] = (value / mul) & 0xFF\n  }\n\n  return offset + byteLength\n}\n\nBuffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {\n  value = +value\n  offset = offset | 0\n  byteLength = byteLength | 0\n  if (!noAssert) {\n    var maxBytes = Math.pow(2, 8 * byteLength) - 1\n    checkInt(this, value, offset, byteLength, maxBytes, 0)\n  }\n\n  var i = byteLength - 1\n  var mul = 1\n  this[offset + i] = value & 0xFF\n  while (--i >= 0 && (mul *= 0x100)) {\n    this[offset + i] = (value / mul) & 0xFF\n  }\n\n  return offset + byteLength\n}\n\nBuffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)\n  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)\n  this[offset] = (value & 0xff)\n  return offset + 1\n}\n\nfunction objectWriteUInt16 (buf, value, offset, littleEndian) {\n  if (value < 0) value = 0xffff + value + 1\n  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {\n    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>\n      (littleEndian ? i : 1 - i) * 8\n  }\n}\n\nBuffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value & 0xff)\n    this[offset + 1] = (value >>> 8)\n  } else {\n    objectWriteUInt16(this, value, offset, true)\n  }\n  return offset + 2\n}\n\nBuffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value >>> 8)\n    this[offset + 1] = (value & 0xff)\n  } else {\n    objectWriteUInt16(this, value, offset, false)\n  }\n  return offset + 2\n}\n\nfunction objectWriteUInt32 (buf, value, offset, littleEndian) {\n  if (value < 0) value = 0xffffffff + value + 1\n  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {\n    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff\n  }\n}\n\nBuffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset + 3] = (value >>> 24)\n    this[offset + 2] = (value >>> 16)\n    this[offset + 1] = (value >>> 8)\n    this[offset] = (value & 0xff)\n  } else {\n    objectWriteUInt32(this, value, offset, true)\n  }\n  return offset + 4\n}\n\nBuffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value >>> 24)\n    this[offset + 1] = (value >>> 16)\n    this[offset + 2] = (value >>> 8)\n    this[offset + 3] = (value & 0xff)\n  } else {\n    objectWriteUInt32(this, value, offset, false)\n  }\n  return offset + 4\n}\n\nBuffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) {\n    var limit = Math.pow(2, 8 * byteLength - 1)\n\n    checkInt(this, value, offset, byteLength, limit - 1, -limit)\n  }\n\n  var i = 0\n  var mul = 1\n  var sub = 0\n  this[offset] = value & 0xFF\n  while (++i < byteLength && (mul *= 0x100)) {\n    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {\n      sub = 1\n    }\n    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF\n  }\n\n  return offset + byteLength\n}\n\nBuffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) {\n    var limit = Math.pow(2, 8 * byteLength - 1)\n\n    checkInt(this, value, offset, byteLength, limit - 1, -limit)\n  }\n\n  var i = byteLength - 1\n  var mul = 1\n  var sub = 0\n  this[offset + i] = value & 0xFF\n  while (--i >= 0 && (mul *= 0x100)) {\n    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {\n      sub = 1\n    }\n    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF\n  }\n\n  return offset + byteLength\n}\n\nBuffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)\n  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)\n  if (value < 0) value = 0xff + value + 1\n  this[offset] = (value & 0xff)\n  return offset + 1\n}\n\nBuffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value & 0xff)\n    this[offset + 1] = (value >>> 8)\n  } else {\n    objectWriteUInt16(this, value, offset, true)\n  }\n  return offset + 2\n}\n\nBuffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value >>> 8)\n    this[offset + 1] = (value & 0xff)\n  } else {\n    objectWriteUInt16(this, value, offset, false)\n  }\n  return offset + 2\n}\n\nBuffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value & 0xff)\n    this[offset + 1] = (value >>> 8)\n    this[offset + 2] = (value >>> 16)\n    this[offset + 3] = (value >>> 24)\n  } else {\n    objectWriteUInt32(this, value, offset, true)\n  }\n  return offset + 4\n}\n\nBuffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {\n  value = +value\n  offset = offset | 0\n  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)\n  if (value < 0) value = 0xffffffff + value + 1\n  if (Buffer.TYPED_ARRAY_SUPPORT) {\n    this[offset] = (value >>> 24)\n    this[offset + 1] = (value >>> 16)\n    this[offset + 2] = (value >>> 8)\n    this[offset + 3] = (value & 0xff)\n  } else {\n    objectWriteUInt32(this, value, offset, false)\n  }\n  return offset + 4\n}\n\nfunction checkIEEE754 (buf, value, offset, ext, max, min) {\n  if (offset + ext > buf.length) throw new RangeError('Index out of range')\n  if (offset < 0) throw new RangeError('Index out of range')\n}\n\nfunction writeFloat (buf, value, offset, littleEndian, noAssert) {\n  if (!noAssert) {\n    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)\n  }\n  ieee754.write(buf, value, offset, littleEndian, 23, 4)\n  return offset + 4\n}\n\nBuffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {\n  return writeFloat(this, value, offset, true, noAssert)\n}\n\nBuffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {\n  return writeFloat(this, value, offset, false, noAssert)\n}\n\nfunction writeDouble (buf, value, offset, littleEndian, noAssert) {\n  if (!noAssert) {\n    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)\n  }\n  ieee754.write(buf, value, offset, littleEndian, 52, 8)\n  return offset + 8\n}\n\nBuffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {\n  return writeDouble(this, value, offset, true, noAssert)\n}\n\nBuffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {\n  return writeDouble(this, value, offset, false, noAssert)\n}\n\n// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)\nBuffer.prototype.copy = function copy (target, targetStart, start, end) {\n  if (!start) start = 0\n  if (!end && end !== 0) end = this.length\n  if (targetStart >= target.length) targetStart = target.length\n  if (!targetStart) targetStart = 0\n  if (end > 0 && end < start) end = start\n\n  // Copy 0 bytes; we're done\n  if (end === start) return 0\n  if (target.length === 0 || this.length === 0) return 0\n\n  // Fatal error conditions\n  if (targetStart < 0) {\n    throw new RangeError('targetStart out of bounds')\n  }\n  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')\n  if (end < 0) throw new RangeError('sourceEnd out of bounds')\n\n  // Are we oob?\n  if (end > this.length) end = this.length\n  if (target.length - targetStart < end - start) {\n    end = target.length - targetStart + start\n  }\n\n  var len = end - start\n  var i\n\n  if (this === target && start < targetStart && targetStart < end) {\n    // descending copy from end\n    for (i = len - 1; i >= 0; --i) {\n      target[i + targetStart] = this[i + start]\n    }\n  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {\n    // ascending copy from start\n    for (i = 0; i < len; ++i) {\n      target[i + targetStart] = this[i + start]\n    }\n  } else {\n    Uint8Array.prototype.set.call(\n      target,\n      this.subarray(start, start + len),\n      targetStart\n    )\n  }\n\n  return len\n}\n\n// Usage:\n//    buffer.fill(number[, offset[, end]])\n//    buffer.fill(buffer[, offset[, end]])\n//    buffer.fill(string[, offset[, end]][, encoding])\nBuffer.prototype.fill = function fill (val, start, end, encoding) {\n  // Handle string cases:\n  if (typeof val === 'string') {\n    if (typeof start === 'string') {\n      encoding = start\n      start = 0\n      end = this.length\n    } else if (typeof end === 'string') {\n      encoding = end\n      end = this.length\n    }\n    if (val.length === 1) {\n      var code = val.charCodeAt(0)\n      if (code < 256) {\n        val = code\n      }\n    }\n    if (encoding !== undefined && typeof encoding !== 'string') {\n      throw new TypeError('encoding must be a string')\n    }\n    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {\n      throw new TypeError('Unknown encoding: ' + encoding)\n    }\n  } else if (typeof val === 'number') {\n    val = val & 255\n  }\n\n  // Invalid ranges are not set to a default, so can range check early.\n  if (start < 0 || this.length < start || this.length < end) {\n    throw new RangeError('Out of range index')\n  }\n\n  if (end <= start) {\n    return this\n  }\n\n  start = start >>> 0\n  end = end === undefined ? this.length : end >>> 0\n\n  if (!val) val = 0\n\n  var i\n  if (typeof val === 'number') {\n    for (i = start; i < end; ++i) {\n      this[i] = val\n    }\n  } else {\n    var bytes = Buffer.isBuffer(val)\n      ? val\n      : utf8ToBytes(new Buffer(val, encoding).toString())\n    var len = bytes.length\n    for (i = 0; i < end - start; ++i) {\n      this[i + start] = bytes[i % len]\n    }\n  }\n\n  return this\n}\n\n// HELPER FUNCTIONS\n// ================\n\nvar INVALID_BASE64_RE = /[^+\\/0-9A-Za-z-_]/g\n\nfunction base64clean (str) {\n  // Node strips out invalid characters like \\n and \\t from the string, base64-js does not\n  str = stringtrim(str).replace(INVALID_BASE64_RE, '')\n  // Node converts strings with length < 2 to ''\n  if (str.length < 2) return ''\n  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not\n  while (str.length % 4 !== 0) {\n    str = str + '='\n  }\n  return str\n}\n\nfunction stringtrim (str) {\n  if (str.trim) return str.trim()\n  return str.replace(/^\\s+|\\s+$/g, '')\n}\n\nfunction toHex (n) {\n  if (n < 16) return '0' + n.toString(16)\n  return n.toString(16)\n}\n\nfunction utf8ToBytes (string, units) {\n  units = units || Infinity\n  var codePoint\n  var length = string.length\n  var leadSurrogate = null\n  var bytes = []\n\n  for (var i = 0; i < length; ++i) {\n    codePoint = string.charCodeAt(i)\n\n    // is surrogate component\n    if (codePoint > 0xD7FF && codePoint < 0xE000) {\n      // last char was a lead\n      if (!leadSurrogate) {\n        // no lead yet\n        if (codePoint > 0xDBFF) {\n          // unexpected trail\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          continue\n        } else if (i + 1 === length) {\n          // unpaired lead\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          continue\n        }\n\n        // valid lead\n        leadSurrogate = codePoint\n\n        continue\n      }\n\n      // 2 leads in a row\n      if (codePoint < 0xDC00) {\n        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n        leadSurrogate = codePoint\n        continue\n      }\n\n      // valid surrogate pair\n      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000\n    } else if (leadSurrogate) {\n      // valid bmp char, but last char was a lead\n      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n    }\n\n    leadSurrogate = null\n\n    // encode utf8\n    if (codePoint < 0x80) {\n      if ((units -= 1) < 0) break\n      bytes.push(codePoint)\n    } else if (codePoint < 0x800) {\n      if ((units -= 2) < 0) break\n      bytes.push(\n        codePoint >> 0x6 | 0xC0,\n        codePoint & 0x3F | 0x80\n      )\n    } else if (codePoint < 0x10000) {\n      if ((units -= 3) < 0) break\n      bytes.push(\n        codePoint >> 0xC | 0xE0,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      )\n    } else if (codePoint < 0x110000) {\n      if ((units -= 4) < 0) break\n      bytes.push(\n        codePoint >> 0x12 | 0xF0,\n        codePoint >> 0xC & 0x3F | 0x80,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      )\n    } else {\n      throw new Error('Invalid code point')\n    }\n  }\n\n  return bytes\n}\n\nfunction asciiToBytes (str) {\n  var byteArray = []\n  for (var i = 0; i < str.length; ++i) {\n    // Node's code seems to be doing this and not & 0x7F..\n    byteArray.push(str.charCodeAt(i) & 0xFF)\n  }\n  return byteArray\n}\n\nfunction utf16leToBytes (str, units) {\n  var c, hi, lo\n  var byteArray = []\n  for (var i = 0; i < str.length; ++i) {\n    if ((units -= 2) < 0) break\n\n    c = str.charCodeAt(i)\n    hi = c >> 8\n    lo = c % 256\n    byteArray.push(lo)\n    byteArray.push(hi)\n  }\n\n  return byteArray\n}\n\nfunction base64ToBytes (str) {\n  return base64.toByteArray(base64clean(str))\n}\n\nfunction blitBuffer (src, dst, offset, length) {\n  for (var i = 0; i < length; ++i) {\n    if ((i + offset >= dst.length) || (i >= src.length)) break\n    dst[i + offset] = src[i]\n  }\n  return i\n}\n\nfunction isnan (val) {\n  return val !== val // eslint-disable-line no-self-compare\n}\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack://PizZip/./node_modules/buffer/index.js?");

/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("exports.read = function (buffer, offset, isLE, mLen, nBytes) {\n  var e, m\n  var eLen = (nBytes * 8) - mLen - 1\n  var eMax = (1 << eLen) - 1\n  var eBias = eMax >> 1\n  var nBits = -7\n  var i = isLE ? (nBytes - 1) : 0\n  var d = isLE ? -1 : 1\n  var s = buffer[offset + i]\n\n  i += d\n\n  e = s & ((1 << (-nBits)) - 1)\n  s >>= (-nBits)\n  nBits += eLen\n  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}\n\n  m = e & ((1 << (-nBits)) - 1)\n  e >>= (-nBits)\n  nBits += mLen\n  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}\n\n  if (e === 0) {\n    e = 1 - eBias\n  } else if (e === eMax) {\n    return m ? NaN : ((s ? -1 : 1) * Infinity)\n  } else {\n    m = m + Math.pow(2, mLen)\n    e = e - eBias\n  }\n  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)\n}\n\nexports.write = function (buffer, value, offset, isLE, mLen, nBytes) {\n  var e, m, c\n  var eLen = (nBytes * 8) - mLen - 1\n  var eMax = (1 << eLen) - 1\n  var eBias = eMax >> 1\n  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)\n  var i = isLE ? 0 : (nBytes - 1)\n  var d = isLE ? 1 : -1\n  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0\n\n  value = Math.abs(value)\n\n  if (isNaN(value) || value === Infinity) {\n    m = isNaN(value) ? 1 : 0\n    e = eMax\n  } else {\n    e = Math.floor(Math.log(value) / Math.LN2)\n    if (value * (c = Math.pow(2, -e)) < 1) {\n      e--\n      c *= 2\n    }\n    if (e + eBias >= 1) {\n      value += rt / c\n    } else {\n      value += rt * Math.pow(2, 1 - eBias)\n    }\n    if (value * c >= 2) {\n      e++\n      c /= 2\n    }\n\n    if (e + eBias >= eMax) {\n      m = 0\n      e = eMax\n    } else if (e + eBias >= 1) {\n      m = ((value * c) - 1) * Math.pow(2, mLen)\n      e = e + eBias\n    } else {\n      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)\n      e = 0\n    }\n  }\n\n  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}\n\n  e = (e << mLen) | m\n  eLen += mLen\n  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}\n\n  buffer[offset + i - d] |= s * 128\n}\n\n\n//# sourceURL=webpack://PizZip/./node_modules/ieee754/index.js?");

/***/ }),

/***/ "./node_modules/isarray/index.js":
/*!***************************************!*\
  !*** ./node_modules/isarray/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var toString = {}.toString;\n\nmodule.exports = Array.isArray || function (arr) {\n  return toString.call(arr) == '[object Array]';\n};\n\n\n//# sourceURL=webpack://PizZip/./node_modules/isarray/index.js?");

/***/ }),

/***/ "./node_modules/pako/index.js":
/*!************************************!*\
  !*** ./node_modules/pako/index.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("// Top level file is just a mixin of submodules & constants\n\n\nvar assign    = __webpack_require__(/*! ./lib/utils/common */ \"./node_modules/pako/lib/utils/common.js\").assign;\n\nvar deflate   = __webpack_require__(/*! ./lib/deflate */ \"./node_modules/pako/lib/deflate.js\");\nvar inflate   = __webpack_require__(/*! ./lib/inflate */ \"./node_modules/pako/lib/inflate.js\");\nvar constants = __webpack_require__(/*! ./lib/zlib/constants */ \"./node_modules/pako/lib/zlib/constants.js\");\n\nvar pako = {};\n\nassign(pako, deflate, inflate, constants);\n\nmodule.exports = pako;\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/index.js?");

/***/ }),

/***/ "./node_modules/pako/lib/deflate.js":
/*!******************************************!*\
  !*** ./node_modules/pako/lib/deflate.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n\nvar zlib_deflate = __webpack_require__(/*! ./zlib/deflate */ \"./node_modules/pako/lib/zlib/deflate.js\");\nvar utils        = __webpack_require__(/*! ./utils/common */ \"./node_modules/pako/lib/utils/common.js\");\nvar strings      = __webpack_require__(/*! ./utils/strings */ \"./node_modules/pako/lib/utils/strings.js\");\nvar msg          = __webpack_require__(/*! ./zlib/messages */ \"./node_modules/pako/lib/zlib/messages.js\");\nvar ZStream      = __webpack_require__(/*! ./zlib/zstream */ \"./node_modules/pako/lib/zlib/zstream.js\");\n\nvar toString = Object.prototype.toString;\n\n/* Public constants ==========================================================*/\n/* ===========================================================================*/\n\nvar Z_NO_FLUSH      = 0;\nvar Z_FINISH        = 4;\n\nvar Z_OK            = 0;\nvar Z_STREAM_END    = 1;\nvar Z_SYNC_FLUSH    = 2;\n\nvar Z_DEFAULT_COMPRESSION = -1;\n\nvar Z_DEFAULT_STRATEGY    = 0;\n\nvar Z_DEFLATED  = 8;\n\n/* ===========================================================================*/\n\n\n/**\n * class Deflate\n *\n * Generic JS-style wrapper for zlib calls. If you don't need\n * streaming behaviour - use more simple functions: [[deflate]],\n * [[deflateRaw]] and [[gzip]].\n **/\n\n/* internal\n * Deflate.chunks -> Array\n *\n * Chunks of output data, if [[Deflate#onData]] not overridden.\n **/\n\n/**\n * Deflate.result -> Uint8Array|Array\n *\n * Compressed result, generated by default [[Deflate#onData]]\n * and [[Deflate#onEnd]] handlers. Filled after you push last chunk\n * (call [[Deflate#push]] with `Z_FINISH` / `true` param)  or if you\n * push a chunk with explicit flush (call [[Deflate#push]] with\n * `Z_SYNC_FLUSH` param).\n **/\n\n/**\n * Deflate.err -> Number\n *\n * Error code after deflate finished. 0 (Z_OK) on success.\n * You will not need it in real life, because deflate errors\n * are possible only on wrong options or bad `onData` / `onEnd`\n * custom handlers.\n **/\n\n/**\n * Deflate.msg -> String\n *\n * Error message, if [[Deflate.err]] != 0\n **/\n\n\n/**\n * new Deflate(options)\n * - options (Object): zlib deflate options.\n *\n * Creates new deflator instance with specified params. Throws exception\n * on bad params. Supported options:\n *\n * - `level`\n * - `windowBits`\n * - `memLevel`\n * - `strategy`\n * - `dictionary`\n *\n * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)\n * for more information on these.\n *\n * Additional options, for internal needs:\n *\n * - `chunkSize` - size of generated data chunks (16K by default)\n * - `raw` (Boolean) - do raw deflate\n * - `gzip` (Boolean) - create gzip wrapper\n * - `to` (String) - if equal to 'string', then result will be \"binary string\"\n *    (each char code [0..255])\n * - `header` (Object) - custom header for gzip\n *   - `text` (Boolean) - true if compressed data believed to be text\n *   - `time` (Number) - modification time, unix timestamp\n *   - `os` (Number) - operation system code\n *   - `extra` (Array) - array of bytes with extra data (max 65536)\n *   - `name` (String) - file name (binary string)\n *   - `comment` (String) - comment (binary string)\n *   - `hcrc` (Boolean) - true if header crc should be added\n *\n * ##### Example:\n *\n * ```javascript\n * var pako = require('pako')\n *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])\n *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);\n *\n * var deflate = new pako.Deflate({ level: 3});\n *\n * deflate.push(chunk1, false);\n * deflate.push(chunk2, true);  // true -> last chunk\n *\n * if (deflate.err) { throw new Error(deflate.err); }\n *\n * console.log(deflate.result);\n * ```\n **/\nfunction Deflate(options) {\n  if (!(this instanceof Deflate)) return new Deflate(options);\n\n  this.options = utils.assign({\n    level: Z_DEFAULT_COMPRESSION,\n    method: Z_DEFLATED,\n    chunkSize: 16384,\n    windowBits: 15,\n    memLevel: 8,\n    strategy: Z_DEFAULT_STRATEGY,\n    to: ''\n  }, options || {});\n\n  var opt = this.options;\n\n  if (opt.raw && (opt.windowBits > 0)) {\n    opt.windowBits = -opt.windowBits;\n  }\n\n  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {\n    opt.windowBits += 16;\n  }\n\n  this.err    = 0;      // error code, if happens (0 = Z_OK)\n  this.msg    = '';     // error message\n  this.ended  = false;  // used to avoid multiple onEnd() calls\n  this.chunks = [];     // chunks of compressed data\n\n  this.strm = new ZStream();\n  this.strm.avail_out = 0;\n\n  var status = zlib_deflate.deflateInit2(\n    this.strm,\n    opt.level,\n    opt.method,\n    opt.windowBits,\n    opt.memLevel,\n    opt.strategy\n  );\n\n  if (status !== Z_OK) {\n    throw new Error(msg[status]);\n  }\n\n  if (opt.header) {\n    zlib_deflate.deflateSetHeader(this.strm, opt.header);\n  }\n\n  if (opt.dictionary) {\n    var dict;\n    // Convert data if needed\n    if (typeof opt.dictionary === 'string') {\n      // If we need to compress text, change encoding to utf8.\n      dict = strings.string2buf(opt.dictionary);\n    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {\n      dict = new Uint8Array(opt.dictionary);\n    } else {\n      dict = opt.dictionary;\n    }\n\n    status = zlib_deflate.deflateSetDictionary(this.strm, dict);\n\n    if (status !== Z_OK) {\n      throw new Error(msg[status]);\n    }\n\n    this._dict_set = true;\n  }\n}\n\n/**\n * Deflate#push(data[, mode]) -> Boolean\n * - data (Uint8Array|Array|ArrayBuffer|String): input data. Strings will be\n *   converted to utf8 byte sequence.\n * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.\n *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.\n *\n * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with\n * new compressed chunks. Returns `true` on success. The last data block must have\n * mode Z_FINISH (or `true`). That will flush internal pending buffers and call\n * [[Deflate#onEnd]]. For interim explicit flushes (without ending the stream) you\n * can use mode Z_SYNC_FLUSH, keeping the compression context.\n *\n * On fail call [[Deflate#onEnd]] with error code and return false.\n *\n * We strongly recommend to use `Uint8Array` on input for best speed (output\n * array format is detected automatically). Also, don't skip last param and always\n * use the same type in your code (boolean or number). That will improve JS speed.\n *\n * For regular `Array`-s make sure all elements are [0..255].\n *\n * ##### Example\n *\n * ```javascript\n * push(chunk, false); // push one of data chunks\n * ...\n * push(chunk, true);  // push last chunk\n * ```\n **/\nDeflate.prototype.push = function (data, mode) {\n  var strm = this.strm;\n  var chunkSize = this.options.chunkSize;\n  var status, _mode;\n\n  if (this.ended) { return false; }\n\n  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);\n\n  // Convert data if needed\n  if (typeof data === 'string') {\n    // If we need to compress text, change encoding to utf8.\n    strm.input = strings.string2buf(data);\n  } else if (toString.call(data) === '[object ArrayBuffer]') {\n    strm.input = new Uint8Array(data);\n  } else {\n    strm.input = data;\n  }\n\n  strm.next_in = 0;\n  strm.avail_in = strm.input.length;\n\n  do {\n    if (strm.avail_out === 0) {\n      strm.output = new utils.Buf8(chunkSize);\n      strm.next_out = 0;\n      strm.avail_out = chunkSize;\n    }\n    status = zlib_deflate.deflate(strm, _mode);    /* no bad return value */\n\n    if (status !== Z_STREAM_END && status !== Z_OK) {\n      this.onEnd(status);\n      this.ended = true;\n      return false;\n    }\n    if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))) {\n      if (this.options.to === 'string') {\n        this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));\n      } else {\n        this.onData(utils.shrinkBuf(strm.output, strm.next_out));\n      }\n    }\n  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);\n\n  // Finalize on the last chunk.\n  if (_mode === Z_FINISH) {\n    status = zlib_deflate.deflateEnd(this.strm);\n    this.onEnd(status);\n    this.ended = true;\n    return status === Z_OK;\n  }\n\n  // callback interim results if Z_SYNC_FLUSH.\n  if (_mode === Z_SYNC_FLUSH) {\n    this.onEnd(Z_OK);\n    strm.avail_out = 0;\n    return true;\n  }\n\n  return true;\n};\n\n\n/**\n * Deflate#onData(chunk) -> Void\n * - chunk (Uint8Array|Array|String): output data. Type of array depends\n *   on js engine support. When string output requested, each chunk\n *   will be string.\n *\n * By default, stores data blocks in `chunks[]` property and glue\n * those in `onEnd`. Override this handler, if you need another behaviour.\n **/\nDeflate.prototype.onData = function (chunk) {\n  this.chunks.push(chunk);\n};\n\n\n/**\n * Deflate#onEnd(status) -> Void\n * - status (Number): deflate status. 0 (Z_OK) on success,\n *   other if not.\n *\n * Called once after you tell deflate that the input stream is\n * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)\n * or if an error happened. By default - join collected chunks,\n * free memory and fill `results` / `err` properties.\n **/\nDeflate.prototype.onEnd = function (status) {\n  // On success - join\n  if (status === Z_OK) {\n    if (this.options.to === 'string') {\n      this.result = this.chunks.join('');\n    } else {\n      this.result = utils.flattenChunks(this.chunks);\n    }\n  }\n  this.chunks = [];\n  this.err = status;\n  this.msg = this.strm.msg;\n};\n\n\n/**\n * deflate(data[, options]) -> Uint8Array|Array|String\n * - data (Uint8Array|Array|String): input data to compress.\n * - options (Object): zlib deflate options.\n *\n * Compress `data` with deflate algorithm and `options`.\n *\n * Supported options are:\n *\n * - level\n * - windowBits\n * - memLevel\n * - strategy\n * - dictionary\n *\n * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)\n * for more information on these.\n *\n * Sugar (options):\n *\n * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify\n *   negative windowBits implicitly.\n * - `to` (String) - if equal to 'string', then result will be \"binary string\"\n *    (each char code [0..255])\n *\n * ##### Example:\n *\n * ```javascript\n * var pako = require('pako')\n *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);\n *\n * console.log(pako.deflate(data));\n * ```\n **/\nfunction deflate(input, options) {\n  var deflator = new Deflate(options);\n\n  deflator.push(input, true);\n\n  // That will never happens, if you don't cheat with options :)\n  if (deflator.err) { throw deflator.msg || msg[deflator.err]; }\n\n  return deflator.result;\n}\n\n\n/**\n * deflateRaw(data[, options]) -> Uint8Array|Array|String\n * - data (Uint8Array|Array|String): input data to compress.\n * - options (Object): zlib deflate options.\n *\n * The same as [[deflate]], but creates raw data, without wrapper\n * (header and adler32 crc).\n **/\nfunction deflateRaw(input, options) {\n  options = options || {};\n  options.raw = true;\n  return deflate(input, options);\n}\n\n\n/**\n * gzip(data[, options]) -> Uint8Array|Array|String\n * - data (Uint8Array|Array|String): input data to compress.\n * - options (Object): zlib deflate options.\n *\n * The same as [[deflate]], but create gzip wrapper instead of\n * deflate one.\n **/\nfunction gzip(input, options) {\n  options = options || {};\n  options.gzip = true;\n  return deflate(input, options);\n}\n\n\nexports.Deflate = Deflate;\nexports.deflate = deflate;\nexports.deflateRaw = deflateRaw;\nexports.gzip = gzip;\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/deflate.js?");

/***/ }),

/***/ "./node_modules/pako/lib/inflate.js":
/*!******************************************!*\
  !*** ./node_modules/pako/lib/inflate.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n\nvar zlib_inflate = __webpack_require__(/*! ./zlib/inflate */ \"./node_modules/pako/lib/zlib/inflate.js\");\nvar utils        = __webpack_require__(/*! ./utils/common */ \"./node_modules/pako/lib/utils/common.js\");\nvar strings      = __webpack_require__(/*! ./utils/strings */ \"./node_modules/pako/lib/utils/strings.js\");\nvar c            = __webpack_require__(/*! ./zlib/constants */ \"./node_modules/pako/lib/zlib/constants.js\");\nvar msg          = __webpack_require__(/*! ./zlib/messages */ \"./node_modules/pako/lib/zlib/messages.js\");\nvar ZStream      = __webpack_require__(/*! ./zlib/zstream */ \"./node_modules/pako/lib/zlib/zstream.js\");\nvar GZheader     = __webpack_require__(/*! ./zlib/gzheader */ \"./node_modules/pako/lib/zlib/gzheader.js\");\n\nvar toString = Object.prototype.toString;\n\n/**\n * class Inflate\n *\n * Generic JS-style wrapper for zlib calls. If you don't need\n * streaming behaviour - use more simple functions: [[inflate]]\n * and [[inflateRaw]].\n **/\n\n/* internal\n * inflate.chunks -> Array\n *\n * Chunks of output data, if [[Inflate#onData]] not overridden.\n **/\n\n/**\n * Inflate.result -> Uint8Array|Array|String\n *\n * Uncompressed result, generated by default [[Inflate#onData]]\n * and [[Inflate#onEnd]] handlers. Filled after you push last chunk\n * (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you\n * push a chunk with explicit flush (call [[Inflate#push]] with\n * `Z_SYNC_FLUSH` param).\n **/\n\n/**\n * Inflate.err -> Number\n *\n * Error code after inflate finished. 0 (Z_OK) on success.\n * Should be checked if broken data possible.\n **/\n\n/**\n * Inflate.msg -> String\n *\n * Error message, if [[Inflate.err]] != 0\n **/\n\n\n/**\n * new Inflate(options)\n * - options (Object): zlib inflate options.\n *\n * Creates new inflator instance with specified params. Throws exception\n * on bad params. Supported options:\n *\n * - `windowBits`\n * - `dictionary`\n *\n * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)\n * for more information on these.\n *\n * Additional options, for internal needs:\n *\n * - `chunkSize` - size of generated data chunks (16K by default)\n * - `raw` (Boolean) - do raw inflate\n * - `to` (String) - if equal to 'string', then result will be converted\n *   from utf8 to utf16 (javascript) string. When string output requested,\n *   chunk length can differ from `chunkSize`, depending on content.\n *\n * By default, when no options set, autodetect deflate/gzip data format via\n * wrapper header.\n *\n * ##### Example:\n *\n * ```javascript\n * var pako = require('pako')\n *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])\n *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);\n *\n * var inflate = new pako.Inflate({ level: 3});\n *\n * inflate.push(chunk1, false);\n * inflate.push(chunk2, true);  // true -> last chunk\n *\n * if (inflate.err) { throw new Error(inflate.err); }\n *\n * console.log(inflate.result);\n * ```\n **/\nfunction Inflate(options) {\n  if (!(this instanceof Inflate)) return new Inflate(options);\n\n  this.options = utils.assign({\n    chunkSize: 16384,\n    windowBits: 0,\n    to: ''\n  }, options || {});\n\n  var opt = this.options;\n\n  // Force window size for `raw` data, if not set directly,\n  // because we have no header for autodetect.\n  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {\n    opt.windowBits = -opt.windowBits;\n    if (opt.windowBits === 0) { opt.windowBits = -15; }\n  }\n\n  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate\n  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&\n      !(options && options.windowBits)) {\n    opt.windowBits += 32;\n  }\n\n  // Gzip header has no info about windows size, we can do autodetect only\n  // for deflate. So, if window size not set, force it to max when gzip possible\n  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {\n    // bit 3 (16) -> gzipped data\n    // bit 4 (32) -> autodetect gzip/deflate\n    if ((opt.windowBits & 15) === 0) {\n      opt.windowBits |= 15;\n    }\n  }\n\n  this.err    = 0;      // error code, if happens (0 = Z_OK)\n  this.msg    = '';     // error message\n  this.ended  = false;  // used to avoid multiple onEnd() calls\n  this.chunks = [];     // chunks of compressed data\n\n  this.strm   = new ZStream();\n  this.strm.avail_out = 0;\n\n  var status  = zlib_inflate.inflateInit2(\n    this.strm,\n    opt.windowBits\n  );\n\n  if (status !== c.Z_OK) {\n    throw new Error(msg[status]);\n  }\n\n  this.header = new GZheader();\n\n  zlib_inflate.inflateGetHeader(this.strm, this.header);\n\n  // Setup dictionary\n  if (opt.dictionary) {\n    // Convert data if needed\n    if (typeof opt.dictionary === 'string') {\n      opt.dictionary = strings.string2buf(opt.dictionary);\n    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {\n      opt.dictionary = new Uint8Array(opt.dictionary);\n    }\n    if (opt.raw) { //In raw mode we need to set the dictionary early\n      status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);\n      if (status !== c.Z_OK) {\n        throw new Error(msg[status]);\n      }\n    }\n  }\n}\n\n/**\n * Inflate#push(data[, mode]) -> Boolean\n * - data (Uint8Array|Array|ArrayBuffer|String): input data\n * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.\n *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.\n *\n * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with\n * new output chunks. Returns `true` on success. The last data block must have\n * mode Z_FINISH (or `true`). That will flush internal pending buffers and call\n * [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you\n * can use mode Z_SYNC_FLUSH, keeping the decompression context.\n *\n * On fail call [[Inflate#onEnd]] with error code and return false.\n *\n * We strongly recommend to use `Uint8Array` on input for best speed (output\n * format is detected automatically). Also, don't skip last param and always\n * use the same type in your code (boolean or number). That will improve JS speed.\n *\n * For regular `Array`-s make sure all elements are [0..255].\n *\n * ##### Example\n *\n * ```javascript\n * push(chunk, false); // push one of data chunks\n * ...\n * push(chunk, true);  // push last chunk\n * ```\n **/\nInflate.prototype.push = function (data, mode) {\n  var strm = this.strm;\n  var chunkSize = this.options.chunkSize;\n  var dictionary = this.options.dictionary;\n  var status, _mode;\n  var next_out_utf8, tail, utf8str;\n\n  // Flag to properly process Z_BUF_ERROR on testing inflate call\n  // when we check that all output data was flushed.\n  var allowBufError = false;\n\n  if (this.ended) { return false; }\n  _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);\n\n  // Convert data if needed\n  if (typeof data === 'string') {\n    // Only binary strings can be decompressed on practice\n    strm.input = strings.binstring2buf(data);\n  } else if (toString.call(data) === '[object ArrayBuffer]') {\n    strm.input = new Uint8Array(data);\n  } else {\n    strm.input = data;\n  }\n\n  strm.next_in = 0;\n  strm.avail_in = strm.input.length;\n\n  do {\n    if (strm.avail_out === 0) {\n      strm.output = new utils.Buf8(chunkSize);\n      strm.next_out = 0;\n      strm.avail_out = chunkSize;\n    }\n\n    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);    /* no bad return value */\n\n    if (status === c.Z_NEED_DICT && dictionary) {\n      status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);\n    }\n\n    if (status === c.Z_BUF_ERROR && allowBufError === true) {\n      status = c.Z_OK;\n      allowBufError = false;\n    }\n\n    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {\n      this.onEnd(status);\n      this.ended = true;\n      return false;\n    }\n\n    if (strm.next_out) {\n      if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH))) {\n\n        if (this.options.to === 'string') {\n\n          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);\n\n          tail = strm.next_out - next_out_utf8;\n          utf8str = strings.buf2string(strm.output, next_out_utf8);\n\n          // move tail\n          strm.next_out = tail;\n          strm.avail_out = chunkSize - tail;\n          if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }\n\n          this.onData(utf8str);\n\n        } else {\n          this.onData(utils.shrinkBuf(strm.output, strm.next_out));\n        }\n      }\n    }\n\n    // When no more input data, we should check that internal inflate buffers\n    // are flushed. The only way to do it when avail_out = 0 - run one more\n    // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.\n    // Here we set flag to process this error properly.\n    //\n    // NOTE. Deflate does not return error in this case and does not needs such\n    // logic.\n    if (strm.avail_in === 0 && strm.avail_out === 0) {\n      allowBufError = true;\n    }\n\n  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);\n\n  if (status === c.Z_STREAM_END) {\n    _mode = c.Z_FINISH;\n  }\n\n  // Finalize on the last chunk.\n  if (_mode === c.Z_FINISH) {\n    status = zlib_inflate.inflateEnd(this.strm);\n    this.onEnd(status);\n    this.ended = true;\n    return status === c.Z_OK;\n  }\n\n  // callback interim results if Z_SYNC_FLUSH.\n  if (_mode === c.Z_SYNC_FLUSH) {\n    this.onEnd(c.Z_OK);\n    strm.avail_out = 0;\n    return true;\n  }\n\n  return true;\n};\n\n\n/**\n * Inflate#onData(chunk) -> Void\n * - chunk (Uint8Array|Array|String): output data. Type of array depends\n *   on js engine support. When string output requested, each chunk\n *   will be string.\n *\n * By default, stores data blocks in `chunks[]` property and glue\n * those in `onEnd`. Override this handler, if you need another behaviour.\n **/\nInflate.prototype.onData = function (chunk) {\n  this.chunks.push(chunk);\n};\n\n\n/**\n * Inflate#onEnd(status) -> Void\n * - status (Number): inflate status. 0 (Z_OK) on success,\n *   other if not.\n *\n * Called either after you tell inflate that the input stream is\n * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)\n * or if an error happened. By default - join collected chunks,\n * free memory and fill `results` / `err` properties.\n **/\nInflate.prototype.onEnd = function (status) {\n  // On success - join\n  if (status === c.Z_OK) {\n    if (this.options.to === 'string') {\n      // Glue & convert here, until we teach pako to send\n      // utf8 aligned strings to onData\n      this.result = this.chunks.join('');\n    } else {\n      this.result = utils.flattenChunks(this.chunks);\n    }\n  }\n  this.chunks = [];\n  this.err = status;\n  this.msg = this.strm.msg;\n};\n\n\n/**\n * inflate(data[, options]) -> Uint8Array|Array|String\n * - data (Uint8Array|Array|String): input data to decompress.\n * - options (Object): zlib inflate options.\n *\n * Decompress `data` with inflate/ungzip and `options`. Autodetect\n * format via wrapper header by default. That's why we don't provide\n * separate `ungzip` method.\n *\n * Supported options are:\n *\n * - windowBits\n *\n * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)\n * for more information.\n *\n * Sugar (options):\n *\n * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify\n *   negative windowBits implicitly.\n * - `to` (String) - if equal to 'string', then result will be converted\n *   from utf8 to utf16 (javascript) string. When string output requested,\n *   chunk length can differ from `chunkSize`, depending on content.\n *\n *\n * ##### Example:\n *\n * ```javascript\n * var pako = require('pako')\n *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])\n *   , output;\n *\n * try {\n *   output = pako.inflate(input);\n * } catch (err)\n *   console.log(err);\n * }\n * ```\n **/\nfunction inflate(input, options) {\n  var inflator = new Inflate(options);\n\n  inflator.push(input, true);\n\n  // That will never happens, if you don't cheat with options :)\n  if (inflator.err) { throw inflator.msg || msg[inflator.err]; }\n\n  return inflator.result;\n}\n\n\n/**\n * inflateRaw(data[, options]) -> Uint8Array|Array|String\n * - data (Uint8Array|Array|String): input data to decompress.\n * - options (Object): zlib inflate options.\n *\n * The same as [[inflate]], but creates raw data, without wrapper\n * (header and adler32 crc).\n **/\nfunction inflateRaw(input, options) {\n  options = options || {};\n  options.raw = true;\n  return inflate(input, options);\n}\n\n\n/**\n * ungzip(data[, options]) -> Uint8Array|Array|String\n * - data (Uint8Array|Array|String): input data to decompress.\n * - options (Object): zlib inflate options.\n *\n * Just shortcut to [[inflate]], because it autodetects format\n * by header.content. Done for convenience.\n **/\n\n\nexports.Inflate = Inflate;\nexports.inflate = inflate;\nexports.inflateRaw = inflateRaw;\nexports.ungzip  = inflate;\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/inflate.js?");

/***/ }),

/***/ "./node_modules/pako/lib/utils/common.js":
/*!***********************************************!*\
  !*** ./node_modules/pako/lib/utils/common.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n\nvar TYPED_OK =  (typeof Uint8Array !== 'undefined') &&\n                (typeof Uint16Array !== 'undefined') &&\n                (typeof Int32Array !== 'undefined');\n\nfunction _has(obj, key) {\n  return Object.prototype.hasOwnProperty.call(obj, key);\n}\n\nexports.assign = function (obj /*from1, from2, from3, ...*/) {\n  var sources = Array.prototype.slice.call(arguments, 1);\n  while (sources.length) {\n    var source = sources.shift();\n    if (!source) { continue; }\n\n    if (typeof source !== 'object') {\n      throw new TypeError(source + 'must be non-object');\n    }\n\n    for (var p in source) {\n      if (_has(source, p)) {\n        obj[p] = source[p];\n      }\n    }\n  }\n\n  return obj;\n};\n\n\n// reduce buffer size, avoiding mem copy\nexports.shrinkBuf = function (buf, size) {\n  if (buf.length === size) { return buf; }\n  if (buf.subarray) { return buf.subarray(0, size); }\n  buf.length = size;\n  return buf;\n};\n\n\nvar fnTyped = {\n  arraySet: function (dest, src, src_offs, len, dest_offs) {\n    if (src.subarray && dest.subarray) {\n      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);\n      return;\n    }\n    // Fallback to ordinary array\n    for (var i = 0; i < len; i++) {\n      dest[dest_offs + i] = src[src_offs + i];\n    }\n  },\n  // Join array of chunks to single array.\n  flattenChunks: function (chunks) {\n    var i, l, len, pos, chunk, result;\n\n    // calculate data length\n    len = 0;\n    for (i = 0, l = chunks.length; i < l; i++) {\n      len += chunks[i].length;\n    }\n\n    // join chunks\n    result = new Uint8Array(len);\n    pos = 0;\n    for (i = 0, l = chunks.length; i < l; i++) {\n      chunk = chunks[i];\n      result.set(chunk, pos);\n      pos += chunk.length;\n    }\n\n    return result;\n  }\n};\n\nvar fnUntyped = {\n  arraySet: function (dest, src, src_offs, len, dest_offs) {\n    for (var i = 0; i < len; i++) {\n      dest[dest_offs + i] = src[src_offs + i];\n    }\n  },\n  // Join array of chunks to single array.\n  flattenChunks: function (chunks) {\n    return [].concat.apply([], chunks);\n  }\n};\n\n\n// Enable/Disable typed arrays use, for testing\n//\nexports.setTyped = function (on) {\n  if (on) {\n    exports.Buf8  = Uint8Array;\n    exports.Buf16 = Uint16Array;\n    exports.Buf32 = Int32Array;\n    exports.assign(exports, fnTyped);\n  } else {\n    exports.Buf8  = Array;\n    exports.Buf16 = Array;\n    exports.Buf32 = Array;\n    exports.assign(exports, fnUntyped);\n  }\n};\n\nexports.setTyped(TYPED_OK);\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/utils/common.js?");

/***/ }),

/***/ "./node_modules/pako/lib/utils/strings.js":
/*!************************************************!*\
  !*** ./node_modules/pako/lib/utils/strings.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("// String encode/decode helpers\n\n\n\nvar utils = __webpack_require__(/*! ./common */ \"./node_modules/pako/lib/utils/common.js\");\n\n\n// Quick check if we can use fast array to bin string conversion\n//\n// - apply(Array) can fail on Android 2.2\n// - apply(Uint8Array) can fail on iOS 5.1 Safari\n//\nvar STR_APPLY_OK = true;\nvar STR_APPLY_UIA_OK = true;\n\ntry { String.fromCharCode.apply(null, [ 0 ]); } catch (__) { STR_APPLY_OK = false; }\ntry { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }\n\n\n// Table with utf8 lengths (calculated by first byte of sequence)\n// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,\n// because max possible codepoint is 0x10ffff\nvar _utf8len = new utils.Buf8(256);\nfor (var q = 0; q < 256; q++) {\n  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);\n}\n_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start\n\n\n// convert string to array (typed, when possible)\nexports.string2buf = function (str) {\n  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;\n\n  // count binary size\n  for (m_pos = 0; m_pos < str_len; m_pos++) {\n    c = str.charCodeAt(m_pos);\n    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {\n      c2 = str.charCodeAt(m_pos + 1);\n      if ((c2 & 0xfc00) === 0xdc00) {\n        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);\n        m_pos++;\n      }\n    }\n    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;\n  }\n\n  // allocate buffer\n  buf = new utils.Buf8(buf_len);\n\n  // convert\n  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {\n    c = str.charCodeAt(m_pos);\n    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {\n      c2 = str.charCodeAt(m_pos + 1);\n      if ((c2 & 0xfc00) === 0xdc00) {\n        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);\n        m_pos++;\n      }\n    }\n    if (c < 0x80) {\n      /* one byte */\n      buf[i++] = c;\n    } else if (c < 0x800) {\n      /* two bytes */\n      buf[i++] = 0xC0 | (c >>> 6);\n      buf[i++] = 0x80 | (c & 0x3f);\n    } else if (c < 0x10000) {\n      /* three bytes */\n      buf[i++] = 0xE0 | (c >>> 12);\n      buf[i++] = 0x80 | (c >>> 6 & 0x3f);\n      buf[i++] = 0x80 | (c & 0x3f);\n    } else {\n      /* four bytes */\n      buf[i++] = 0xf0 | (c >>> 18);\n      buf[i++] = 0x80 | (c >>> 12 & 0x3f);\n      buf[i++] = 0x80 | (c >>> 6 & 0x3f);\n      buf[i++] = 0x80 | (c & 0x3f);\n    }\n  }\n\n  return buf;\n};\n\n// Helper (used in 2 places)\nfunction buf2binstring(buf, len) {\n  // On Chrome, the arguments in a function call that are allowed is `65534`.\n  // If the length of the buffer is smaller than that, we can use this optimization,\n  // otherwise we will take a slower path.\n  if (len < 65534) {\n    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {\n      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));\n    }\n  }\n\n  var result = '';\n  for (var i = 0; i < len; i++) {\n    result += String.fromCharCode(buf[i]);\n  }\n  return result;\n}\n\n\n// Convert byte array to binary string\nexports.buf2binstring = function (buf) {\n  return buf2binstring(buf, buf.length);\n};\n\n\n// Convert binary string (typed, when possible)\nexports.binstring2buf = function (str) {\n  var buf = new utils.Buf8(str.length);\n  for (var i = 0, len = buf.length; i < len; i++) {\n    buf[i] = str.charCodeAt(i);\n  }\n  return buf;\n};\n\n\n// convert array to string\nexports.buf2string = function (buf, max) {\n  var i, out, c, c_len;\n  var len = max || buf.length;\n\n  // Reserve max possible length (2 words per char)\n  // NB: by unknown reasons, Array is significantly faster for\n  //     String.fromCharCode.apply than Uint16Array.\n  var utf16buf = new Array(len * 2);\n\n  for (out = 0, i = 0; i < len;) {\n    c = buf[i++];\n    // quick process ascii\n    if (c < 0x80) { utf16buf[out++] = c; continue; }\n\n    c_len = _utf8len[c];\n    // skip 5 & 6 byte codes\n    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }\n\n    // apply mask on first byte\n    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;\n    // join the rest\n    while (c_len > 1 && i < len) {\n      c = (c << 6) | (buf[i++] & 0x3f);\n      c_len--;\n    }\n\n    // terminated by end of string?\n    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }\n\n    if (c < 0x10000) {\n      utf16buf[out++] = c;\n    } else {\n      c -= 0x10000;\n      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);\n      utf16buf[out++] = 0xdc00 | (c & 0x3ff);\n    }\n  }\n\n  return buf2binstring(utf16buf, out);\n};\n\n\n// Calculate max possible position in utf8 buffer,\n// that will not break sequence. If that's not possible\n// - (very small limits) return max size as is.\n//\n// buf[] - utf8 bytes array\n// max   - length limit (mandatory);\nexports.utf8border = function (buf, max) {\n  var pos;\n\n  max = max || buf.length;\n  if (max > buf.length) { max = buf.length; }\n\n  // go back from last position, until start of sequence found\n  pos = max - 1;\n  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }\n\n  // Very small and broken sequence,\n  // return max, because we should return something anyway.\n  if (pos < 0) { return max; }\n\n  // If we came to start of buffer - that means buffer is too small,\n  // return max too.\n  if (pos === 0) { return max; }\n\n  return (pos + _utf8len[buf[pos]] > max) ? pos : max;\n};\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/utils/strings.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/adler32.js":
/*!***********************************************!*\
  !*** ./node_modules/pako/lib/zlib/adler32.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// Note: adler32 takes 12% for level 0 and 2% for level 6.\n// It isn't worth it to make additional optimizations as in original.\n// Small size is preferable.\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\nfunction adler32(adler, buf, len, pos) {\n  var s1 = (adler & 0xffff) |0,\n      s2 = ((adler >>> 16) & 0xffff) |0,\n      n = 0;\n\n  while (len !== 0) {\n    // Set limit ~ twice less than 5552, to keep\n    // s2 in 31-bits, because we force signed ints.\n    // in other case %= will fail.\n    n = len > 2000 ? 2000 : len;\n    len -= n;\n\n    do {\n      s1 = (s1 + buf[pos++]) |0;\n      s2 = (s2 + s1) |0;\n    } while (--n);\n\n    s1 %= 65521;\n    s2 %= 65521;\n  }\n\n  return (s1 | (s2 << 16)) |0;\n}\n\n\nmodule.exports = adler32;\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/adler32.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/constants.js":
/*!*************************************************!*\
  !*** ./node_modules/pako/lib/zlib/constants.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\nmodule.exports = {\n\n  /* Allowed flush values; see deflate() and inflate() below for details */\n  Z_NO_FLUSH:         0,\n  Z_PARTIAL_FLUSH:    1,\n  Z_SYNC_FLUSH:       2,\n  Z_FULL_FLUSH:       3,\n  Z_FINISH:           4,\n  Z_BLOCK:            5,\n  Z_TREES:            6,\n\n  /* Return codes for the compression/decompression functions. Negative values\n  * are errors, positive values are used for special but normal events.\n  */\n  Z_OK:               0,\n  Z_STREAM_END:       1,\n  Z_NEED_DICT:        2,\n  Z_ERRNO:           -1,\n  Z_STREAM_ERROR:    -2,\n  Z_DATA_ERROR:      -3,\n  //Z_MEM_ERROR:     -4,\n  Z_BUF_ERROR:       -5,\n  //Z_VERSION_ERROR: -6,\n\n  /* compression levels */\n  Z_NO_COMPRESSION:         0,\n  Z_BEST_SPEED:             1,\n  Z_BEST_COMPRESSION:       9,\n  Z_DEFAULT_COMPRESSION:   -1,\n\n\n  Z_FILTERED:               1,\n  Z_HUFFMAN_ONLY:           2,\n  Z_RLE:                    3,\n  Z_FIXED:                  4,\n  Z_DEFAULT_STRATEGY:       0,\n\n  /* Possible values of the data_type field (though see inflate()) */\n  Z_BINARY:                 0,\n  Z_TEXT:                   1,\n  //Z_ASCII:                1, // = Z_TEXT (deprecated)\n  Z_UNKNOWN:                2,\n\n  /* The deflate compression method */\n  Z_DEFLATED:               8\n  //Z_NULL:                 null // Use -1 or null inline, depending on var type\n};\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/constants.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/crc32.js":
/*!*********************************************!*\
  !*** ./node_modules/pako/lib/zlib/crc32.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// Note: we can't get significant speed boost here.\n// So write code to minimize size - no pregenerated tables\n// and array tools dependencies.\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\n// Use ordinary array, since untyped makes no boost here\nfunction makeTable() {\n  var c, table = [];\n\n  for (var n = 0; n < 256; n++) {\n    c = n;\n    for (var k = 0; k < 8; k++) {\n      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));\n    }\n    table[n] = c;\n  }\n\n  return table;\n}\n\n// Create table on load. Just 255 signed longs. Not a problem.\nvar crcTable = makeTable();\n\n\nfunction crc32(crc, buf, len, pos) {\n  var t = crcTable,\n      end = pos + len;\n\n  crc ^= -1;\n\n  for (var i = pos; i < end; i++) {\n    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];\n  }\n\n  return (crc ^ (-1)); // >>> 0;\n}\n\n\nmodule.exports = crc32;\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/crc32.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/deflate.js":
/*!***********************************************!*\
  !*** ./node_modules/pako/lib/zlib/deflate.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\nvar utils   = __webpack_require__(/*! ../utils/common */ \"./node_modules/pako/lib/utils/common.js\");\nvar trees   = __webpack_require__(/*! ./trees */ \"./node_modules/pako/lib/zlib/trees.js\");\nvar adler32 = __webpack_require__(/*! ./adler32 */ \"./node_modules/pako/lib/zlib/adler32.js\");\nvar crc32   = __webpack_require__(/*! ./crc32 */ \"./node_modules/pako/lib/zlib/crc32.js\");\nvar msg     = __webpack_require__(/*! ./messages */ \"./node_modules/pako/lib/zlib/messages.js\");\n\n/* Public constants ==========================================================*/\n/* ===========================================================================*/\n\n\n/* Allowed flush values; see deflate() and inflate() below for details */\nvar Z_NO_FLUSH      = 0;\nvar Z_PARTIAL_FLUSH = 1;\n//var Z_SYNC_FLUSH    = 2;\nvar Z_FULL_FLUSH    = 3;\nvar Z_FINISH        = 4;\nvar Z_BLOCK         = 5;\n//var Z_TREES         = 6;\n\n\n/* Return codes for the compression/decompression functions. Negative values\n * are errors, positive values are used for special but normal events.\n */\nvar Z_OK            = 0;\nvar Z_STREAM_END    = 1;\n//var Z_NEED_DICT     = 2;\n//var Z_ERRNO         = -1;\nvar Z_STREAM_ERROR  = -2;\nvar Z_DATA_ERROR    = -3;\n//var Z_MEM_ERROR     = -4;\nvar Z_BUF_ERROR     = -5;\n//var Z_VERSION_ERROR = -6;\n\n\n/* compression levels */\n//var Z_NO_COMPRESSION      = 0;\n//var Z_BEST_SPEED          = 1;\n//var Z_BEST_COMPRESSION    = 9;\nvar Z_DEFAULT_COMPRESSION = -1;\n\n\nvar Z_FILTERED            = 1;\nvar Z_HUFFMAN_ONLY        = 2;\nvar Z_RLE                 = 3;\nvar Z_FIXED               = 4;\nvar Z_DEFAULT_STRATEGY    = 0;\n\n/* Possible values of the data_type field (though see inflate()) */\n//var Z_BINARY              = 0;\n//var Z_TEXT                = 1;\n//var Z_ASCII               = 1; // = Z_TEXT\nvar Z_UNKNOWN             = 2;\n\n\n/* The deflate compression method */\nvar Z_DEFLATED  = 8;\n\n/*============================================================================*/\n\n\nvar MAX_MEM_LEVEL = 9;\n/* Maximum value for memLevel in deflateInit2 */\nvar MAX_WBITS = 15;\n/* 32K LZ77 window */\nvar DEF_MEM_LEVEL = 8;\n\n\nvar LENGTH_CODES  = 29;\n/* number of length codes, not counting the special END_BLOCK code */\nvar LITERALS      = 256;\n/* number of literal bytes 0..255 */\nvar L_CODES       = LITERALS + 1 + LENGTH_CODES;\n/* number of Literal or Length codes, including the END_BLOCK code */\nvar D_CODES       = 30;\n/* number of distance codes */\nvar BL_CODES      = 19;\n/* number of codes used to transfer the bit lengths */\nvar HEAP_SIZE     = 2 * L_CODES + 1;\n/* maximum heap size */\nvar MAX_BITS  = 15;\n/* All codes must not exceed MAX_BITS bits */\n\nvar MIN_MATCH = 3;\nvar MAX_MATCH = 258;\nvar MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);\n\nvar PRESET_DICT = 0x20;\n\nvar INIT_STATE = 42;\nvar EXTRA_STATE = 69;\nvar NAME_STATE = 73;\nvar COMMENT_STATE = 91;\nvar HCRC_STATE = 103;\nvar BUSY_STATE = 113;\nvar FINISH_STATE = 666;\n\nvar BS_NEED_MORE      = 1; /* block not completed, need more input or more output */\nvar BS_BLOCK_DONE     = 2; /* block flush performed */\nvar BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */\nvar BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */\n\nvar OS_CODE = 0x03; // Unix :) . Don't detect, use this default.\n\nfunction err(strm, errorCode) {\n  strm.msg = msg[errorCode];\n  return errorCode;\n}\n\nfunction rank(f) {\n  return ((f) << 1) - ((f) > 4 ? 9 : 0);\n}\n\nfunction zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }\n\n\n/* =========================================================================\n * Flush as much pending output as possible. All deflate() output goes\n * through this function so some applications may wish to modify it\n * to avoid allocating a large strm->output buffer and copying into it.\n * (See also read_buf()).\n */\nfunction flush_pending(strm) {\n  var s = strm.state;\n\n  //_tr_flush_bits(s);\n  var len = s.pending;\n  if (len > strm.avail_out) {\n    len = strm.avail_out;\n  }\n  if (len === 0) { return; }\n\n  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);\n  strm.next_out += len;\n  s.pending_out += len;\n  strm.total_out += len;\n  strm.avail_out -= len;\n  s.pending -= len;\n  if (s.pending === 0) {\n    s.pending_out = 0;\n  }\n}\n\n\nfunction flush_block_only(s, last) {\n  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);\n  s.block_start = s.strstart;\n  flush_pending(s.strm);\n}\n\n\nfunction put_byte(s, b) {\n  s.pending_buf[s.pending++] = b;\n}\n\n\n/* =========================================================================\n * Put a short in the pending buffer. The 16-bit value is put in MSB order.\n * IN assertion: the stream state is correct and there is enough room in\n * pending_buf.\n */\nfunction putShortMSB(s, b) {\n//  put_byte(s, (Byte)(b >> 8));\n//  put_byte(s, (Byte)(b & 0xff));\n  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;\n  s.pending_buf[s.pending++] = b & 0xff;\n}\n\n\n/* ===========================================================================\n * Read a new buffer from the current input stream, update the adler32\n * and total number of bytes read.  All deflate() input goes through\n * this function so some applications may wish to modify it to avoid\n * allocating a large strm->input buffer and copying from it.\n * (See also flush_pending()).\n */\nfunction read_buf(strm, buf, start, size) {\n  var len = strm.avail_in;\n\n  if (len > size) { len = size; }\n  if (len === 0) { return 0; }\n\n  strm.avail_in -= len;\n\n  // zmemcpy(buf, strm->next_in, len);\n  utils.arraySet(buf, strm.input, strm.next_in, len, start);\n  if (strm.state.wrap === 1) {\n    strm.adler = adler32(strm.adler, buf, len, start);\n  }\n\n  else if (strm.state.wrap === 2) {\n    strm.adler = crc32(strm.adler, buf, len, start);\n  }\n\n  strm.next_in += len;\n  strm.total_in += len;\n\n  return len;\n}\n\n\n/* ===========================================================================\n * Set match_start to the longest match starting at the given string and\n * return its length. Matches shorter or equal to prev_length are discarded,\n * in which case the result is equal to prev_length and match_start is\n * garbage.\n * IN assertions: cur_match is the head of the hash chain for the current\n *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1\n * OUT assertion: the match length is not greater than s->lookahead.\n */\nfunction longest_match(s, cur_match) {\n  var chain_length = s.max_chain_length;      /* max hash chain length */\n  var scan = s.strstart; /* current string */\n  var match;                       /* matched string */\n  var len;                           /* length of current match */\n  var best_len = s.prev_length;              /* best match length so far */\n  var nice_match = s.nice_match;             /* stop if match long enough */\n  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?\n      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;\n\n  var _win = s.window; // shortcut\n\n  var wmask = s.w_mask;\n  var prev  = s.prev;\n\n  /* Stop when cur_match becomes <= limit. To simplify the code,\n   * we prevent matches with the string of window index 0.\n   */\n\n  var strend = s.strstart + MAX_MATCH;\n  var scan_end1  = _win[scan + best_len - 1];\n  var scan_end   = _win[scan + best_len];\n\n  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.\n   * It is easy to get rid of this optimization if necessary.\n   */\n  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, \"Code too clever\");\n\n  /* Do not waste too much time if we already have a good match: */\n  if (s.prev_length >= s.good_match) {\n    chain_length >>= 2;\n  }\n  /* Do not look for matches beyond the end of the input. This is necessary\n   * to make deflate deterministic.\n   */\n  if (nice_match > s.lookahead) { nice_match = s.lookahead; }\n\n  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, \"need lookahead\");\n\n  do {\n    // Assert(cur_match < s->strstart, \"no future\");\n    match = cur_match;\n\n    /* Skip to next match if the match length cannot increase\n     * or if the match length is less than 2.  Note that the checks below\n     * for insufficient lookahead only occur occasionally for performance\n     * reasons.  Therefore uninitialized memory will be accessed, and\n     * conditional jumps will be made that depend on those values.\n     * However the length of the match is limited to the lookahead, so\n     * the output of deflate is not affected by the uninitialized values.\n     */\n\n    if (_win[match + best_len]     !== scan_end  ||\n        _win[match + best_len - 1] !== scan_end1 ||\n        _win[match]                !== _win[scan] ||\n        _win[++match]              !== _win[scan + 1]) {\n      continue;\n    }\n\n    /* The check at best_len-1 can be removed because it will be made\n     * again later. (This heuristic is not always a win.)\n     * It is not necessary to compare scan[2] and match[2] since they\n     * are always equal when the other bytes match, given that\n     * the hash keys are equal and that HASH_BITS >= 8.\n     */\n    scan += 2;\n    match++;\n    // Assert(*scan == *match, \"match[2]?\");\n\n    /* We check for insufficient lookahead only every 8th comparison;\n     * the 256th check will be made at strstart+258.\n     */\n    do {\n      /*jshint noempty:false*/\n    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&\n             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&\n             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&\n             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&\n             scan < strend);\n\n    // Assert(scan <= s->window+(unsigned)(s->window_size-1), \"wild scan\");\n\n    len = MAX_MATCH - (strend - scan);\n    scan = strend - MAX_MATCH;\n\n    if (len > best_len) {\n      s.match_start = cur_match;\n      best_len = len;\n      if (len >= nice_match) {\n        break;\n      }\n      scan_end1  = _win[scan + best_len - 1];\n      scan_end   = _win[scan + best_len];\n    }\n  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);\n\n  if (best_len <= s.lookahead) {\n    return best_len;\n  }\n  return s.lookahead;\n}\n\n\n/* ===========================================================================\n * Fill the window when the lookahead becomes insufficient.\n * Updates strstart and lookahead.\n *\n * IN assertion: lookahead < MIN_LOOKAHEAD\n * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD\n *    At least one byte has been read, or avail_in == 0; reads are\n *    performed for at least two bytes (required for the zip translate_eol\n *    option -- not supported here).\n */\nfunction fill_window(s) {\n  var _w_size = s.w_size;\n  var p, n, m, more, str;\n\n  //Assert(s->lookahead < MIN_LOOKAHEAD, \"already enough lookahead\");\n\n  do {\n    more = s.window_size - s.lookahead - s.strstart;\n\n    // JS ints have 32 bit, block below not needed\n    /* Deal with !@#$% 64K limit: */\n    //if (sizeof(int) <= 2) {\n    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {\n    //        more = wsize;\n    //\n    //  } else if (more == (unsigned)(-1)) {\n    //        /* Very unlikely, but possible on 16 bit machine if\n    //         * strstart == 0 && lookahead == 1 (input done a byte at time)\n    //         */\n    //        more--;\n    //    }\n    //}\n\n\n    /* If the window is almost full and there is insufficient lookahead,\n     * move the upper half to the lower one to make room in the upper half.\n     */\n    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {\n\n      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);\n      s.match_start -= _w_size;\n      s.strstart -= _w_size;\n      /* we now have strstart >= MAX_DIST */\n      s.block_start -= _w_size;\n\n      /* Slide the hash table (could be avoided with 32 bit values\n       at the expense of memory usage). We slide even when level == 0\n       to keep the hash table consistent if we switch back to level > 0\n       later. (Using level 0 permanently is not an optimal usage of\n       zlib, so we don't care about this pathological case.)\n       */\n\n      n = s.hash_size;\n      p = n;\n      do {\n        m = s.head[--p];\n        s.head[p] = (m >= _w_size ? m - _w_size : 0);\n      } while (--n);\n\n      n = _w_size;\n      p = n;\n      do {\n        m = s.prev[--p];\n        s.prev[p] = (m >= _w_size ? m - _w_size : 0);\n        /* If n is not on any hash chain, prev[n] is garbage but\n         * its value will never be used.\n         */\n      } while (--n);\n\n      more += _w_size;\n    }\n    if (s.strm.avail_in === 0) {\n      break;\n    }\n\n    /* If there was no sliding:\n     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&\n     *    more == window_size - lookahead - strstart\n     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)\n     * => more >= window_size - 2*WSIZE + 2\n     * In the BIG_MEM or MMAP case (not yet supported),\n     *   window_size == input_size + MIN_LOOKAHEAD  &&\n     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.\n     * Otherwise, window_size == 2*WSIZE so more >= 2.\n     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.\n     */\n    //Assert(more >= 2, \"more < 2\");\n    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);\n    s.lookahead += n;\n\n    /* Initialize the hash value now that we have some input: */\n    if (s.lookahead + s.insert >= MIN_MATCH) {\n      str = s.strstart - s.insert;\n      s.ins_h = s.window[str];\n\n      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */\n      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;\n//#if MIN_MATCH != 3\n//        Call update_hash() MIN_MATCH-3 more times\n//#endif\n      while (s.insert) {\n        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */\n        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;\n\n        s.prev[str & s.w_mask] = s.head[s.ins_h];\n        s.head[s.ins_h] = str;\n        str++;\n        s.insert--;\n        if (s.lookahead + s.insert < MIN_MATCH) {\n          break;\n        }\n      }\n    }\n    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,\n     * but this is not important since only literal bytes will be emitted.\n     */\n\n  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);\n\n  /* If the WIN_INIT bytes after the end of the current data have never been\n   * written, then zero those bytes in order to avoid memory check reports of\n   * the use of uninitialized (or uninitialised as Julian writes) bytes by\n   * the longest match routines.  Update the high water mark for the next\n   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match\n   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.\n   */\n//  if (s.high_water < s.window_size) {\n//    var curr = s.strstart + s.lookahead;\n//    var init = 0;\n//\n//    if (s.high_water < curr) {\n//      /* Previous high water mark below current data -- zero WIN_INIT\n//       * bytes or up to end of window, whichever is less.\n//       */\n//      init = s.window_size - curr;\n//      if (init > WIN_INIT)\n//        init = WIN_INIT;\n//      zmemzero(s->window + curr, (unsigned)init);\n//      s->high_water = curr + init;\n//    }\n//    else if (s->high_water < (ulg)curr + WIN_INIT) {\n//      /* High water mark at or above current data, but below current data\n//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up\n//       * to end of window, whichever is less.\n//       */\n//      init = (ulg)curr + WIN_INIT - s->high_water;\n//      if (init > s->window_size - s->high_water)\n//        init = s->window_size - s->high_water;\n//      zmemzero(s->window + s->high_water, (unsigned)init);\n//      s->high_water += init;\n//    }\n//  }\n//\n//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,\n//    \"not enough room for search\");\n}\n\n/* ===========================================================================\n * Copy without compression as much as possible from the input stream, return\n * the current block state.\n * This function does not insert new strings in the dictionary since\n * uncompressible data is probably not useful. This function is used\n * only for the level=0 compression option.\n * NOTE: this function should be optimized to avoid extra copying from\n * window to pending_buf.\n */\nfunction deflate_stored(s, flush) {\n  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited\n   * to pending_buf_size, and each stored block has a 5 byte header:\n   */\n  var max_block_size = 0xffff;\n\n  if (max_block_size > s.pending_buf_size - 5) {\n    max_block_size = s.pending_buf_size - 5;\n  }\n\n  /* Copy as much as possible from input to output: */\n  for (;;) {\n    /* Fill the window as much as possible: */\n    if (s.lookahead <= 1) {\n\n      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||\n      //  s->block_start >= (long)s->w_size, \"slide too late\");\n//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||\n//        s.block_start >= s.w_size)) {\n//        throw  new Error(\"slide too late\");\n//      }\n\n      fill_window(s);\n      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {\n        return BS_NEED_MORE;\n      }\n\n      if (s.lookahead === 0) {\n        break;\n      }\n      /* flush the current block */\n    }\n    //Assert(s->block_start >= 0L, \"block gone\");\n//    if (s.block_start < 0) throw new Error(\"block gone\");\n\n    s.strstart += s.lookahead;\n    s.lookahead = 0;\n\n    /* Emit a stored block if pending_buf will be full: */\n    var max_start = s.block_start + max_block_size;\n\n    if (s.strstart === 0 || s.strstart >= max_start) {\n      /* strstart == 0 is possible when wraparound on 16-bit machine */\n      s.lookahead = s.strstart - max_start;\n      s.strstart = max_start;\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n\n\n    }\n    /* Flush if we may have to slide, otherwise block_start may become\n     * negative and the data will be gone:\n     */\n    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n    }\n  }\n\n  s.insert = 0;\n\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n\n  if (s.strstart > s.block_start) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n\n  return BS_NEED_MORE;\n}\n\n/* ===========================================================================\n * Compress as much as possible from the input stream, return the current\n * block state.\n * This function does not perform lazy evaluation of matches and inserts\n * new strings in the dictionary only for unmatched strings or for short\n * matches. It is used only for the fast compression options.\n */\nfunction deflate_fast(s, flush) {\n  var hash_head;        /* head of the hash chain */\n  var bflush;           /* set if current block must be flushed */\n\n  for (;;) {\n    /* Make sure that we always have enough lookahead, except\n     * at the end of the input file. We need MAX_MATCH bytes\n     * for the next match, plus MIN_MATCH bytes to insert the\n     * string following the next match.\n     */\n    if (s.lookahead < MIN_LOOKAHEAD) {\n      fill_window(s);\n      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {\n        return BS_NEED_MORE;\n      }\n      if (s.lookahead === 0) {\n        break; /* flush the current block */\n      }\n    }\n\n    /* Insert the string window[strstart .. strstart+2] in the\n     * dictionary, and set hash_head to the head of the hash chain:\n     */\n    hash_head = 0/*NIL*/;\n    if (s.lookahead >= MIN_MATCH) {\n      /*** INSERT_STRING(s, s.strstart, hash_head); ***/\n      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;\n      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];\n      s.head[s.ins_h] = s.strstart;\n      /***/\n    }\n\n    /* Find the longest match, discarding those <= prev_length.\n     * At this point we have always match_length < MIN_MATCH\n     */\n    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {\n      /* To simplify the code, we prevent matches with the string\n       * of window index 0 (in particular we have to avoid a match\n       * of the string with itself at the start of the input file).\n       */\n      s.match_length = longest_match(s, hash_head);\n      /* longest_match() sets match_start */\n    }\n    if (s.match_length >= MIN_MATCH) {\n      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only\n\n      /*** _tr_tally_dist(s, s.strstart - s.match_start,\n                     s.match_length - MIN_MATCH, bflush); ***/\n      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);\n\n      s.lookahead -= s.match_length;\n\n      /* Insert new strings in the hash table only if the match length\n       * is not too large. This saves time but degrades compression.\n       */\n      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {\n        s.match_length--; /* string at strstart already in table */\n        do {\n          s.strstart++;\n          /*** INSERT_STRING(s, s.strstart, hash_head); ***/\n          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;\n          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];\n          s.head[s.ins_h] = s.strstart;\n          /***/\n          /* strstart never exceeds WSIZE-MAX_MATCH, so there are\n           * always MIN_MATCH bytes ahead.\n           */\n        } while (--s.match_length !== 0);\n        s.strstart++;\n      } else\n      {\n        s.strstart += s.match_length;\n        s.match_length = 0;\n        s.ins_h = s.window[s.strstart];\n        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */\n        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;\n\n//#if MIN_MATCH != 3\n//                Call UPDATE_HASH() MIN_MATCH-3 more times\n//#endif\n        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not\n         * matter since it will be recomputed at next deflate call.\n         */\n      }\n    } else {\n      /* No match, output a literal byte */\n      //Tracevv((stderr,\"%c\", s.window[s.strstart]));\n      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/\n      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);\n\n      s.lookahead--;\n      s.strstart++;\n    }\n    if (bflush) {\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n    }\n  }\n  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n  if (s.last_lit) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n  return BS_BLOCK_DONE;\n}\n\n/* ===========================================================================\n * Same as above, but achieves better compression. We use a lazy\n * evaluation for matches: a match is finally adopted only if there is\n * no better match at the next window position.\n */\nfunction deflate_slow(s, flush) {\n  var hash_head;          /* head of hash chain */\n  var bflush;              /* set if current block must be flushed */\n\n  var max_insert;\n\n  /* Process the input block. */\n  for (;;) {\n    /* Make sure that we always have enough lookahead, except\n     * at the end of the input file. We need MAX_MATCH bytes\n     * for the next match, plus MIN_MATCH bytes to insert the\n     * string following the next match.\n     */\n    if (s.lookahead < MIN_LOOKAHEAD) {\n      fill_window(s);\n      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {\n        return BS_NEED_MORE;\n      }\n      if (s.lookahead === 0) { break; } /* flush the current block */\n    }\n\n    /* Insert the string window[strstart .. strstart+2] in the\n     * dictionary, and set hash_head to the head of the hash chain:\n     */\n    hash_head = 0/*NIL*/;\n    if (s.lookahead >= MIN_MATCH) {\n      /*** INSERT_STRING(s, s.strstart, hash_head); ***/\n      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;\n      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];\n      s.head[s.ins_h] = s.strstart;\n      /***/\n    }\n\n    /* Find the longest match, discarding those <= prev_length.\n     */\n    s.prev_length = s.match_length;\n    s.prev_match = s.match_start;\n    s.match_length = MIN_MATCH - 1;\n\n    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&\n        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {\n      /* To simplify the code, we prevent matches with the string\n       * of window index 0 (in particular we have to avoid a match\n       * of the string with itself at the start of the input file).\n       */\n      s.match_length = longest_match(s, hash_head);\n      /* longest_match() sets match_start */\n\n      if (s.match_length <= 5 &&\n         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {\n\n        /* If prev_match is also MIN_MATCH, match_start is garbage\n         * but we will ignore the current match anyway.\n         */\n        s.match_length = MIN_MATCH - 1;\n      }\n    }\n    /* If there was a match at the previous step and the current\n     * match is not better, output the previous match:\n     */\n    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {\n      max_insert = s.strstart + s.lookahead - MIN_MATCH;\n      /* Do not insert strings in hash table beyond this. */\n\n      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);\n\n      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,\n                     s.prev_length - MIN_MATCH, bflush);***/\n      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);\n      /* Insert in hash table all strings up to the end of the match.\n       * strstart-1 and strstart are already inserted. If there is not\n       * enough lookahead, the last two strings are not inserted in\n       * the hash table.\n       */\n      s.lookahead -= s.prev_length - 1;\n      s.prev_length -= 2;\n      do {\n        if (++s.strstart <= max_insert) {\n          /*** INSERT_STRING(s, s.strstart, hash_head); ***/\n          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;\n          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];\n          s.head[s.ins_h] = s.strstart;\n          /***/\n        }\n      } while (--s.prev_length !== 0);\n      s.match_available = 0;\n      s.match_length = MIN_MATCH - 1;\n      s.strstart++;\n\n      if (bflush) {\n        /*** FLUSH_BLOCK(s, 0); ***/\n        flush_block_only(s, false);\n        if (s.strm.avail_out === 0) {\n          return BS_NEED_MORE;\n        }\n        /***/\n      }\n\n    } else if (s.match_available) {\n      /* If there was no match at the previous position, output a\n       * single literal. If there was a match but the current match\n       * is longer, truncate the previous match to a single literal.\n       */\n      //Tracevv((stderr,\"%c\", s->window[s->strstart-1]));\n      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/\n      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);\n\n      if (bflush) {\n        /*** FLUSH_BLOCK_ONLY(s, 0) ***/\n        flush_block_only(s, false);\n        /***/\n      }\n      s.strstart++;\n      s.lookahead--;\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n    } else {\n      /* There is no previous match to compare with, wait for\n       * the next step to decide.\n       */\n      s.match_available = 1;\n      s.strstart++;\n      s.lookahead--;\n    }\n  }\n  //Assert (flush != Z_NO_FLUSH, \"no flush?\");\n  if (s.match_available) {\n    //Tracevv((stderr,\"%c\", s->window[s->strstart-1]));\n    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/\n    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);\n\n    s.match_available = 0;\n  }\n  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n  if (s.last_lit) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n\n  return BS_BLOCK_DONE;\n}\n\n\n/* ===========================================================================\n * For Z_RLE, simply look for runs of bytes, generate matches only of distance\n * one.  Do not maintain a hash table.  (It will be regenerated if this run of\n * deflate switches away from Z_RLE.)\n */\nfunction deflate_rle(s, flush) {\n  var bflush;            /* set if current block must be flushed */\n  var prev;              /* byte at distance one to match */\n  var scan, strend;      /* scan goes up to strend for length of run */\n\n  var _win = s.window;\n\n  for (;;) {\n    /* Make sure that we always have enough lookahead, except\n     * at the end of the input file. We need MAX_MATCH bytes\n     * for the longest run, plus one for the unrolled loop.\n     */\n    if (s.lookahead <= MAX_MATCH) {\n      fill_window(s);\n      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {\n        return BS_NEED_MORE;\n      }\n      if (s.lookahead === 0) { break; } /* flush the current block */\n    }\n\n    /* See how many times the previous byte repeats */\n    s.match_length = 0;\n    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {\n      scan = s.strstart - 1;\n      prev = _win[scan];\n      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {\n        strend = s.strstart + MAX_MATCH;\n        do {\n          /*jshint noempty:false*/\n        } while (prev === _win[++scan] && prev === _win[++scan] &&\n                 prev === _win[++scan] && prev === _win[++scan] &&\n                 prev === _win[++scan] && prev === _win[++scan] &&\n                 prev === _win[++scan] && prev === _win[++scan] &&\n                 scan < strend);\n        s.match_length = MAX_MATCH - (strend - scan);\n        if (s.match_length > s.lookahead) {\n          s.match_length = s.lookahead;\n        }\n      }\n      //Assert(scan <= s->window+(uInt)(s->window_size-1), \"wild scan\");\n    }\n\n    /* Emit match if have run of MIN_MATCH or longer, else emit literal */\n    if (s.match_length >= MIN_MATCH) {\n      //check_match(s, s.strstart, s.strstart - 1, s.match_length);\n\n      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/\n      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);\n\n      s.lookahead -= s.match_length;\n      s.strstart += s.match_length;\n      s.match_length = 0;\n    } else {\n      /* No match, output a literal byte */\n      //Tracevv((stderr,\"%c\", s->window[s->strstart]));\n      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/\n      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);\n\n      s.lookahead--;\n      s.strstart++;\n    }\n    if (bflush) {\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n    }\n  }\n  s.insert = 0;\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n  if (s.last_lit) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n  return BS_BLOCK_DONE;\n}\n\n/* ===========================================================================\n * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.\n * (It will be regenerated if this run of deflate switches away from Huffman.)\n */\nfunction deflate_huff(s, flush) {\n  var bflush;             /* set if current block must be flushed */\n\n  for (;;) {\n    /* Make sure that we have a literal to write. */\n    if (s.lookahead === 0) {\n      fill_window(s);\n      if (s.lookahead === 0) {\n        if (flush === Z_NO_FLUSH) {\n          return BS_NEED_MORE;\n        }\n        break;      /* flush the current block */\n      }\n    }\n\n    /* Output a literal byte */\n    s.match_length = 0;\n    //Tracevv((stderr,\"%c\", s->window[s->strstart]));\n    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/\n    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);\n    s.lookahead--;\n    s.strstart++;\n    if (bflush) {\n      /*** FLUSH_BLOCK(s, 0); ***/\n      flush_block_only(s, false);\n      if (s.strm.avail_out === 0) {\n        return BS_NEED_MORE;\n      }\n      /***/\n    }\n  }\n  s.insert = 0;\n  if (flush === Z_FINISH) {\n    /*** FLUSH_BLOCK(s, 1); ***/\n    flush_block_only(s, true);\n    if (s.strm.avail_out === 0) {\n      return BS_FINISH_STARTED;\n    }\n    /***/\n    return BS_FINISH_DONE;\n  }\n  if (s.last_lit) {\n    /*** FLUSH_BLOCK(s, 0); ***/\n    flush_block_only(s, false);\n    if (s.strm.avail_out === 0) {\n      return BS_NEED_MORE;\n    }\n    /***/\n  }\n  return BS_BLOCK_DONE;\n}\n\n/* Values for max_lazy_match, good_match and max_chain_length, depending on\n * the desired pack level (0..9). The values given below have been tuned to\n * exclude worst case performance for pathological files. Better values may be\n * found for specific files.\n */\nfunction Config(good_length, max_lazy, nice_length, max_chain, func) {\n  this.good_length = good_length;\n  this.max_lazy = max_lazy;\n  this.nice_length = nice_length;\n  this.max_chain = max_chain;\n  this.func = func;\n}\n\nvar configuration_table;\n\nconfiguration_table = [\n  /*      good lazy nice chain */\n  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */\n  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */\n  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */\n  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */\n\n  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */\n  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */\n  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */\n  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */\n  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */\n  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */\n];\n\n\n/* ===========================================================================\n * Initialize the \"longest match\" routines for a new zlib stream\n */\nfunction lm_init(s) {\n  s.window_size = 2 * s.w_size;\n\n  /*** CLEAR_HASH(s); ***/\n  zero(s.head); // Fill with NIL (= 0);\n\n  /* Set the default configuration parameters:\n   */\n  s.max_lazy_match = configuration_table[s.level].max_lazy;\n  s.good_match = configuration_table[s.level].good_length;\n  s.nice_match = configuration_table[s.level].nice_length;\n  s.max_chain_length = configuration_table[s.level].max_chain;\n\n  s.strstart = 0;\n  s.block_start = 0;\n  s.lookahead = 0;\n  s.insert = 0;\n  s.match_length = s.prev_length = MIN_MATCH - 1;\n  s.match_available = 0;\n  s.ins_h = 0;\n}\n\n\nfunction DeflateState() {\n  this.strm = null;            /* pointer back to this zlib stream */\n  this.status = 0;            /* as the name implies */\n  this.pending_buf = null;      /* output still pending */\n  this.pending_buf_size = 0;  /* size of pending_buf */\n  this.pending_out = 0;       /* next pending byte to output to the stream */\n  this.pending = 0;           /* nb of bytes in the pending buffer */\n  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */\n  this.gzhead = null;         /* gzip header information to write */\n  this.gzindex = 0;           /* where in extra, name, or comment */\n  this.method = Z_DEFLATED; /* can only be DEFLATED */\n  this.last_flush = -1;   /* value of flush param for previous deflate call */\n\n  this.w_size = 0;  /* LZ77 window size (32K by default) */\n  this.w_bits = 0;  /* log2(w_size)  (8..16) */\n  this.w_mask = 0;  /* w_size - 1 */\n\n  this.window = null;\n  /* Sliding window. Input bytes are read into the second half of the window,\n   * and move to the first half later to keep a dictionary of at least wSize\n   * bytes. With this organization, matches are limited to a distance of\n   * wSize-MAX_MATCH bytes, but this ensures that IO is always\n   * performed with a length multiple of the block size.\n   */\n\n  this.window_size = 0;\n  /* Actual size of window: 2*wSize, except when the user input buffer\n   * is directly used as sliding window.\n   */\n\n  this.prev = null;\n  /* Link to older string with same hash index. To limit the size of this\n   * array to 64K, this link is maintained only for the last 32K strings.\n   * An index in this array is thus a window index modulo 32K.\n   */\n\n  this.head = null;   /* Heads of the hash chains or NIL. */\n\n  this.ins_h = 0;       /* hash index of string to be inserted */\n  this.hash_size = 0;   /* number of elements in hash table */\n  this.hash_bits = 0;   /* log2(hash_size) */\n  this.hash_mask = 0;   /* hash_size-1 */\n\n  this.hash_shift = 0;\n  /* Number of bits by which ins_h must be shifted at each input\n   * step. It must be such that after MIN_MATCH steps, the oldest\n   * byte no longer takes part in the hash key, that is:\n   *   hash_shift * MIN_MATCH >= hash_bits\n   */\n\n  this.block_start = 0;\n  /* Window position at the beginning of the current output block. Gets\n   * negative when the window is moved backwards.\n   */\n\n  this.match_length = 0;      /* length of best match */\n  this.prev_match = 0;        /* previous match */\n  this.match_available = 0;   /* set if previous match exists */\n  this.strstart = 0;          /* start of string to insert */\n  this.match_start = 0;       /* start of matching string */\n  this.lookahead = 0;         /* number of valid bytes ahead in window */\n\n  this.prev_length = 0;\n  /* Length of the best match at previous step. Matches not greater than this\n   * are discarded. This is used in the lazy match evaluation.\n   */\n\n  this.max_chain_length = 0;\n  /* To speed up deflation, hash chains are never searched beyond this\n   * length.  A higher limit improves compression ratio but degrades the\n   * speed.\n   */\n\n  this.max_lazy_match = 0;\n  /* Attempt to find a better match only when the current match is strictly\n   * smaller than this value. This mechanism is used only for compression\n   * levels >= 4.\n   */\n  // That's alias to max_lazy_match, don't use directly\n  //this.max_insert_length = 0;\n  /* Insert new strings in the hash table only if the match length is not\n   * greater than this length. This saves time but degrades compression.\n   * max_insert_length is used only for compression levels <= 3.\n   */\n\n  this.level = 0;     /* compression level (1..9) */\n  this.strategy = 0;  /* favor or force Huffman coding*/\n\n  this.good_match = 0;\n  /* Use a faster search when the previous match is longer than this */\n\n  this.nice_match = 0; /* Stop searching when current match exceeds this */\n\n              /* used by trees.c: */\n\n  /* Didn't use ct_data typedef below to suppress compiler warning */\n\n  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */\n  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */\n  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */\n\n  // Use flat array of DOUBLE size, with interleaved fata,\n  // because JS does not support effective\n  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);\n  this.dyn_dtree  = new utils.Buf16((2 * D_CODES + 1) * 2);\n  this.bl_tree    = new utils.Buf16((2 * BL_CODES + 1) * 2);\n  zero(this.dyn_ltree);\n  zero(this.dyn_dtree);\n  zero(this.bl_tree);\n\n  this.l_desc   = null;         /* desc. for literal tree */\n  this.d_desc   = null;         /* desc. for distance tree */\n  this.bl_desc  = null;         /* desc. for bit length tree */\n\n  //ush bl_count[MAX_BITS+1];\n  this.bl_count = new utils.Buf16(MAX_BITS + 1);\n  /* number of codes at each bit length for an optimal tree */\n\n  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */\n  this.heap = new utils.Buf16(2 * L_CODES + 1);  /* heap used to build the Huffman trees */\n  zero(this.heap);\n\n  this.heap_len = 0;               /* number of elements in the heap */\n  this.heap_max = 0;               /* element of largest frequency */\n  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.\n   * The same heap array is used to build all trees.\n   */\n\n  this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];\n  zero(this.depth);\n  /* Depth of each subtree used as tie breaker for trees of equal frequency\n   */\n\n  this.l_buf = 0;          /* buffer index for literals or lengths */\n\n  this.lit_bufsize = 0;\n  /* Size of match buffer for literals/lengths.  There are 4 reasons for\n   * limiting lit_bufsize to 64K:\n   *   - frequencies can be kept in 16 bit counters\n   *   - if compression is not successful for the first block, all input\n   *     data is still in the window so we can still emit a stored block even\n   *     when input comes from standard input.  (This can also be done for\n   *     all blocks if lit_bufsize is not greater than 32K.)\n   *   - if compression is not successful for a file smaller than 64K, we can\n   *     even emit a stored file instead of a stored block (saving 5 bytes).\n   *     This is applicable only for zip (not gzip or zlib).\n   *   - creating new Huffman trees less frequently may not provide fast\n   *     adaptation to changes in the input data statistics. (Take for\n   *     example a binary file with poorly compressible code followed by\n   *     a highly compressible string table.) Smaller buffer sizes give\n   *     fast adaptation but have of course the overhead of transmitting\n   *     trees more frequently.\n   *   - I can't count above 4\n   */\n\n  this.last_lit = 0;      /* running index in l_buf */\n\n  this.d_buf = 0;\n  /* Buffer index for distances. To simplify the code, d_buf and l_buf have\n   * the same number of elements. To use different lengths, an extra flag\n   * array would be necessary.\n   */\n\n  this.opt_len = 0;       /* bit length of current block with optimal trees */\n  this.static_len = 0;    /* bit length of current block with static trees */\n  this.matches = 0;       /* number of string matches in current block */\n  this.insert = 0;        /* bytes at end of window left to insert */\n\n\n  this.bi_buf = 0;\n  /* Output buffer. bits are inserted starting at the bottom (least\n   * significant bits).\n   */\n  this.bi_valid = 0;\n  /* Number of valid bits in bi_buf.  All bits above the last valid bit\n   * are always zero.\n   */\n\n  // Used for window memory init. We safely ignore it for JS. That makes\n  // sense only for pointers and memory check tools.\n  //this.high_water = 0;\n  /* High water mark offset in window for initialized bytes -- bytes above\n   * this are set to zero in order to avoid memory check warnings when\n   * longest match routines access bytes past the input.  This is then\n   * updated to the new high water mark.\n   */\n}\n\n\nfunction deflateResetKeep(strm) {\n  var s;\n\n  if (!strm || !strm.state) {\n    return err(strm, Z_STREAM_ERROR);\n  }\n\n  strm.total_in = strm.total_out = 0;\n  strm.data_type = Z_UNKNOWN;\n\n  s = strm.state;\n  s.pending = 0;\n  s.pending_out = 0;\n\n  if (s.wrap < 0) {\n    s.wrap = -s.wrap;\n    /* was made negative by deflate(..., Z_FINISH); */\n  }\n  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);\n  strm.adler = (s.wrap === 2) ?\n    0  // crc32(0, Z_NULL, 0)\n  :\n    1; // adler32(0, Z_NULL, 0)\n  s.last_flush = Z_NO_FLUSH;\n  trees._tr_init(s);\n  return Z_OK;\n}\n\n\nfunction deflateReset(strm) {\n  var ret = deflateResetKeep(strm);\n  if (ret === Z_OK) {\n    lm_init(strm.state);\n  }\n  return ret;\n}\n\n\nfunction deflateSetHeader(strm, head) {\n  if (!strm || !strm.state) { return Z_STREAM_ERROR; }\n  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }\n  strm.state.gzhead = head;\n  return Z_OK;\n}\n\n\nfunction deflateInit2(strm, level, method, windowBits, memLevel, strategy) {\n  if (!strm) { // === Z_NULL\n    return Z_STREAM_ERROR;\n  }\n  var wrap = 1;\n\n  if (level === Z_DEFAULT_COMPRESSION) {\n    level = 6;\n  }\n\n  if (windowBits < 0) { /* suppress zlib wrapper */\n    wrap = 0;\n    windowBits = -windowBits;\n  }\n\n  else if (windowBits > 15) {\n    wrap = 2;           /* write gzip wrapper instead */\n    windowBits -= 16;\n  }\n\n\n  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||\n    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||\n    strategy < 0 || strategy > Z_FIXED) {\n    return err(strm, Z_STREAM_ERROR);\n  }\n\n\n  if (windowBits === 8) {\n    windowBits = 9;\n  }\n  /* until 256-byte window bug fixed */\n\n  var s = new DeflateState();\n\n  strm.state = s;\n  s.strm = strm;\n\n  s.wrap = wrap;\n  s.gzhead = null;\n  s.w_bits = windowBits;\n  s.w_size = 1 << s.w_bits;\n  s.w_mask = s.w_size - 1;\n\n  s.hash_bits = memLevel + 7;\n  s.hash_size = 1 << s.hash_bits;\n  s.hash_mask = s.hash_size - 1;\n  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);\n\n  s.window = new utils.Buf8(s.w_size * 2);\n  s.head = new utils.Buf16(s.hash_size);\n  s.prev = new utils.Buf16(s.w_size);\n\n  // Don't need mem init magic for JS.\n  //s.high_water = 0;  /* nothing written to s->window yet */\n\n  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */\n\n  s.pending_buf_size = s.lit_bufsize * 4;\n\n  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);\n  //s->pending_buf = (uchf *) overlay;\n  s.pending_buf = new utils.Buf8(s.pending_buf_size);\n\n  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)\n  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);\n  s.d_buf = 1 * s.lit_bufsize;\n\n  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;\n  s.l_buf = (1 + 2) * s.lit_bufsize;\n\n  s.level = level;\n  s.strategy = strategy;\n  s.method = method;\n\n  return deflateReset(strm);\n}\n\nfunction deflateInit(strm, level) {\n  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);\n}\n\n\nfunction deflate(strm, flush) {\n  var old_flush, s;\n  var beg, val; // for gzip header write only\n\n  if (!strm || !strm.state ||\n    flush > Z_BLOCK || flush < 0) {\n    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;\n  }\n\n  s = strm.state;\n\n  if (!strm.output ||\n      (!strm.input && strm.avail_in !== 0) ||\n      (s.status === FINISH_STATE && flush !== Z_FINISH)) {\n    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);\n  }\n\n  s.strm = strm; /* just in case */\n  old_flush = s.last_flush;\n  s.last_flush = flush;\n\n  /* Write the header */\n  if (s.status === INIT_STATE) {\n\n    if (s.wrap === 2) { // GZIP header\n      strm.adler = 0;  //crc32(0L, Z_NULL, 0);\n      put_byte(s, 31);\n      put_byte(s, 139);\n      put_byte(s, 8);\n      if (!s.gzhead) { // s->gzhead == Z_NULL\n        put_byte(s, 0);\n        put_byte(s, 0);\n        put_byte(s, 0);\n        put_byte(s, 0);\n        put_byte(s, 0);\n        put_byte(s, s.level === 9 ? 2 :\n                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?\n                     4 : 0));\n        put_byte(s, OS_CODE);\n        s.status = BUSY_STATE;\n      }\n      else {\n        put_byte(s, (s.gzhead.text ? 1 : 0) +\n                    (s.gzhead.hcrc ? 2 : 0) +\n                    (!s.gzhead.extra ? 0 : 4) +\n                    (!s.gzhead.name ? 0 : 8) +\n                    (!s.gzhead.comment ? 0 : 16)\n        );\n        put_byte(s, s.gzhead.time & 0xff);\n        put_byte(s, (s.gzhead.time >> 8) & 0xff);\n        put_byte(s, (s.gzhead.time >> 16) & 0xff);\n        put_byte(s, (s.gzhead.time >> 24) & 0xff);\n        put_byte(s, s.level === 9 ? 2 :\n                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?\n                     4 : 0));\n        put_byte(s, s.gzhead.os & 0xff);\n        if (s.gzhead.extra && s.gzhead.extra.length) {\n          put_byte(s, s.gzhead.extra.length & 0xff);\n          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);\n        }\n        if (s.gzhead.hcrc) {\n          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);\n        }\n        s.gzindex = 0;\n        s.status = EXTRA_STATE;\n      }\n    }\n    else // DEFLATE header\n    {\n      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;\n      var level_flags = -1;\n\n      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {\n        level_flags = 0;\n      } else if (s.level < 6) {\n        level_flags = 1;\n      } else if (s.level === 6) {\n        level_flags = 2;\n      } else {\n        level_flags = 3;\n      }\n      header |= (level_flags << 6);\n      if (s.strstart !== 0) { header |= PRESET_DICT; }\n      header += 31 - (header % 31);\n\n      s.status = BUSY_STATE;\n      putShortMSB(s, header);\n\n      /* Save the adler32 of the preset dictionary: */\n      if (s.strstart !== 0) {\n        putShortMSB(s, strm.adler >>> 16);\n        putShortMSB(s, strm.adler & 0xffff);\n      }\n      strm.adler = 1; // adler32(0L, Z_NULL, 0);\n    }\n  }\n\n//#ifdef GZIP\n  if (s.status === EXTRA_STATE) {\n    if (s.gzhead.extra/* != Z_NULL*/) {\n      beg = s.pending;  /* start of bytes to update crc */\n\n      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {\n        if (s.pending === s.pending_buf_size) {\n          if (s.gzhead.hcrc && s.pending > beg) {\n            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n          }\n          flush_pending(strm);\n          beg = s.pending;\n          if (s.pending === s.pending_buf_size) {\n            break;\n          }\n        }\n        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);\n        s.gzindex++;\n      }\n      if (s.gzhead.hcrc && s.pending > beg) {\n        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n      }\n      if (s.gzindex === s.gzhead.extra.length) {\n        s.gzindex = 0;\n        s.status = NAME_STATE;\n      }\n    }\n    else {\n      s.status = NAME_STATE;\n    }\n  }\n  if (s.status === NAME_STATE) {\n    if (s.gzhead.name/* != Z_NULL*/) {\n      beg = s.pending;  /* start of bytes to update crc */\n      //int val;\n\n      do {\n        if (s.pending === s.pending_buf_size) {\n          if (s.gzhead.hcrc && s.pending > beg) {\n            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n          }\n          flush_pending(strm);\n          beg = s.pending;\n          if (s.pending === s.pending_buf_size) {\n            val = 1;\n            break;\n          }\n        }\n        // JS specific: little magic to add zero terminator to end of string\n        if (s.gzindex < s.gzhead.name.length) {\n          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;\n        } else {\n          val = 0;\n        }\n        put_byte(s, val);\n      } while (val !== 0);\n\n      if (s.gzhead.hcrc && s.pending > beg) {\n        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n      }\n      if (val === 0) {\n        s.gzindex = 0;\n        s.status = COMMENT_STATE;\n      }\n    }\n    else {\n      s.status = COMMENT_STATE;\n    }\n  }\n  if (s.status === COMMENT_STATE) {\n    if (s.gzhead.comment/* != Z_NULL*/) {\n      beg = s.pending;  /* start of bytes to update crc */\n      //int val;\n\n      do {\n        if (s.pending === s.pending_buf_size) {\n          if (s.gzhead.hcrc && s.pending > beg) {\n            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n          }\n          flush_pending(strm);\n          beg = s.pending;\n          if (s.pending === s.pending_buf_size) {\n            val = 1;\n            break;\n          }\n        }\n        // JS specific: little magic to add zero terminator to end of string\n        if (s.gzindex < s.gzhead.comment.length) {\n          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;\n        } else {\n          val = 0;\n        }\n        put_byte(s, val);\n      } while (val !== 0);\n\n      if (s.gzhead.hcrc && s.pending > beg) {\n        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);\n      }\n      if (val === 0) {\n        s.status = HCRC_STATE;\n      }\n    }\n    else {\n      s.status = HCRC_STATE;\n    }\n  }\n  if (s.status === HCRC_STATE) {\n    if (s.gzhead.hcrc) {\n      if (s.pending + 2 > s.pending_buf_size) {\n        flush_pending(strm);\n      }\n      if (s.pending + 2 <= s.pending_buf_size) {\n        put_byte(s, strm.adler & 0xff);\n        put_byte(s, (strm.adler >> 8) & 0xff);\n        strm.adler = 0; //crc32(0L, Z_NULL, 0);\n        s.status = BUSY_STATE;\n      }\n    }\n    else {\n      s.status = BUSY_STATE;\n    }\n  }\n//#endif\n\n  /* Flush as much pending output as possible */\n  if (s.pending !== 0) {\n    flush_pending(strm);\n    if (strm.avail_out === 0) {\n      /* Since avail_out is 0, deflate will be called again with\n       * more output space, but possibly with both pending and\n       * avail_in equal to zero. There won't be anything to do,\n       * but this is not an error situation so make sure we\n       * return OK instead of BUF_ERROR at next call of deflate:\n       */\n      s.last_flush = -1;\n      return Z_OK;\n    }\n\n    /* Make sure there is something to do and avoid duplicate consecutive\n     * flushes. For repeated and useless calls with Z_FINISH, we keep\n     * returning Z_STREAM_END instead of Z_BUF_ERROR.\n     */\n  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&\n    flush !== Z_FINISH) {\n    return err(strm, Z_BUF_ERROR);\n  }\n\n  /* User must not provide more input after the first FINISH: */\n  if (s.status === FINISH_STATE && strm.avail_in !== 0) {\n    return err(strm, Z_BUF_ERROR);\n  }\n\n  /* Start a new block or continue the current one.\n   */\n  if (strm.avail_in !== 0 || s.lookahead !== 0 ||\n    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {\n    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :\n      (s.strategy === Z_RLE ? deflate_rle(s, flush) :\n        configuration_table[s.level].func(s, flush));\n\n    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {\n      s.status = FINISH_STATE;\n    }\n    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {\n      if (strm.avail_out === 0) {\n        s.last_flush = -1;\n        /* avoid BUF_ERROR next call, see above */\n      }\n      return Z_OK;\n      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call\n       * of deflate should use the same flush parameter to make sure\n       * that the flush is complete. So we don't have to output an\n       * empty block here, this will be done at next call. This also\n       * ensures that for a very small output buffer, we emit at most\n       * one empty block.\n       */\n    }\n    if (bstate === BS_BLOCK_DONE) {\n      if (flush === Z_PARTIAL_FLUSH) {\n        trees._tr_align(s);\n      }\n      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */\n\n        trees._tr_stored_block(s, 0, 0, false);\n        /* For a full flush, this empty block will be recognized\n         * as a special marker by inflate_sync().\n         */\n        if (flush === Z_FULL_FLUSH) {\n          /*** CLEAR_HASH(s); ***/             /* forget history */\n          zero(s.head); // Fill with NIL (= 0);\n\n          if (s.lookahead === 0) {\n            s.strstart = 0;\n            s.block_start = 0;\n            s.insert = 0;\n          }\n        }\n      }\n      flush_pending(strm);\n      if (strm.avail_out === 0) {\n        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */\n        return Z_OK;\n      }\n    }\n  }\n  //Assert(strm->avail_out > 0, \"bug2\");\n  //if (strm.avail_out <= 0) { throw new Error(\"bug2\");}\n\n  if (flush !== Z_FINISH) { return Z_OK; }\n  if (s.wrap <= 0) { return Z_STREAM_END; }\n\n  /* Write the trailer */\n  if (s.wrap === 2) {\n    put_byte(s, strm.adler & 0xff);\n    put_byte(s, (strm.adler >> 8) & 0xff);\n    put_byte(s, (strm.adler >> 16) & 0xff);\n    put_byte(s, (strm.adler >> 24) & 0xff);\n    put_byte(s, strm.total_in & 0xff);\n    put_byte(s, (strm.total_in >> 8) & 0xff);\n    put_byte(s, (strm.total_in >> 16) & 0xff);\n    put_byte(s, (strm.total_in >> 24) & 0xff);\n  }\n  else\n  {\n    putShortMSB(s, strm.adler >>> 16);\n    putShortMSB(s, strm.adler & 0xffff);\n  }\n\n  flush_pending(strm);\n  /* If avail_out is zero, the application will call deflate again\n   * to flush the rest.\n   */\n  if (s.wrap > 0) { s.wrap = -s.wrap; }\n  /* write the trailer only once! */\n  return s.pending !== 0 ? Z_OK : Z_STREAM_END;\n}\n\nfunction deflateEnd(strm) {\n  var status;\n\n  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {\n    return Z_STREAM_ERROR;\n  }\n\n  status = strm.state.status;\n  if (status !== INIT_STATE &&\n    status !== EXTRA_STATE &&\n    status !== NAME_STATE &&\n    status !== COMMENT_STATE &&\n    status !== HCRC_STATE &&\n    status !== BUSY_STATE &&\n    status !== FINISH_STATE\n  ) {\n    return err(strm, Z_STREAM_ERROR);\n  }\n\n  strm.state = null;\n\n  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;\n}\n\n\n/* =========================================================================\n * Initializes the compression dictionary from the given byte\n * sequence without producing any compressed output.\n */\nfunction deflateSetDictionary(strm, dictionary) {\n  var dictLength = dictionary.length;\n\n  var s;\n  var str, n;\n  var wrap;\n  var avail;\n  var next;\n  var input;\n  var tmpDict;\n\n  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {\n    return Z_STREAM_ERROR;\n  }\n\n  s = strm.state;\n  wrap = s.wrap;\n\n  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {\n    return Z_STREAM_ERROR;\n  }\n\n  /* when using zlib wrappers, compute Adler-32 for provided dictionary */\n  if (wrap === 1) {\n    /* adler32(strm->adler, dictionary, dictLength); */\n    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);\n  }\n\n  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */\n\n  /* if dictionary would fill window, just replace the history */\n  if (dictLength >= s.w_size) {\n    if (wrap === 0) {            /* already empty otherwise */\n      /*** CLEAR_HASH(s); ***/\n      zero(s.head); // Fill with NIL (= 0);\n      s.strstart = 0;\n      s.block_start = 0;\n      s.insert = 0;\n    }\n    /* use the tail */\n    // dictionary = dictionary.slice(dictLength - s.w_size);\n    tmpDict = new utils.Buf8(s.w_size);\n    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);\n    dictionary = tmpDict;\n    dictLength = s.w_size;\n  }\n  /* insert dictionary into window and hash */\n  avail = strm.avail_in;\n  next = strm.next_in;\n  input = strm.input;\n  strm.avail_in = dictLength;\n  strm.next_in = 0;\n  strm.input = dictionary;\n  fill_window(s);\n  while (s.lookahead >= MIN_MATCH) {\n    str = s.strstart;\n    n = s.lookahead - (MIN_MATCH - 1);\n    do {\n      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */\n      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;\n\n      s.prev[str & s.w_mask] = s.head[s.ins_h];\n\n      s.head[s.ins_h] = str;\n      str++;\n    } while (--n);\n    s.strstart = str;\n    s.lookahead = MIN_MATCH - 1;\n    fill_window(s);\n  }\n  s.strstart += s.lookahead;\n  s.block_start = s.strstart;\n  s.insert = s.lookahead;\n  s.lookahead = 0;\n  s.match_length = s.prev_length = MIN_MATCH - 1;\n  s.match_available = 0;\n  strm.next_in = next;\n  strm.input = input;\n  strm.avail_in = avail;\n  s.wrap = wrap;\n  return Z_OK;\n}\n\n\nexports.deflateInit = deflateInit;\nexports.deflateInit2 = deflateInit2;\nexports.deflateReset = deflateReset;\nexports.deflateResetKeep = deflateResetKeep;\nexports.deflateSetHeader = deflateSetHeader;\nexports.deflate = deflate;\nexports.deflateEnd = deflateEnd;\nexports.deflateSetDictionary = deflateSetDictionary;\nexports.deflateInfo = 'pako deflate (from Nodeca project)';\n\n/* Not implemented\nexports.deflateBound = deflateBound;\nexports.deflateCopy = deflateCopy;\nexports.deflateParams = deflateParams;\nexports.deflatePending = deflatePending;\nexports.deflatePrime = deflatePrime;\nexports.deflateTune = deflateTune;\n*/\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/deflate.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/gzheader.js":
/*!************************************************!*\
  !*** ./node_modules/pako/lib/zlib/gzheader.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\nfunction GZheader() {\n  /* true if compressed data believed to be text */\n  this.text       = 0;\n  /* modification time */\n  this.time       = 0;\n  /* extra flags (not used when writing a gzip file) */\n  this.xflags     = 0;\n  /* operating system */\n  this.os         = 0;\n  /* pointer to extra field or Z_NULL if none */\n  this.extra      = null;\n  /* extra field length (valid if extra != Z_NULL) */\n  this.extra_len  = 0; // Actually, we don't need it in JS,\n                       // but leave for few code modifications\n\n  //\n  // Setup limits is not necessary because in js we should not preallocate memory\n  // for inflate use constant limit in 65536 bytes\n  //\n\n  /* space at extra (only when reading header) */\n  // this.extra_max  = 0;\n  /* pointer to zero-terminated file name or Z_NULL */\n  this.name       = '';\n  /* space at name (only when reading header) */\n  // this.name_max   = 0;\n  /* pointer to zero-terminated comment or Z_NULL */\n  this.comment    = '';\n  /* space at comment (only when reading header) */\n  // this.comm_max   = 0;\n  /* true if there was or will be a header crc */\n  this.hcrc       = 0;\n  /* true when done reading gzip header (not used when writing a gzip file) */\n  this.done       = false;\n}\n\nmodule.exports = GZheader;\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/gzheader.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/inffast.js":
/*!***********************************************!*\
  !*** ./node_modules/pako/lib/zlib/inffast.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\n// See state defs from inflate.js\nvar BAD = 30;       /* got a data error -- remain here until reset */\nvar TYPE = 12;      /* i: waiting for type bits, including last-flag bit */\n\n/*\n   Decode literal, length, and distance codes and write out the resulting\n   literal and match bytes until either not enough input or output is\n   available, an end-of-block is encountered, or a data error is encountered.\n   When large enough input and output buffers are supplied to inflate(), for\n   example, a 16K input buffer and a 64K output buffer, more than 95% of the\n   inflate execution time is spent in this routine.\n\n   Entry assumptions:\n\n        state.mode === LEN\n        strm.avail_in >= 6\n        strm.avail_out >= 258\n        start >= strm.avail_out\n        state.bits < 8\n\n   On return, state.mode is one of:\n\n        LEN -- ran out of enough output space or enough available input\n        TYPE -- reached end of block code, inflate() to interpret next block\n        BAD -- error in block data\n\n   Notes:\n\n    - The maximum input bits used by a length/distance pair is 15 bits for the\n      length code, 5 bits for the length extra, 15 bits for the distance code,\n      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.\n      Therefore if strm.avail_in >= 6, then there is enough input to avoid\n      checking for available input while decoding.\n\n    - The maximum bytes that a single length/distance pair can output is 258\n      bytes, which is the maximum length that can be coded.  inflate_fast()\n      requires strm.avail_out >= 258 for each loop to avoid checking for\n      output space.\n */\nmodule.exports = function inflate_fast(strm, start) {\n  var state;\n  var _in;                    /* local strm.input */\n  var last;                   /* have enough input while in < last */\n  var _out;                   /* local strm.output */\n  var beg;                    /* inflate()'s initial strm.output */\n  var end;                    /* while out < end, enough space available */\n//#ifdef INFLATE_STRICT\n  var dmax;                   /* maximum distance from zlib header */\n//#endif\n  var wsize;                  /* window size or zero if not using window */\n  var whave;                  /* valid bytes in the window */\n  var wnext;                  /* window write index */\n  // Use `s_window` instead `window`, avoid conflict with instrumentation tools\n  var s_window;               /* allocated sliding window, if wsize != 0 */\n  var hold;                   /* local strm.hold */\n  var bits;                   /* local strm.bits */\n  var lcode;                  /* local strm.lencode */\n  var dcode;                  /* local strm.distcode */\n  var lmask;                  /* mask for first level of length codes */\n  var dmask;                  /* mask for first level of distance codes */\n  var here;                   /* retrieved table entry */\n  var op;                     /* code bits, operation, extra bits, or */\n                              /*  window position, window bytes to copy */\n  var len;                    /* match length, unused bytes */\n  var dist;                   /* match distance */\n  var from;                   /* where to copy match from */\n  var from_source;\n\n\n  var input, output; // JS specific, because we have no pointers\n\n  /* copy state to local variables */\n  state = strm.state;\n  //here = state.here;\n  _in = strm.next_in;\n  input = strm.input;\n  last = _in + (strm.avail_in - 5);\n  _out = strm.next_out;\n  output = strm.output;\n  beg = _out - (start - strm.avail_out);\n  end = _out + (strm.avail_out - 257);\n//#ifdef INFLATE_STRICT\n  dmax = state.dmax;\n//#endif\n  wsize = state.wsize;\n  whave = state.whave;\n  wnext = state.wnext;\n  s_window = state.window;\n  hold = state.hold;\n  bits = state.bits;\n  lcode = state.lencode;\n  dcode = state.distcode;\n  lmask = (1 << state.lenbits) - 1;\n  dmask = (1 << state.distbits) - 1;\n\n\n  /* decode literals and length/distances until end-of-block or not enough\n     input data or output space */\n\n  top:\n  do {\n    if (bits < 15) {\n      hold += input[_in++] << bits;\n      bits += 8;\n      hold += input[_in++] << bits;\n      bits += 8;\n    }\n\n    here = lcode[hold & lmask];\n\n    dolen:\n    for (;;) { // Goto emulation\n      op = here >>> 24/*here.bits*/;\n      hold >>>= op;\n      bits -= op;\n      op = (here >>> 16) & 0xff/*here.op*/;\n      if (op === 0) {                          /* literal */\n        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?\n        //        \"inflate:         literal '%c'\\n\" :\n        //        \"inflate:         literal 0x%02x\\n\", here.val));\n        output[_out++] = here & 0xffff/*here.val*/;\n      }\n      else if (op & 16) {                     /* length base */\n        len = here & 0xffff/*here.val*/;\n        op &= 15;                           /* number of extra bits */\n        if (op) {\n          if (bits < op) {\n            hold += input[_in++] << bits;\n            bits += 8;\n          }\n          len += hold & ((1 << op) - 1);\n          hold >>>= op;\n          bits -= op;\n        }\n        //Tracevv((stderr, \"inflate:         length %u\\n\", len));\n        if (bits < 15) {\n          hold += input[_in++] << bits;\n          bits += 8;\n          hold += input[_in++] << bits;\n          bits += 8;\n        }\n        here = dcode[hold & dmask];\n\n        dodist:\n        for (;;) { // goto emulation\n          op = here >>> 24/*here.bits*/;\n          hold >>>= op;\n          bits -= op;\n          op = (here >>> 16) & 0xff/*here.op*/;\n\n          if (op & 16) {                      /* distance base */\n            dist = here & 0xffff/*here.val*/;\n            op &= 15;                       /* number of extra bits */\n            if (bits < op) {\n              hold += input[_in++] << bits;\n              bits += 8;\n              if (bits < op) {\n                hold += input[_in++] << bits;\n                bits += 8;\n              }\n            }\n            dist += hold & ((1 << op) - 1);\n//#ifdef INFLATE_STRICT\n            if (dist > dmax) {\n              strm.msg = 'invalid distance too far back';\n              state.mode = BAD;\n              break top;\n            }\n//#endif\n            hold >>>= op;\n            bits -= op;\n            //Tracevv((stderr, \"inflate:         distance %u\\n\", dist));\n            op = _out - beg;                /* max distance in output */\n            if (dist > op) {                /* see if copy from window */\n              op = dist - op;               /* distance back in window */\n              if (op > whave) {\n                if (state.sane) {\n                  strm.msg = 'invalid distance too far back';\n                  state.mode = BAD;\n                  break top;\n                }\n\n// (!) This block is disabled in zlib defaults,\n// don't enable it for binary compatibility\n//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR\n//                if (len <= op - whave) {\n//                  do {\n//                    output[_out++] = 0;\n//                  } while (--len);\n//                  continue top;\n//                }\n//                len -= op - whave;\n//                do {\n//                  output[_out++] = 0;\n//                } while (--op > whave);\n//                if (op === 0) {\n//                  from = _out - dist;\n//                  do {\n//                    output[_out++] = output[from++];\n//                  } while (--len);\n//                  continue top;\n//                }\n//#endif\n              }\n              from = 0; // window index\n              from_source = s_window;\n              if (wnext === 0) {           /* very common case */\n                from += wsize - op;\n                if (op < len) {         /* some from window */\n                  len -= op;\n                  do {\n                    output[_out++] = s_window[from++];\n                  } while (--op);\n                  from = _out - dist;  /* rest from output */\n                  from_source = output;\n                }\n              }\n              else if (wnext < op) {      /* wrap around window */\n                from += wsize + wnext - op;\n                op -= wnext;\n                if (op < len) {         /* some from end of window */\n                  len -= op;\n                  do {\n                    output[_out++] = s_window[from++];\n                  } while (--op);\n                  from = 0;\n                  if (wnext < len) {  /* some from start of window */\n                    op = wnext;\n                    len -= op;\n                    do {\n                      output[_out++] = s_window[from++];\n                    } while (--op);\n                    from = _out - dist;      /* rest from output */\n                    from_source = output;\n                  }\n                }\n              }\n              else {                      /* contiguous in window */\n                from += wnext - op;\n                if (op < len) {         /* some from window */\n                  len -= op;\n                  do {\n                    output[_out++] = s_window[from++];\n                  } while (--op);\n                  from = _out - dist;  /* rest from output */\n                  from_source = output;\n                }\n              }\n              while (len > 2) {\n                output[_out++] = from_source[from++];\n                output[_out++] = from_source[from++];\n                output[_out++] = from_source[from++];\n                len -= 3;\n              }\n              if (len) {\n                output[_out++] = from_source[from++];\n                if (len > 1) {\n                  output[_out++] = from_source[from++];\n                }\n              }\n            }\n            else {\n              from = _out - dist;          /* copy direct from output */\n              do {                        /* minimum length is three */\n                output[_out++] = output[from++];\n                output[_out++] = output[from++];\n                output[_out++] = output[from++];\n                len -= 3;\n              } while (len > 2);\n              if (len) {\n                output[_out++] = output[from++];\n                if (len > 1) {\n                  output[_out++] = output[from++];\n                }\n              }\n            }\n          }\n          else if ((op & 64) === 0) {          /* 2nd level distance code */\n            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];\n            continue dodist;\n          }\n          else {\n            strm.msg = 'invalid distance code';\n            state.mode = BAD;\n            break top;\n          }\n\n          break; // need to emulate goto via \"continue\"\n        }\n      }\n      else if ((op & 64) === 0) {              /* 2nd level length code */\n        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];\n        continue dolen;\n      }\n      else if (op & 32) {                     /* end-of-block */\n        //Tracevv((stderr, \"inflate:         end of block\\n\"));\n        state.mode = TYPE;\n        break top;\n      }\n      else {\n        strm.msg = 'invalid literal/length code';\n        state.mode = BAD;\n        break top;\n      }\n\n      break; // need to emulate goto via \"continue\"\n    }\n  } while (_in < last && _out < end);\n\n  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */\n  len = bits >> 3;\n  _in -= len;\n  bits -= len << 3;\n  hold &= (1 << bits) - 1;\n\n  /* update state and return */\n  strm.next_in = _in;\n  strm.next_out = _out;\n  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));\n  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));\n  state.hold = hold;\n  state.bits = bits;\n  return;\n};\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/inffast.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/inflate.js":
/*!***********************************************!*\
  !*** ./node_modules/pako/lib/zlib/inflate.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\nvar utils         = __webpack_require__(/*! ../utils/common */ \"./node_modules/pako/lib/utils/common.js\");\nvar adler32       = __webpack_require__(/*! ./adler32 */ \"./node_modules/pako/lib/zlib/adler32.js\");\nvar crc32         = __webpack_require__(/*! ./crc32 */ \"./node_modules/pako/lib/zlib/crc32.js\");\nvar inflate_fast  = __webpack_require__(/*! ./inffast */ \"./node_modules/pako/lib/zlib/inffast.js\");\nvar inflate_table = __webpack_require__(/*! ./inftrees */ \"./node_modules/pako/lib/zlib/inftrees.js\");\n\nvar CODES = 0;\nvar LENS = 1;\nvar DISTS = 2;\n\n/* Public constants ==========================================================*/\n/* ===========================================================================*/\n\n\n/* Allowed flush values; see deflate() and inflate() below for details */\n//var Z_NO_FLUSH      = 0;\n//var Z_PARTIAL_FLUSH = 1;\n//var Z_SYNC_FLUSH    = 2;\n//var Z_FULL_FLUSH    = 3;\nvar Z_FINISH        = 4;\nvar Z_BLOCK         = 5;\nvar Z_TREES         = 6;\n\n\n/* Return codes for the compression/decompression functions. Negative values\n * are errors, positive values are used for special but normal events.\n */\nvar Z_OK            = 0;\nvar Z_STREAM_END    = 1;\nvar Z_NEED_DICT     = 2;\n//var Z_ERRNO         = -1;\nvar Z_STREAM_ERROR  = -2;\nvar Z_DATA_ERROR    = -3;\nvar Z_MEM_ERROR     = -4;\nvar Z_BUF_ERROR     = -5;\n//var Z_VERSION_ERROR = -6;\n\n/* The deflate compression method */\nvar Z_DEFLATED  = 8;\n\n\n/* STATES ====================================================================*/\n/* ===========================================================================*/\n\n\nvar    HEAD = 1;       /* i: waiting for magic header */\nvar    FLAGS = 2;      /* i: waiting for method and flags (gzip) */\nvar    TIME = 3;       /* i: waiting for modification time (gzip) */\nvar    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */\nvar    EXLEN = 5;      /* i: waiting for extra length (gzip) */\nvar    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */\nvar    NAME = 7;       /* i: waiting for end of file name (gzip) */\nvar    COMMENT = 8;    /* i: waiting for end of comment (gzip) */\nvar    HCRC = 9;       /* i: waiting for header crc (gzip) */\nvar    DICTID = 10;    /* i: waiting for dictionary check value */\nvar    DICT = 11;      /* waiting for inflateSetDictionary() call */\nvar        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */\nvar        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */\nvar        STORED = 14;    /* i: waiting for stored size (length and complement) */\nvar        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */\nvar        COPY = 16;      /* i/o: waiting for input or output to copy stored block */\nvar        TABLE = 17;     /* i: waiting for dynamic block table lengths */\nvar        LENLENS = 18;   /* i: waiting for code length code lengths */\nvar        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */\nvar            LEN_ = 20;      /* i: same as LEN below, but only first time in */\nvar            LEN = 21;       /* i: waiting for length/lit/eob code */\nvar            LENEXT = 22;    /* i: waiting for length extra bits */\nvar            DIST = 23;      /* i: waiting for distance code */\nvar            DISTEXT = 24;   /* i: waiting for distance extra bits */\nvar            MATCH = 25;     /* o: waiting for output space to copy string */\nvar            LIT = 26;       /* o: waiting for output space to write literal */\nvar    CHECK = 27;     /* i: waiting for 32-bit check value */\nvar    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */\nvar    DONE = 29;      /* finished check, done -- remain here until reset */\nvar    BAD = 30;       /* got a data error -- remain here until reset */\nvar    MEM = 31;       /* got an inflate() memory error -- remain here until reset */\nvar    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */\n\n/* ===========================================================================*/\n\n\n\nvar ENOUGH_LENS = 852;\nvar ENOUGH_DISTS = 592;\n//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);\n\nvar MAX_WBITS = 15;\n/* 32K LZ77 window */\nvar DEF_WBITS = MAX_WBITS;\n\n\nfunction zswap32(q) {\n  return  (((q >>> 24) & 0xff) +\n          ((q >>> 8) & 0xff00) +\n          ((q & 0xff00) << 8) +\n          ((q & 0xff) << 24));\n}\n\n\nfunction InflateState() {\n  this.mode = 0;             /* current inflate mode */\n  this.last = false;          /* true if processing last block */\n  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */\n  this.havedict = false;      /* true if dictionary provided */\n  this.flags = 0;             /* gzip header method and flags (0 if zlib) */\n  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */\n  this.check = 0;             /* protected copy of check value */\n  this.total = 0;             /* protected copy of output count */\n  // TODO: may be {}\n  this.head = null;           /* where to save gzip header information */\n\n  /* sliding window */\n  this.wbits = 0;             /* log base 2 of requested window size */\n  this.wsize = 0;             /* window size or zero if not using window */\n  this.whave = 0;             /* valid bytes in the window */\n  this.wnext = 0;             /* window write index */\n  this.window = null;         /* allocated sliding window, if needed */\n\n  /* bit accumulator */\n  this.hold = 0;              /* input bit accumulator */\n  this.bits = 0;              /* number of bits in \"in\" */\n\n  /* for string and stored block copying */\n  this.length = 0;            /* literal or length of data to copy */\n  this.offset = 0;            /* distance back to copy string from */\n\n  /* for table and code decoding */\n  this.extra = 0;             /* extra bits needed */\n\n  /* fixed and dynamic code tables */\n  this.lencode = null;          /* starting table for length/literal codes */\n  this.distcode = null;         /* starting table for distance codes */\n  this.lenbits = 0;           /* index bits for lencode */\n  this.distbits = 0;          /* index bits for distcode */\n\n  /* dynamic table building */\n  this.ncode = 0;             /* number of code length code lengths */\n  this.nlen = 0;              /* number of length code lengths */\n  this.ndist = 0;             /* number of distance code lengths */\n  this.have = 0;              /* number of code lengths in lens[] */\n  this.next = null;              /* next available space in codes[] */\n\n  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */\n  this.work = new utils.Buf16(288); /* work area for code table building */\n\n  /*\n   because we don't have pointers in js, we use lencode and distcode directly\n   as buffers so we don't need codes\n  */\n  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */\n  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */\n  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */\n  this.sane = 0;                   /* if false, allow invalid distance too far */\n  this.back = 0;                   /* bits back of last unprocessed length/lit */\n  this.was = 0;                    /* initial length of match */\n}\n\nfunction inflateResetKeep(strm) {\n  var state;\n\n  if (!strm || !strm.state) { return Z_STREAM_ERROR; }\n  state = strm.state;\n  strm.total_in = strm.total_out = state.total = 0;\n  strm.msg = ''; /*Z_NULL*/\n  if (state.wrap) {       /* to support ill-conceived Java test suite */\n    strm.adler = state.wrap & 1;\n  }\n  state.mode = HEAD;\n  state.last = 0;\n  state.havedict = 0;\n  state.dmax = 32768;\n  state.head = null/*Z_NULL*/;\n  state.hold = 0;\n  state.bits = 0;\n  //state.lencode = state.distcode = state.next = state.codes;\n  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);\n  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);\n\n  state.sane = 1;\n  state.back = -1;\n  //Tracev((stderr, \"inflate: reset\\n\"));\n  return Z_OK;\n}\n\nfunction inflateReset(strm) {\n  var state;\n\n  if (!strm || !strm.state) { return Z_STREAM_ERROR; }\n  state = strm.state;\n  state.wsize = 0;\n  state.whave = 0;\n  state.wnext = 0;\n  return inflateResetKeep(strm);\n\n}\n\nfunction inflateReset2(strm, windowBits) {\n  var wrap;\n  var state;\n\n  /* get the state */\n  if (!strm || !strm.state) { return Z_STREAM_ERROR; }\n  state = strm.state;\n\n  /* extract wrap request from windowBits parameter */\n  if (windowBits < 0) {\n    wrap = 0;\n    windowBits = -windowBits;\n  }\n  else {\n    wrap = (windowBits >> 4) + 1;\n    if (windowBits < 48) {\n      windowBits &= 15;\n    }\n  }\n\n  /* set number of window bits, free window if different */\n  if (windowBits && (windowBits < 8 || windowBits > 15)) {\n    return Z_STREAM_ERROR;\n  }\n  if (state.window !== null && state.wbits !== windowBits) {\n    state.window = null;\n  }\n\n  /* update state and reset the rest of it */\n  state.wrap = wrap;\n  state.wbits = windowBits;\n  return inflateReset(strm);\n}\n\nfunction inflateInit2(strm, windowBits) {\n  var ret;\n  var state;\n\n  if (!strm) { return Z_STREAM_ERROR; }\n  //strm.msg = Z_NULL;                 /* in case we return an error */\n\n  state = new InflateState();\n\n  //if (state === Z_NULL) return Z_MEM_ERROR;\n  //Tracev((stderr, \"inflate: allocated\\n\"));\n  strm.state = state;\n  state.window = null/*Z_NULL*/;\n  ret = inflateReset2(strm, windowBits);\n  if (ret !== Z_OK) {\n    strm.state = null/*Z_NULL*/;\n  }\n  return ret;\n}\n\nfunction inflateInit(strm) {\n  return inflateInit2(strm, DEF_WBITS);\n}\n\n\n/*\n Return state with length and distance decoding tables and index sizes set to\n fixed code decoding.  Normally this returns fixed tables from inffixed.h.\n If BUILDFIXED is defined, then instead this routine builds the tables the\n first time it's called, and returns those tables the first time and\n thereafter.  This reduces the size of the code by about 2K bytes, in\n exchange for a little execution time.  However, BUILDFIXED should not be\n used for threaded applications, since the rewriting of the tables and virgin\n may not be thread-safe.\n */\nvar virgin = true;\n\nvar lenfix, distfix; // We have no pointers in JS, so keep tables separate\n\nfunction fixedtables(state) {\n  /* build fixed huffman tables if first call (may not be thread safe) */\n  if (virgin) {\n    var sym;\n\n    lenfix = new utils.Buf32(512);\n    distfix = new utils.Buf32(32);\n\n    /* literal/length table */\n    sym = 0;\n    while (sym < 144) { state.lens[sym++] = 8; }\n    while (sym < 256) { state.lens[sym++] = 9; }\n    while (sym < 280) { state.lens[sym++] = 7; }\n    while (sym < 288) { state.lens[sym++] = 8; }\n\n    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });\n\n    /* distance table */\n    sym = 0;\n    while (sym < 32) { state.lens[sym++] = 5; }\n\n    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });\n\n    /* do this just once */\n    virgin = false;\n  }\n\n  state.lencode = lenfix;\n  state.lenbits = 9;\n  state.distcode = distfix;\n  state.distbits = 5;\n}\n\n\n/*\n Update the window with the last wsize (normally 32K) bytes written before\n returning.  If window does not exist yet, create it.  This is only called\n when a window is already in use, or when output has been written during this\n inflate call, but the end of the deflate stream has not been reached yet.\n It is also called to create a window for dictionary data when a dictionary\n is loaded.\n\n Providing output buffers larger than 32K to inflate() should provide a speed\n advantage, since only the last 32K of output is copied to the sliding window\n upon return from inflate(), and since all distances after the first 32K of\n output will fall in the output data, making match copies simpler and faster.\n The advantage may be dependent on the size of the processor's data caches.\n */\nfunction updatewindow(strm, src, end, copy) {\n  var dist;\n  var state = strm.state;\n\n  /* if it hasn't been done already, allocate space for the window */\n  if (state.window === null) {\n    state.wsize = 1 << state.wbits;\n    state.wnext = 0;\n    state.whave = 0;\n\n    state.window = new utils.Buf8(state.wsize);\n  }\n\n  /* copy state->wsize or less output bytes into the circular window */\n  if (copy >= state.wsize) {\n    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);\n    state.wnext = 0;\n    state.whave = state.wsize;\n  }\n  else {\n    dist = state.wsize - state.wnext;\n    if (dist > copy) {\n      dist = copy;\n    }\n    //zmemcpy(state->window + state->wnext, end - copy, dist);\n    utils.arraySet(state.window, src, end - copy, dist, state.wnext);\n    copy -= dist;\n    if (copy) {\n      //zmemcpy(state->window, end - copy, copy);\n      utils.arraySet(state.window, src, end - copy, copy, 0);\n      state.wnext = copy;\n      state.whave = state.wsize;\n    }\n    else {\n      state.wnext += dist;\n      if (state.wnext === state.wsize) { state.wnext = 0; }\n      if (state.whave < state.wsize) { state.whave += dist; }\n    }\n  }\n  return 0;\n}\n\nfunction inflate(strm, flush) {\n  var state;\n  var input, output;          // input/output buffers\n  var next;                   /* next input INDEX */\n  var put;                    /* next output INDEX */\n  var have, left;             /* available input and output */\n  var hold;                   /* bit buffer */\n  var bits;                   /* bits in bit buffer */\n  var _in, _out;              /* save starting available input and output */\n  var copy;                   /* number of stored or match bytes to copy */\n  var from;                   /* where to copy match bytes from */\n  var from_source;\n  var here = 0;               /* current decoding table entry */\n  var here_bits, here_op, here_val; // paked \"here\" denormalized (JS specific)\n  //var last;                   /* parent table entry */\n  var last_bits, last_op, last_val; // paked \"last\" denormalized (JS specific)\n  var len;                    /* length to copy for repeats, bits to drop */\n  var ret;                    /* return code */\n  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */\n  var opts;\n\n  var n; // temporary var for NEED_BITS\n\n  var order = /* permutation of code lengths */\n    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];\n\n\n  if (!strm || !strm.state || !strm.output ||\n      (!strm.input && strm.avail_in !== 0)) {\n    return Z_STREAM_ERROR;\n  }\n\n  state = strm.state;\n  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */\n\n\n  //--- LOAD() ---\n  put = strm.next_out;\n  output = strm.output;\n  left = strm.avail_out;\n  next = strm.next_in;\n  input = strm.input;\n  have = strm.avail_in;\n  hold = state.hold;\n  bits = state.bits;\n  //---\n\n  _in = have;\n  _out = left;\n  ret = Z_OK;\n\n  inf_leave: // goto emulation\n  for (;;) {\n    switch (state.mode) {\n      case HEAD:\n        if (state.wrap === 0) {\n          state.mode = TYPEDO;\n          break;\n        }\n        //=== NEEDBITS(16);\n        while (bits < 16) {\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */\n          state.check = 0/*crc32(0L, Z_NULL, 0)*/;\n          //=== CRC2(state.check, hold);\n          hbuf[0] = hold & 0xff;\n          hbuf[1] = (hold >>> 8) & 0xff;\n          state.check = crc32(state.check, hbuf, 2, 0);\n          //===//\n\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n          state.mode = FLAGS;\n          break;\n        }\n        state.flags = 0;           /* expect zlib header */\n        if (state.head) {\n          state.head.done = false;\n        }\n        if (!(state.wrap & 1) ||   /* check if zlib header allowed */\n          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {\n          strm.msg = 'incorrect header check';\n          state.mode = BAD;\n          break;\n        }\n        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {\n          strm.msg = 'unknown compression method';\n          state.mode = BAD;\n          break;\n        }\n        //--- DROPBITS(4) ---//\n        hold >>>= 4;\n        bits -= 4;\n        //---//\n        len = (hold & 0x0f)/*BITS(4)*/ + 8;\n        if (state.wbits === 0) {\n          state.wbits = len;\n        }\n        else if (len > state.wbits) {\n          strm.msg = 'invalid window size';\n          state.mode = BAD;\n          break;\n        }\n        state.dmax = 1 << len;\n        //Tracev((stderr, \"inflate:   zlib header ok\\n\"));\n        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;\n        state.mode = hold & 0x200 ? DICTID : TYPE;\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        break;\n      case FLAGS:\n        //=== NEEDBITS(16); */\n        while (bits < 16) {\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        state.flags = hold;\n        if ((state.flags & 0xff) !== Z_DEFLATED) {\n          strm.msg = 'unknown compression method';\n          state.mode = BAD;\n          break;\n        }\n        if (state.flags & 0xe000) {\n          strm.msg = 'unknown header flags set';\n          state.mode = BAD;\n          break;\n        }\n        if (state.head) {\n          state.head.text = ((hold >> 8) & 1);\n        }\n        if (state.flags & 0x0200) {\n          //=== CRC2(state.check, hold);\n          hbuf[0] = hold & 0xff;\n          hbuf[1] = (hold >>> 8) & 0xff;\n          state.check = crc32(state.check, hbuf, 2, 0);\n          //===//\n        }\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = TIME;\n        /* falls through */\n      case TIME:\n        //=== NEEDBITS(32); */\n        while (bits < 32) {\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        if (state.head) {\n          state.head.time = hold;\n        }\n        if (state.flags & 0x0200) {\n          //=== CRC4(state.check, hold)\n          hbuf[0] = hold & 0xff;\n          hbuf[1] = (hold >>> 8) & 0xff;\n          hbuf[2] = (hold >>> 16) & 0xff;\n          hbuf[3] = (hold >>> 24) & 0xff;\n          state.check = crc32(state.check, hbuf, 4, 0);\n          //===\n        }\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = OS;\n        /* falls through */\n      case OS:\n        //=== NEEDBITS(16); */\n        while (bits < 16) {\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        if (state.head) {\n          state.head.xflags = (hold & 0xff);\n          state.head.os = (hold >> 8);\n        }\n        if (state.flags & 0x0200) {\n          //=== CRC2(state.check, hold);\n          hbuf[0] = hold & 0xff;\n          hbuf[1] = (hold >>> 8) & 0xff;\n          state.check = crc32(state.check, hbuf, 2, 0);\n          //===//\n        }\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = EXLEN;\n        /* falls through */\n      case EXLEN:\n        if (state.flags & 0x0400) {\n          //=== NEEDBITS(16); */\n          while (bits < 16) {\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          state.length = hold;\n          if (state.head) {\n            state.head.extra_len = hold;\n          }\n          if (state.flags & 0x0200) {\n            //=== CRC2(state.check, hold);\n            hbuf[0] = hold & 0xff;\n            hbuf[1] = (hold >>> 8) & 0xff;\n            state.check = crc32(state.check, hbuf, 2, 0);\n            //===//\n          }\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n        }\n        else if (state.head) {\n          state.head.extra = null/*Z_NULL*/;\n        }\n        state.mode = EXTRA;\n        /* falls through */\n      case EXTRA:\n        if (state.flags & 0x0400) {\n          copy = state.length;\n          if (copy > have) { copy = have; }\n          if (copy) {\n            if (state.head) {\n              len = state.head.extra_len - state.length;\n              if (!state.head.extra) {\n                // Use untyped array for more convenient processing later\n                state.head.extra = new Array(state.head.extra_len);\n              }\n              utils.arraySet(\n                state.head.extra,\n                input,\n                next,\n                // extra field is limited to 65536 bytes\n                // - no need for additional size check\n                copy,\n                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/\n                len\n              );\n              //zmemcpy(state.head.extra + len, next,\n              //        len + copy > state.head.extra_max ?\n              //        state.head.extra_max - len : copy);\n            }\n            if (state.flags & 0x0200) {\n              state.check = crc32(state.check, input, copy, next);\n            }\n            have -= copy;\n            next += copy;\n            state.length -= copy;\n          }\n          if (state.length) { break inf_leave; }\n        }\n        state.length = 0;\n        state.mode = NAME;\n        /* falls through */\n      case NAME:\n        if (state.flags & 0x0800) {\n          if (have === 0) { break inf_leave; }\n          copy = 0;\n          do {\n            // TODO: 2 or 1 bytes?\n            len = input[next + copy++];\n            /* use constant limit because in js we should not preallocate memory */\n            if (state.head && len &&\n                (state.length < 65536 /*state.head.name_max*/)) {\n              state.head.name += String.fromCharCode(len);\n            }\n          } while (len && copy < have);\n\n          if (state.flags & 0x0200) {\n            state.check = crc32(state.check, input, copy, next);\n          }\n          have -= copy;\n          next += copy;\n          if (len) { break inf_leave; }\n        }\n        else if (state.head) {\n          state.head.name = null;\n        }\n        state.length = 0;\n        state.mode = COMMENT;\n        /* falls through */\n      case COMMENT:\n        if (state.flags & 0x1000) {\n          if (have === 0) { break inf_leave; }\n          copy = 0;\n          do {\n            len = input[next + copy++];\n            /* use constant limit because in js we should not preallocate memory */\n            if (state.head && len &&\n                (state.length < 65536 /*state.head.comm_max*/)) {\n              state.head.comment += String.fromCharCode(len);\n            }\n          } while (len && copy < have);\n          if (state.flags & 0x0200) {\n            state.check = crc32(state.check, input, copy, next);\n          }\n          have -= copy;\n          next += copy;\n          if (len) { break inf_leave; }\n        }\n        else if (state.head) {\n          state.head.comment = null;\n        }\n        state.mode = HCRC;\n        /* falls through */\n      case HCRC:\n        if (state.flags & 0x0200) {\n          //=== NEEDBITS(16); */\n          while (bits < 16) {\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          if (hold !== (state.check & 0xffff)) {\n            strm.msg = 'header crc mismatch';\n            state.mode = BAD;\n            break;\n          }\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n        }\n        if (state.head) {\n          state.head.hcrc = ((state.flags >> 9) & 1);\n          state.head.done = true;\n        }\n        strm.adler = state.check = 0;\n        state.mode = TYPE;\n        break;\n      case DICTID:\n        //=== NEEDBITS(32); */\n        while (bits < 32) {\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        strm.adler = state.check = zswap32(hold);\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = DICT;\n        /* falls through */\n      case DICT:\n        if (state.havedict === 0) {\n          //--- RESTORE() ---\n          strm.next_out = put;\n          strm.avail_out = left;\n          strm.next_in = next;\n          strm.avail_in = have;\n          state.hold = hold;\n          state.bits = bits;\n          //---\n          return Z_NEED_DICT;\n        }\n        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;\n        state.mode = TYPE;\n        /* falls through */\n      case TYPE:\n        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }\n        /* falls through */\n      case TYPEDO:\n        if (state.last) {\n          //--- BYTEBITS() ---//\n          hold >>>= bits & 7;\n          bits -= bits & 7;\n          //---//\n          state.mode = CHECK;\n          break;\n        }\n        //=== NEEDBITS(3); */\n        while (bits < 3) {\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        state.last = (hold & 0x01)/*BITS(1)*/;\n        //--- DROPBITS(1) ---//\n        hold >>>= 1;\n        bits -= 1;\n        //---//\n\n        switch ((hold & 0x03)/*BITS(2)*/) {\n          case 0:                             /* stored block */\n            //Tracev((stderr, \"inflate:     stored block%s\\n\",\n            //        state.last ? \" (last)\" : \"\"));\n            state.mode = STORED;\n            break;\n          case 1:                             /* fixed block */\n            fixedtables(state);\n            //Tracev((stderr, \"inflate:     fixed codes block%s\\n\",\n            //        state.last ? \" (last)\" : \"\"));\n            state.mode = LEN_;             /* decode codes */\n            if (flush === Z_TREES) {\n              //--- DROPBITS(2) ---//\n              hold >>>= 2;\n              bits -= 2;\n              //---//\n              break inf_leave;\n            }\n            break;\n          case 2:                             /* dynamic block */\n            //Tracev((stderr, \"inflate:     dynamic codes block%s\\n\",\n            //        state.last ? \" (last)\" : \"\"));\n            state.mode = TABLE;\n            break;\n          case 3:\n            strm.msg = 'invalid block type';\n            state.mode = BAD;\n        }\n        //--- DROPBITS(2) ---//\n        hold >>>= 2;\n        bits -= 2;\n        //---//\n        break;\n      case STORED:\n        //--- BYTEBITS() ---// /* go to byte boundary */\n        hold >>>= bits & 7;\n        bits -= bits & 7;\n        //---//\n        //=== NEEDBITS(32); */\n        while (bits < 32) {\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {\n          strm.msg = 'invalid stored block lengths';\n          state.mode = BAD;\n          break;\n        }\n        state.length = hold & 0xffff;\n        //Tracev((stderr, \"inflate:       stored length %u\\n\",\n        //        state.length));\n        //=== INITBITS();\n        hold = 0;\n        bits = 0;\n        //===//\n        state.mode = COPY_;\n        if (flush === Z_TREES) { break inf_leave; }\n        /* falls through */\n      case COPY_:\n        state.mode = COPY;\n        /* falls through */\n      case COPY:\n        copy = state.length;\n        if (copy) {\n          if (copy > have) { copy = have; }\n          if (copy > left) { copy = left; }\n          if (copy === 0) { break inf_leave; }\n          //--- zmemcpy(put, next, copy); ---\n          utils.arraySet(output, input, next, copy, put);\n          //---//\n          have -= copy;\n          next += copy;\n          left -= copy;\n          put += copy;\n          state.length -= copy;\n          break;\n        }\n        //Tracev((stderr, \"inflate:       stored end\\n\"));\n        state.mode = TYPE;\n        break;\n      case TABLE:\n        //=== NEEDBITS(14); */\n        while (bits < 14) {\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n        }\n        //===//\n        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;\n        //--- DROPBITS(5) ---//\n        hold >>>= 5;\n        bits -= 5;\n        //---//\n        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;\n        //--- DROPBITS(5) ---//\n        hold >>>= 5;\n        bits -= 5;\n        //---//\n        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;\n        //--- DROPBITS(4) ---//\n        hold >>>= 4;\n        bits -= 4;\n        //---//\n//#ifndef PKZIP_BUG_WORKAROUND\n        if (state.nlen > 286 || state.ndist > 30) {\n          strm.msg = 'too many length or distance symbols';\n          state.mode = BAD;\n          break;\n        }\n//#endif\n        //Tracev((stderr, \"inflate:       table sizes ok\\n\"));\n        state.have = 0;\n        state.mode = LENLENS;\n        /* falls through */\n      case LENLENS:\n        while (state.have < state.ncode) {\n          //=== NEEDBITS(3);\n          while (bits < 3) {\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);\n          //--- DROPBITS(3) ---//\n          hold >>>= 3;\n          bits -= 3;\n          //---//\n        }\n        while (state.have < 19) {\n          state.lens[order[state.have++]] = 0;\n        }\n        // We have separate tables & no pointers. 2 commented lines below not needed.\n        //state.next = state.codes;\n        //state.lencode = state.next;\n        // Switch to use dynamic table\n        state.lencode = state.lendyn;\n        state.lenbits = 7;\n\n        opts = { bits: state.lenbits };\n        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);\n        state.lenbits = opts.bits;\n\n        if (ret) {\n          strm.msg = 'invalid code lengths set';\n          state.mode = BAD;\n          break;\n        }\n        //Tracev((stderr, \"inflate:       code lengths ok\\n\"));\n        state.have = 0;\n        state.mode = CODELENS;\n        /* falls through */\n      case CODELENS:\n        while (state.have < state.nlen + state.ndist) {\n          for (;;) {\n            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/\n            here_bits = here >>> 24;\n            here_op = (here >>> 16) & 0xff;\n            here_val = here & 0xffff;\n\n            if ((here_bits) <= bits) { break; }\n            //--- PULLBYTE() ---//\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n            //---//\n          }\n          if (here_val < 16) {\n            //--- DROPBITS(here.bits) ---//\n            hold >>>= here_bits;\n            bits -= here_bits;\n            //---//\n            state.lens[state.have++] = here_val;\n          }\n          else {\n            if (here_val === 16) {\n              //=== NEEDBITS(here.bits + 2);\n              n = here_bits + 2;\n              while (bits < n) {\n                if (have === 0) { break inf_leave; }\n                have--;\n                hold += input[next++] << bits;\n                bits += 8;\n              }\n              //===//\n              //--- DROPBITS(here.bits) ---//\n              hold >>>= here_bits;\n              bits -= here_bits;\n              //---//\n              if (state.have === 0) {\n                strm.msg = 'invalid bit length repeat';\n                state.mode = BAD;\n                break;\n              }\n              len = state.lens[state.have - 1];\n              copy = 3 + (hold & 0x03);//BITS(2);\n              //--- DROPBITS(2) ---//\n              hold >>>= 2;\n              bits -= 2;\n              //---//\n            }\n            else if (here_val === 17) {\n              //=== NEEDBITS(here.bits + 3);\n              n = here_bits + 3;\n              while (bits < n) {\n                if (have === 0) { break inf_leave; }\n                have--;\n                hold += input[next++] << bits;\n                bits += 8;\n              }\n              //===//\n              //--- DROPBITS(here.bits) ---//\n              hold >>>= here_bits;\n              bits -= here_bits;\n              //---//\n              len = 0;\n              copy = 3 + (hold & 0x07);//BITS(3);\n              //--- DROPBITS(3) ---//\n              hold >>>= 3;\n              bits -= 3;\n              //---//\n            }\n            else {\n              //=== NEEDBITS(here.bits + 7);\n              n = here_bits + 7;\n              while (bits < n) {\n                if (have === 0) { break inf_leave; }\n                have--;\n                hold += input[next++] << bits;\n                bits += 8;\n              }\n              //===//\n              //--- DROPBITS(here.bits) ---//\n              hold >>>= here_bits;\n              bits -= here_bits;\n              //---//\n              len = 0;\n              copy = 11 + (hold & 0x7f);//BITS(7);\n              //--- DROPBITS(7) ---//\n              hold >>>= 7;\n              bits -= 7;\n              //---//\n            }\n            if (state.have + copy > state.nlen + state.ndist) {\n              strm.msg = 'invalid bit length repeat';\n              state.mode = BAD;\n              break;\n            }\n            while (copy--) {\n              state.lens[state.have++] = len;\n            }\n          }\n        }\n\n        /* handle error breaks in while */\n        if (state.mode === BAD) { break; }\n\n        /* check for end-of-block code (better have one) */\n        if (state.lens[256] === 0) {\n          strm.msg = 'invalid code -- missing end-of-block';\n          state.mode = BAD;\n          break;\n        }\n\n        /* build code tables -- note: do not change the lenbits or distbits\n           values here (9 and 6) without reading the comments in inftrees.h\n           concerning the ENOUGH constants, which depend on those values */\n        state.lenbits = 9;\n\n        opts = { bits: state.lenbits };\n        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);\n        // We have separate tables & no pointers. 2 commented lines below not needed.\n        // state.next_index = opts.table_index;\n        state.lenbits = opts.bits;\n        // state.lencode = state.next;\n\n        if (ret) {\n          strm.msg = 'invalid literal/lengths set';\n          state.mode = BAD;\n          break;\n        }\n\n        state.distbits = 6;\n        //state.distcode.copy(state.codes);\n        // Switch to use dynamic table\n        state.distcode = state.distdyn;\n        opts = { bits: state.distbits };\n        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);\n        // We have separate tables & no pointers. 2 commented lines below not needed.\n        // state.next_index = opts.table_index;\n        state.distbits = opts.bits;\n        // state.distcode = state.next;\n\n        if (ret) {\n          strm.msg = 'invalid distances set';\n          state.mode = BAD;\n          break;\n        }\n        //Tracev((stderr, 'inflate:       codes ok\\n'));\n        state.mode = LEN_;\n        if (flush === Z_TREES) { break inf_leave; }\n        /* falls through */\n      case LEN_:\n        state.mode = LEN;\n        /* falls through */\n      case LEN:\n        if (have >= 6 && left >= 258) {\n          //--- RESTORE() ---\n          strm.next_out = put;\n          strm.avail_out = left;\n          strm.next_in = next;\n          strm.avail_in = have;\n          state.hold = hold;\n          state.bits = bits;\n          //---\n          inflate_fast(strm, _out);\n          //--- LOAD() ---\n          put = strm.next_out;\n          output = strm.output;\n          left = strm.avail_out;\n          next = strm.next_in;\n          input = strm.input;\n          have = strm.avail_in;\n          hold = state.hold;\n          bits = state.bits;\n          //---\n\n          if (state.mode === TYPE) {\n            state.back = -1;\n          }\n          break;\n        }\n        state.back = 0;\n        for (;;) {\n          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/\n          here_bits = here >>> 24;\n          here_op = (here >>> 16) & 0xff;\n          here_val = here & 0xffff;\n\n          if (here_bits <= bits) { break; }\n          //--- PULLBYTE() ---//\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n          //---//\n        }\n        if (here_op && (here_op & 0xf0) === 0) {\n          last_bits = here_bits;\n          last_op = here_op;\n          last_val = here_val;\n          for (;;) {\n            here = state.lencode[last_val +\n                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];\n            here_bits = here >>> 24;\n            here_op = (here >>> 16) & 0xff;\n            here_val = here & 0xffff;\n\n            if ((last_bits + here_bits) <= bits) { break; }\n            //--- PULLBYTE() ---//\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n            //---//\n          }\n          //--- DROPBITS(last.bits) ---//\n          hold >>>= last_bits;\n          bits -= last_bits;\n          //---//\n          state.back += last_bits;\n        }\n        //--- DROPBITS(here.bits) ---//\n        hold >>>= here_bits;\n        bits -= here_bits;\n        //---//\n        state.back += here_bits;\n        state.length = here_val;\n        if (here_op === 0) {\n          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?\n          //        \"inflate:         literal '%c'\\n\" :\n          //        \"inflate:         literal 0x%02x\\n\", here.val));\n          state.mode = LIT;\n          break;\n        }\n        if (here_op & 32) {\n          //Tracevv((stderr, \"inflate:         end of block\\n\"));\n          state.back = -1;\n          state.mode = TYPE;\n          break;\n        }\n        if (here_op & 64) {\n          strm.msg = 'invalid literal/length code';\n          state.mode = BAD;\n          break;\n        }\n        state.extra = here_op & 15;\n        state.mode = LENEXT;\n        /* falls through */\n      case LENEXT:\n        if (state.extra) {\n          //=== NEEDBITS(state.extra);\n          n = state.extra;\n          while (bits < n) {\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;\n          //--- DROPBITS(state.extra) ---//\n          hold >>>= state.extra;\n          bits -= state.extra;\n          //---//\n          state.back += state.extra;\n        }\n        //Tracevv((stderr, \"inflate:         length %u\\n\", state.length));\n        state.was = state.length;\n        state.mode = DIST;\n        /* falls through */\n      case DIST:\n        for (;;) {\n          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/\n          here_bits = here >>> 24;\n          here_op = (here >>> 16) & 0xff;\n          here_val = here & 0xffff;\n\n          if ((here_bits) <= bits) { break; }\n          //--- PULLBYTE() ---//\n          if (have === 0) { break inf_leave; }\n          have--;\n          hold += input[next++] << bits;\n          bits += 8;\n          //---//\n        }\n        if ((here_op & 0xf0) === 0) {\n          last_bits = here_bits;\n          last_op = here_op;\n          last_val = here_val;\n          for (;;) {\n            here = state.distcode[last_val +\n                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];\n            here_bits = here >>> 24;\n            here_op = (here >>> 16) & 0xff;\n            here_val = here & 0xffff;\n\n            if ((last_bits + here_bits) <= bits) { break; }\n            //--- PULLBYTE() ---//\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n            //---//\n          }\n          //--- DROPBITS(last.bits) ---//\n          hold >>>= last_bits;\n          bits -= last_bits;\n          //---//\n          state.back += last_bits;\n        }\n        //--- DROPBITS(here.bits) ---//\n        hold >>>= here_bits;\n        bits -= here_bits;\n        //---//\n        state.back += here_bits;\n        if (here_op & 64) {\n          strm.msg = 'invalid distance code';\n          state.mode = BAD;\n          break;\n        }\n        state.offset = here_val;\n        state.extra = (here_op) & 15;\n        state.mode = DISTEXT;\n        /* falls through */\n      case DISTEXT:\n        if (state.extra) {\n          //=== NEEDBITS(state.extra);\n          n = state.extra;\n          while (bits < n) {\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;\n          //--- DROPBITS(state.extra) ---//\n          hold >>>= state.extra;\n          bits -= state.extra;\n          //---//\n          state.back += state.extra;\n        }\n//#ifdef INFLATE_STRICT\n        if (state.offset > state.dmax) {\n          strm.msg = 'invalid distance too far back';\n          state.mode = BAD;\n          break;\n        }\n//#endif\n        //Tracevv((stderr, \"inflate:         distance %u\\n\", state.offset));\n        state.mode = MATCH;\n        /* falls through */\n      case MATCH:\n        if (left === 0) { break inf_leave; }\n        copy = _out - left;\n        if (state.offset > copy) {         /* copy from window */\n          copy = state.offset - copy;\n          if (copy > state.whave) {\n            if (state.sane) {\n              strm.msg = 'invalid distance too far back';\n              state.mode = BAD;\n              break;\n            }\n// (!) This block is disabled in zlib defaults,\n// don't enable it for binary compatibility\n//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR\n//          Trace((stderr, \"inflate.c too far\\n\"));\n//          copy -= state.whave;\n//          if (copy > state.length) { copy = state.length; }\n//          if (copy > left) { copy = left; }\n//          left -= copy;\n//          state.length -= copy;\n//          do {\n//            output[put++] = 0;\n//          } while (--copy);\n//          if (state.length === 0) { state.mode = LEN; }\n//          break;\n//#endif\n          }\n          if (copy > state.wnext) {\n            copy -= state.wnext;\n            from = state.wsize - copy;\n          }\n          else {\n            from = state.wnext - copy;\n          }\n          if (copy > state.length) { copy = state.length; }\n          from_source = state.window;\n        }\n        else {                              /* copy from output */\n          from_source = output;\n          from = put - state.offset;\n          copy = state.length;\n        }\n        if (copy > left) { copy = left; }\n        left -= copy;\n        state.length -= copy;\n        do {\n          output[put++] = from_source[from++];\n        } while (--copy);\n        if (state.length === 0) { state.mode = LEN; }\n        break;\n      case LIT:\n        if (left === 0) { break inf_leave; }\n        output[put++] = state.length;\n        left--;\n        state.mode = LEN;\n        break;\n      case CHECK:\n        if (state.wrap) {\n          //=== NEEDBITS(32);\n          while (bits < 32) {\n            if (have === 0) { break inf_leave; }\n            have--;\n            // Use '|' instead of '+' to make sure that result is signed\n            hold |= input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          _out -= left;\n          strm.total_out += _out;\n          state.total += _out;\n          if (_out) {\n            strm.adler = state.check =\n                /*UPDATE(state.check, put - _out, _out);*/\n                (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));\n\n          }\n          _out = left;\n          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too\n          if ((state.flags ? hold : zswap32(hold)) !== state.check) {\n            strm.msg = 'incorrect data check';\n            state.mode = BAD;\n            break;\n          }\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n          //Tracev((stderr, \"inflate:   check matches trailer\\n\"));\n        }\n        state.mode = LENGTH;\n        /* falls through */\n      case LENGTH:\n        if (state.wrap && state.flags) {\n          //=== NEEDBITS(32);\n          while (bits < 32) {\n            if (have === 0) { break inf_leave; }\n            have--;\n            hold += input[next++] << bits;\n            bits += 8;\n          }\n          //===//\n          if (hold !== (state.total & 0xffffffff)) {\n            strm.msg = 'incorrect length check';\n            state.mode = BAD;\n            break;\n          }\n          //=== INITBITS();\n          hold = 0;\n          bits = 0;\n          //===//\n          //Tracev((stderr, \"inflate:   length matches trailer\\n\"));\n        }\n        state.mode = DONE;\n        /* falls through */\n      case DONE:\n        ret = Z_STREAM_END;\n        break inf_leave;\n      case BAD:\n        ret = Z_DATA_ERROR;\n        break inf_leave;\n      case MEM:\n        return Z_MEM_ERROR;\n      case SYNC:\n        /* falls through */\n      default:\n        return Z_STREAM_ERROR;\n    }\n  }\n\n  // inf_leave <- here is real place for \"goto inf_leave\", emulated via \"break inf_leave\"\n\n  /*\n     Return from inflate(), updating the total counts and the check value.\n     If there was no progress during the inflate() call, return a buffer\n     error.  Call updatewindow() to create and/or update the window state.\n     Note: a memory error from inflate() is non-recoverable.\n   */\n\n  //--- RESTORE() ---\n  strm.next_out = put;\n  strm.avail_out = left;\n  strm.next_in = next;\n  strm.avail_in = have;\n  state.hold = hold;\n  state.bits = bits;\n  //---\n\n  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&\n                      (state.mode < CHECK || flush !== Z_FINISH))) {\n    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {\n      state.mode = MEM;\n      return Z_MEM_ERROR;\n    }\n  }\n  _in -= strm.avail_in;\n  _out -= strm.avail_out;\n  strm.total_in += _in;\n  strm.total_out += _out;\n  state.total += _out;\n  if (state.wrap && _out) {\n    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/\n      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));\n  }\n  strm.data_type = state.bits + (state.last ? 64 : 0) +\n                    (state.mode === TYPE ? 128 : 0) +\n                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);\n  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {\n    ret = Z_BUF_ERROR;\n  }\n  return ret;\n}\n\nfunction inflateEnd(strm) {\n\n  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {\n    return Z_STREAM_ERROR;\n  }\n\n  var state = strm.state;\n  if (state.window) {\n    state.window = null;\n  }\n  strm.state = null;\n  return Z_OK;\n}\n\nfunction inflateGetHeader(strm, head) {\n  var state;\n\n  /* check state */\n  if (!strm || !strm.state) { return Z_STREAM_ERROR; }\n  state = strm.state;\n  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }\n\n  /* save header structure */\n  state.head = head;\n  head.done = false;\n  return Z_OK;\n}\n\nfunction inflateSetDictionary(strm, dictionary) {\n  var dictLength = dictionary.length;\n\n  var state;\n  var dictid;\n  var ret;\n\n  /* check state */\n  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR; }\n  state = strm.state;\n\n  if (state.wrap !== 0 && state.mode !== DICT) {\n    return Z_STREAM_ERROR;\n  }\n\n  /* check for correct dictionary identifier */\n  if (state.mode === DICT) {\n    dictid = 1; /* adler32(0, null, 0)*/\n    /* dictid = adler32(dictid, dictionary, dictLength); */\n    dictid = adler32(dictid, dictionary, dictLength, 0);\n    if (dictid !== state.check) {\n      return Z_DATA_ERROR;\n    }\n  }\n  /* copy dictionary to window using updatewindow(), which will amend the\n   existing dictionary if appropriate */\n  ret = updatewindow(strm, dictionary, dictLength, dictLength);\n  if (ret) {\n    state.mode = MEM;\n    return Z_MEM_ERROR;\n  }\n  state.havedict = 1;\n  // Tracev((stderr, \"inflate:   dictionary set\\n\"));\n  return Z_OK;\n}\n\nexports.inflateReset = inflateReset;\nexports.inflateReset2 = inflateReset2;\nexports.inflateResetKeep = inflateResetKeep;\nexports.inflateInit = inflateInit;\nexports.inflateInit2 = inflateInit2;\nexports.inflate = inflate;\nexports.inflateEnd = inflateEnd;\nexports.inflateGetHeader = inflateGetHeader;\nexports.inflateSetDictionary = inflateSetDictionary;\nexports.inflateInfo = 'pako inflate (from Nodeca project)';\n\n/* Not implemented\nexports.inflateCopy = inflateCopy;\nexports.inflateGetDictionary = inflateGetDictionary;\nexports.inflateMark = inflateMark;\nexports.inflatePrime = inflatePrime;\nexports.inflateSync = inflateSync;\nexports.inflateSyncPoint = inflateSyncPoint;\nexports.inflateUndermine = inflateUndermine;\n*/\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/inflate.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/inftrees.js":
/*!************************************************!*\
  !*** ./node_modules/pako/lib/zlib/inftrees.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\nvar utils = __webpack_require__(/*! ../utils/common */ \"./node_modules/pako/lib/utils/common.js\");\n\nvar MAXBITS = 15;\nvar ENOUGH_LENS = 852;\nvar ENOUGH_DISTS = 592;\n//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);\n\nvar CODES = 0;\nvar LENS = 1;\nvar DISTS = 2;\n\nvar lbase = [ /* Length codes 257..285 base */\n  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,\n  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0\n];\n\nvar lext = [ /* Length codes 257..285 extra */\n  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,\n  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78\n];\n\nvar dbase = [ /* Distance codes 0..29 base */\n  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,\n  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,\n  8193, 12289, 16385, 24577, 0, 0\n];\n\nvar dext = [ /* Distance codes 0..29 extra */\n  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,\n  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,\n  28, 28, 29, 29, 64, 64\n];\n\nmodule.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)\n{\n  var bits = opts.bits;\n      //here = opts.here; /* table entry for duplication */\n\n  var len = 0;               /* a code's length in bits */\n  var sym = 0;               /* index of code symbols */\n  var min = 0, max = 0;          /* minimum and maximum code lengths */\n  var root = 0;              /* number of index bits for root table */\n  var curr = 0;              /* number of index bits for current table */\n  var drop = 0;              /* code bits to drop for sub-table */\n  var left = 0;                   /* number of prefix codes available */\n  var used = 0;              /* code entries in table used */\n  var huff = 0;              /* Huffman code */\n  var incr;              /* for incrementing code, index */\n  var fill;              /* index for replicating entries */\n  var low;               /* low bits for current root entry */\n  var mask;              /* mask for low root bits */\n  var next;             /* next available space in table */\n  var base = null;     /* base value table to use */\n  var base_index = 0;\n//  var shoextra;    /* extra bits table to use */\n  var end;                    /* use base and extra for symbol > end */\n  var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */\n  var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */\n  var extra = null;\n  var extra_index = 0;\n\n  var here_bits, here_op, here_val;\n\n  /*\n   Process a set of code lengths to create a canonical Huffman code.  The\n   code lengths are lens[0..codes-1].  Each length corresponds to the\n   symbols 0..codes-1.  The Huffman code is generated by first sorting the\n   symbols by length from short to long, and retaining the symbol order\n   for codes with equal lengths.  Then the code starts with all zero bits\n   for the first code of the shortest length, and the codes are integer\n   increments for the same length, and zeros are appended as the length\n   increases.  For the deflate format, these bits are stored backwards\n   from their more natural integer increment ordering, and so when the\n   decoding tables are built in the large loop below, the integer codes\n   are incremented backwards.\n\n   This routine assumes, but does not check, that all of the entries in\n   lens[] are in the range 0..MAXBITS.  The caller must assure this.\n   1..MAXBITS is interpreted as that code length.  zero means that that\n   symbol does not occur in this code.\n\n   The codes are sorted by computing a count of codes for each length,\n   creating from that a table of starting indices for each length in the\n   sorted table, and then entering the symbols in order in the sorted\n   table.  The sorted table is work[], with that space being provided by\n   the caller.\n\n   The length counts are used for other purposes as well, i.e. finding\n   the minimum and maximum length codes, determining if there are any\n   codes at all, checking for a valid set of lengths, and looking ahead\n   at length counts to determine sub-table sizes when building the\n   decoding tables.\n   */\n\n  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */\n  for (len = 0; len <= MAXBITS; len++) {\n    count[len] = 0;\n  }\n  for (sym = 0; sym < codes; sym++) {\n    count[lens[lens_index + sym]]++;\n  }\n\n  /* bound code lengths, force root to be within code lengths */\n  root = bits;\n  for (max = MAXBITS; max >= 1; max--) {\n    if (count[max] !== 0) { break; }\n  }\n  if (root > max) {\n    root = max;\n  }\n  if (max === 0) {                     /* no symbols to code at all */\n    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */\n    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;\n    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;\n    table[table_index++] = (1 << 24) | (64 << 16) | 0;\n\n\n    //table.op[opts.table_index] = 64;\n    //table.bits[opts.table_index] = 1;\n    //table.val[opts.table_index++] = 0;\n    table[table_index++] = (1 << 24) | (64 << 16) | 0;\n\n    opts.bits = 1;\n    return 0;     /* no symbols, but wait for decoding to report error */\n  }\n  for (min = 1; min < max; min++) {\n    if (count[min] !== 0) { break; }\n  }\n  if (root < min) {\n    root = min;\n  }\n\n  /* check for an over-subscribed or incomplete set of lengths */\n  left = 1;\n  for (len = 1; len <= MAXBITS; len++) {\n    left <<= 1;\n    left -= count[len];\n    if (left < 0) {\n      return -1;\n    }        /* over-subscribed */\n  }\n  if (left > 0 && (type === CODES || max !== 1)) {\n    return -1;                      /* incomplete set */\n  }\n\n  /* generate offsets into symbol table for each length for sorting */\n  offs[1] = 0;\n  for (len = 1; len < MAXBITS; len++) {\n    offs[len + 1] = offs[len] + count[len];\n  }\n\n  /* sort symbols by length, by symbol order within each length */\n  for (sym = 0; sym < codes; sym++) {\n    if (lens[lens_index + sym] !== 0) {\n      work[offs[lens[lens_index + sym]]++] = sym;\n    }\n  }\n\n  /*\n   Create and fill in decoding tables.  In this loop, the table being\n   filled is at next and has curr index bits.  The code being used is huff\n   with length len.  That code is converted to an index by dropping drop\n   bits off of the bottom.  For codes where len is less than drop + curr,\n   those top drop + curr - len bits are incremented through all values to\n   fill the table with replicated entries.\n\n   root is the number of index bits for the root table.  When len exceeds\n   root, sub-tables are created pointed to by the root entry with an index\n   of the low root bits of huff.  This is saved in low to check for when a\n   new sub-table should be started.  drop is zero when the root table is\n   being filled, and drop is root when sub-tables are being filled.\n\n   When a new sub-table is needed, it is necessary to look ahead in the\n   code lengths to determine what size sub-table is needed.  The length\n   counts are used for this, and so count[] is decremented as codes are\n   entered in the tables.\n\n   used keeps track of how many table entries have been allocated from the\n   provided *table space.  It is checked for LENS and DIST tables against\n   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in\n   the initial root table size constants.  See the comments in inftrees.h\n   for more information.\n\n   sym increments through all symbols, and the loop terminates when\n   all codes of length max, i.e. all codes, have been processed.  This\n   routine permits incomplete codes, so another loop after this one fills\n   in the rest of the decoding tables with invalid code markers.\n   */\n\n  /* set up for code type */\n  // poor man optimization - use if-else instead of switch,\n  // to avoid deopts in old v8\n  if (type === CODES) {\n    base = extra = work;    /* dummy value--not used */\n    end = 19;\n\n  } else if (type === LENS) {\n    base = lbase;\n    base_index -= 257;\n    extra = lext;\n    extra_index -= 257;\n    end = 256;\n\n  } else {                    /* DISTS */\n    base = dbase;\n    extra = dext;\n    end = -1;\n  }\n\n  /* initialize opts for loop */\n  huff = 0;                   /* starting code */\n  sym = 0;                    /* starting code symbol */\n  len = min;                  /* starting code length */\n  next = table_index;              /* current table to fill in */\n  curr = root;                /* current table index bits */\n  drop = 0;                   /* current bits to drop from code for index */\n  low = -1;                   /* trigger new sub-table when len > root */\n  used = 1 << root;          /* use root table entries */\n  mask = used - 1;            /* mask for comparing low */\n\n  /* check available table space */\n  if ((type === LENS && used > ENOUGH_LENS) ||\n    (type === DISTS && used > ENOUGH_DISTS)) {\n    return 1;\n  }\n\n  /* process all codes and make table entries */\n  for (;;) {\n    /* create table entry */\n    here_bits = len - drop;\n    if (work[sym] < end) {\n      here_op = 0;\n      here_val = work[sym];\n    }\n    else if (work[sym] > end) {\n      here_op = extra[extra_index + work[sym]];\n      here_val = base[base_index + work[sym]];\n    }\n    else {\n      here_op = 32 + 64;         /* end of block */\n      here_val = 0;\n    }\n\n    /* replicate for those indices with low len bits equal to huff */\n    incr = 1 << (len - drop);\n    fill = 1 << curr;\n    min = fill;                 /* save offset to next table */\n    do {\n      fill -= incr;\n      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;\n    } while (fill !== 0);\n\n    /* backwards increment the len-bit code huff */\n    incr = 1 << (len - 1);\n    while (huff & incr) {\n      incr >>= 1;\n    }\n    if (incr !== 0) {\n      huff &= incr - 1;\n      huff += incr;\n    } else {\n      huff = 0;\n    }\n\n    /* go to next symbol, update count, len */\n    sym++;\n    if (--count[len] === 0) {\n      if (len === max) { break; }\n      len = lens[lens_index + work[sym]];\n    }\n\n    /* create new sub-table if needed */\n    if (len > root && (huff & mask) !== low) {\n      /* if first time, transition to sub-tables */\n      if (drop === 0) {\n        drop = root;\n      }\n\n      /* increment past last table */\n      next += min;            /* here min is 1 << curr */\n\n      /* determine length of next table */\n      curr = len - drop;\n      left = 1 << curr;\n      while (curr + drop < max) {\n        left -= count[curr + drop];\n        if (left <= 0) { break; }\n        curr++;\n        left <<= 1;\n      }\n\n      /* check for enough space */\n      used += 1 << curr;\n      if ((type === LENS && used > ENOUGH_LENS) ||\n        (type === DISTS && used > ENOUGH_DISTS)) {\n        return 1;\n      }\n\n      /* point entry in root table to sub-table */\n      low = huff & mask;\n      /*table.op[low] = curr;\n      table.bits[low] = root;\n      table.val[low] = next - opts.table_index;*/\n      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;\n    }\n  }\n\n  /* fill in remaining table entry if code is incomplete (guaranteed to have\n   at most one remaining entry, since if the code is incomplete, the\n   maximum code length that was allowed to get this far is one bit) */\n  if (huff !== 0) {\n    //table.op[next + huff] = 64;            /* invalid code marker */\n    //table.bits[next + huff] = len - drop;\n    //table.val[next + huff] = 0;\n    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;\n  }\n\n  /* set return parameters */\n  //opts.table_index += used;\n  opts.bits = root;\n  return 0;\n};\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/inftrees.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/messages.js":
/*!************************************************!*\
  !*** ./node_modules/pako/lib/zlib/messages.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\nmodule.exports = {\n  2:      'need dictionary',     /* Z_NEED_DICT       2  */\n  1:      'stream end',          /* Z_STREAM_END      1  */\n  0:      '',                    /* Z_OK              0  */\n  '-1':   'file error',          /* Z_ERRNO         (-1) */\n  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */\n  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */\n  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */\n  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */\n  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */\n};\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/messages.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/trees.js":
/*!*********************************************!*\
  !*** ./node_modules/pako/lib/zlib/trees.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\n/* eslint-disable space-unary-ops */\n\nvar utils = __webpack_require__(/*! ../utils/common */ \"./node_modules/pako/lib/utils/common.js\");\n\n/* Public constants ==========================================================*/\n/* ===========================================================================*/\n\n\n//var Z_FILTERED          = 1;\n//var Z_HUFFMAN_ONLY      = 2;\n//var Z_RLE               = 3;\nvar Z_FIXED               = 4;\n//var Z_DEFAULT_STRATEGY  = 0;\n\n/* Possible values of the data_type field (though see inflate()) */\nvar Z_BINARY              = 0;\nvar Z_TEXT                = 1;\n//var Z_ASCII             = 1; // = Z_TEXT\nvar Z_UNKNOWN             = 2;\n\n/*============================================================================*/\n\n\nfunction zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }\n\n// From zutil.h\n\nvar STORED_BLOCK = 0;\nvar STATIC_TREES = 1;\nvar DYN_TREES    = 2;\n/* The three kinds of block type */\n\nvar MIN_MATCH    = 3;\nvar MAX_MATCH    = 258;\n/* The minimum and maximum match lengths */\n\n// From deflate.h\n/* ===========================================================================\n * Internal compression state.\n */\n\nvar LENGTH_CODES  = 29;\n/* number of length codes, not counting the special END_BLOCK code */\n\nvar LITERALS      = 256;\n/* number of literal bytes 0..255 */\n\nvar L_CODES       = LITERALS + 1 + LENGTH_CODES;\n/* number of Literal or Length codes, including the END_BLOCK code */\n\nvar D_CODES       = 30;\n/* number of distance codes */\n\nvar BL_CODES      = 19;\n/* number of codes used to transfer the bit lengths */\n\nvar HEAP_SIZE     = 2 * L_CODES + 1;\n/* maximum heap size */\n\nvar MAX_BITS      = 15;\n/* All codes must not exceed MAX_BITS bits */\n\nvar Buf_size      = 16;\n/* size of bit buffer in bi_buf */\n\n\n/* ===========================================================================\n * Constants\n */\n\nvar MAX_BL_BITS = 7;\n/* Bit length codes must not exceed MAX_BL_BITS bits */\n\nvar END_BLOCK   = 256;\n/* end of block literal code */\n\nvar REP_3_6     = 16;\n/* repeat previous bit length 3-6 times (2 bits of repeat count) */\n\nvar REPZ_3_10   = 17;\n/* repeat a zero length 3-10 times  (3 bits of repeat count) */\n\nvar REPZ_11_138 = 18;\n/* repeat a zero length 11-138 times  (7 bits of repeat count) */\n\n/* eslint-disable comma-spacing,array-bracket-spacing */\nvar extra_lbits =   /* extra bits for each length code */\n  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];\n\nvar extra_dbits =   /* extra bits for each distance code */\n  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];\n\nvar extra_blbits =  /* extra bits for each bit length code */\n  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];\n\nvar bl_order =\n  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];\n/* eslint-enable comma-spacing,array-bracket-spacing */\n\n/* The lengths of the bit length codes are sent in order of decreasing\n * probability, to avoid transmitting the lengths for unused bit length codes.\n */\n\n/* ===========================================================================\n * Local data. These are initialized only once.\n */\n\n// We pre-fill arrays with 0 to avoid uninitialized gaps\n\nvar DIST_CODE_LEN = 512; /* see definition of array dist_code below */\n\n// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1\nvar static_ltree  = new Array((L_CODES + 2) * 2);\nzero(static_ltree);\n/* The static literal tree. Since the bit lengths are imposed, there is no\n * need for the L_CODES extra codes used during heap construction. However\n * The codes 286 and 287 are needed to build a canonical tree (see _tr_init\n * below).\n */\n\nvar static_dtree  = new Array(D_CODES * 2);\nzero(static_dtree);\n/* The static distance tree. (Actually a trivial tree since all codes use\n * 5 bits.)\n */\n\nvar _dist_code    = new Array(DIST_CODE_LEN);\nzero(_dist_code);\n/* Distance codes. The first 256 values correspond to the distances\n * 3 .. 258, the last 256 values correspond to the top 8 bits of\n * the 15 bit distances.\n */\n\nvar _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);\nzero(_length_code);\n/* length code for each normalized match length (0 == MIN_MATCH) */\n\nvar base_length   = new Array(LENGTH_CODES);\nzero(base_length);\n/* First normalized length for each code (0 = MIN_MATCH) */\n\nvar base_dist     = new Array(D_CODES);\nzero(base_dist);\n/* First normalized distance for each code (0 = distance of 1) */\n\n\nfunction StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {\n\n  this.static_tree  = static_tree;  /* static tree or NULL */\n  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */\n  this.extra_base   = extra_base;   /* base index for extra_bits */\n  this.elems        = elems;        /* max number of elements in the tree */\n  this.max_length   = max_length;   /* max bit length for the codes */\n\n  // show if `static_tree` has data or dummy - needed for monomorphic objects\n  this.has_stree    = static_tree && static_tree.length;\n}\n\n\nvar static_l_desc;\nvar static_d_desc;\nvar static_bl_desc;\n\n\nfunction TreeDesc(dyn_tree, stat_desc) {\n  this.dyn_tree = dyn_tree;     /* the dynamic tree */\n  this.max_code = 0;            /* largest code with non zero frequency */\n  this.stat_desc = stat_desc;   /* the corresponding static tree */\n}\n\n\n\nfunction d_code(dist) {\n  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];\n}\n\n\n/* ===========================================================================\n * Output a short LSB first on the stream.\n * IN assertion: there is enough room in pendingBuf.\n */\nfunction put_short(s, w) {\n//    put_byte(s, (uch)((w) & 0xff));\n//    put_byte(s, (uch)((ush)(w) >> 8));\n  s.pending_buf[s.pending++] = (w) & 0xff;\n  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;\n}\n\n\n/* ===========================================================================\n * Send a value on a given number of bits.\n * IN assertion: length <= 16 and value fits in length bits.\n */\nfunction send_bits(s, value, length) {\n  if (s.bi_valid > (Buf_size - length)) {\n    s.bi_buf |= (value << s.bi_valid) & 0xffff;\n    put_short(s, s.bi_buf);\n    s.bi_buf = value >> (Buf_size - s.bi_valid);\n    s.bi_valid += length - Buf_size;\n  } else {\n    s.bi_buf |= (value << s.bi_valid) & 0xffff;\n    s.bi_valid += length;\n  }\n}\n\n\nfunction send_code(s, c, tree) {\n  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);\n}\n\n\n/* ===========================================================================\n * Reverse the first len bits of a code, using straightforward code (a faster\n * method would use a table)\n * IN assertion: 1 <= len <= 15\n */\nfunction bi_reverse(code, len) {\n  var res = 0;\n  do {\n    res |= code & 1;\n    code >>>= 1;\n    res <<= 1;\n  } while (--len > 0);\n  return res >>> 1;\n}\n\n\n/* ===========================================================================\n * Flush the bit buffer, keeping at most 7 bits in it.\n */\nfunction bi_flush(s) {\n  if (s.bi_valid === 16) {\n    put_short(s, s.bi_buf);\n    s.bi_buf = 0;\n    s.bi_valid = 0;\n\n  } else if (s.bi_valid >= 8) {\n    s.pending_buf[s.pending++] = s.bi_buf & 0xff;\n    s.bi_buf >>= 8;\n    s.bi_valid -= 8;\n  }\n}\n\n\n/* ===========================================================================\n * Compute the optimal bit lengths for a tree and update the total bit length\n * for the current block.\n * IN assertion: the fields freq and dad are set, heap[heap_max] and\n *    above are the tree nodes sorted by increasing frequency.\n * OUT assertions: the field len is set to the optimal bit length, the\n *     array bl_count contains the frequencies for each bit length.\n *     The length opt_len is updated; static_len is also updated if stree is\n *     not null.\n */\nfunction gen_bitlen(s, desc)\n//    deflate_state *s;\n//    tree_desc *desc;    /* the tree descriptor */\n{\n  var tree            = desc.dyn_tree;\n  var max_code        = desc.max_code;\n  var stree           = desc.stat_desc.static_tree;\n  var has_stree       = desc.stat_desc.has_stree;\n  var extra           = desc.stat_desc.extra_bits;\n  var base            = desc.stat_desc.extra_base;\n  var max_length      = desc.stat_desc.max_length;\n  var h;              /* heap index */\n  var n, m;           /* iterate over the tree elements */\n  var bits;           /* bit length */\n  var xbits;          /* extra bits */\n  var f;              /* frequency */\n  var overflow = 0;   /* number of elements with bit length too large */\n\n  for (bits = 0; bits <= MAX_BITS; bits++) {\n    s.bl_count[bits] = 0;\n  }\n\n  /* In a first pass, compute the optimal bit lengths (which may\n   * overflow in the case of the bit length tree).\n   */\n  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */\n\n  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {\n    n = s.heap[h];\n    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;\n    if (bits > max_length) {\n      bits = max_length;\n      overflow++;\n    }\n    tree[n * 2 + 1]/*.Len*/ = bits;\n    /* We overwrite tree[n].Dad which is no longer needed */\n\n    if (n > max_code) { continue; } /* not a leaf node */\n\n    s.bl_count[bits]++;\n    xbits = 0;\n    if (n >= base) {\n      xbits = extra[n - base];\n    }\n    f = tree[n * 2]/*.Freq*/;\n    s.opt_len += f * (bits + xbits);\n    if (has_stree) {\n      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);\n    }\n  }\n  if (overflow === 0) { return; }\n\n  // Trace((stderr,\"\\nbit length overflow\\n\"));\n  /* This happens for example on obj2 and pic of the Calgary corpus */\n\n  /* Find the first bit length which could increase: */\n  do {\n    bits = max_length - 1;\n    while (s.bl_count[bits] === 0) { bits--; }\n    s.bl_count[bits]--;      /* move one leaf down the tree */\n    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */\n    s.bl_count[max_length]--;\n    /* The brother of the overflow item also moves one step up,\n     * but this does not affect bl_count[max_length]\n     */\n    overflow -= 2;\n  } while (overflow > 0);\n\n  /* Now recompute all bit lengths, scanning in increasing frequency.\n   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all\n   * lengths instead of fixing only the wrong ones. This idea is taken\n   * from 'ar' written by Haruhiko Okumura.)\n   */\n  for (bits = max_length; bits !== 0; bits--) {\n    n = s.bl_count[bits];\n    while (n !== 0) {\n      m = s.heap[--h];\n      if (m > max_code) { continue; }\n      if (tree[m * 2 + 1]/*.Len*/ !== bits) {\n        // Trace((stderr,\"code %d bits %d->%d\\n\", m, tree[m].Len, bits));\n        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;\n        tree[m * 2 + 1]/*.Len*/ = bits;\n      }\n      n--;\n    }\n  }\n}\n\n\n/* ===========================================================================\n * Generate the codes for a given tree and bit counts (which need not be\n * optimal).\n * IN assertion: the array bl_count contains the bit length statistics for\n * the given tree and the field len is set for all tree elements.\n * OUT assertion: the field code is set for all tree elements of non\n *     zero code length.\n */\nfunction gen_codes(tree, max_code, bl_count)\n//    ct_data *tree;             /* the tree to decorate */\n//    int max_code;              /* largest code with non zero frequency */\n//    ushf *bl_count;            /* number of codes at each bit length */\n{\n  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */\n  var code = 0;              /* running code value */\n  var bits;                  /* bit index */\n  var n;                     /* code index */\n\n  /* The distribution counts are first used to generate the code values\n   * without bit reversal.\n   */\n  for (bits = 1; bits <= MAX_BITS; bits++) {\n    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;\n  }\n  /* Check that the bit counts in bl_count are consistent. The last code\n   * must be all ones.\n   */\n  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,\n  //        \"inconsistent bit counts\");\n  //Tracev((stderr,\"\\ngen_codes: max_code %d \", max_code));\n\n  for (n = 0;  n <= max_code; n++) {\n    var len = tree[n * 2 + 1]/*.Len*/;\n    if (len === 0) { continue; }\n    /* Now reverse the bits */\n    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);\n\n    //Tracecv(tree != static_ltree, (stderr,\"\\nn %3d %c l %2d c %4x (%x) \",\n    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));\n  }\n}\n\n\n/* ===========================================================================\n * Initialize the various 'constant' tables.\n */\nfunction tr_static_init() {\n  var n;        /* iterates over tree elements */\n  var bits;     /* bit counter */\n  var length;   /* length value */\n  var code;     /* code value */\n  var dist;     /* distance index */\n  var bl_count = new Array(MAX_BITS + 1);\n  /* number of codes at each bit length for an optimal tree */\n\n  // do check in _tr_init()\n  //if (static_init_done) return;\n\n  /* For some embedded targets, global variables are not initialized: */\n/*#ifdef NO_INIT_GLOBAL_POINTERS\n  static_l_desc.static_tree = static_ltree;\n  static_l_desc.extra_bits = extra_lbits;\n  static_d_desc.static_tree = static_dtree;\n  static_d_desc.extra_bits = extra_dbits;\n  static_bl_desc.extra_bits = extra_blbits;\n#endif*/\n\n  /* Initialize the mapping length (0..255) -> length code (0..28) */\n  length = 0;\n  for (code = 0; code < LENGTH_CODES - 1; code++) {\n    base_length[code] = length;\n    for (n = 0; n < (1 << extra_lbits[code]); n++) {\n      _length_code[length++] = code;\n    }\n  }\n  //Assert (length == 256, \"tr_static_init: length != 256\");\n  /* Note that the length 255 (match length 258) can be represented\n   * in two different ways: code 284 + 5 bits or code 285, so we\n   * overwrite length_code[255] to use the best encoding:\n   */\n  _length_code[length - 1] = code;\n\n  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */\n  dist = 0;\n  for (code = 0; code < 16; code++) {\n    base_dist[code] = dist;\n    for (n = 0; n < (1 << extra_dbits[code]); n++) {\n      _dist_code[dist++] = code;\n    }\n  }\n  //Assert (dist == 256, \"tr_static_init: dist != 256\");\n  dist >>= 7; /* from now on, all distances are divided by 128 */\n  for (; code < D_CODES; code++) {\n    base_dist[code] = dist << 7;\n    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {\n      _dist_code[256 + dist++] = code;\n    }\n  }\n  //Assert (dist == 256, \"tr_static_init: 256+dist != 512\");\n\n  /* Construct the codes of the static literal tree */\n  for (bits = 0; bits <= MAX_BITS; bits++) {\n    bl_count[bits] = 0;\n  }\n\n  n = 0;\n  while (n <= 143) {\n    static_ltree[n * 2 + 1]/*.Len*/ = 8;\n    n++;\n    bl_count[8]++;\n  }\n  while (n <= 255) {\n    static_ltree[n * 2 + 1]/*.Len*/ = 9;\n    n++;\n    bl_count[9]++;\n  }\n  while (n <= 279) {\n    static_ltree[n * 2 + 1]/*.Len*/ = 7;\n    n++;\n    bl_count[7]++;\n  }\n  while (n <= 287) {\n    static_ltree[n * 2 + 1]/*.Len*/ = 8;\n    n++;\n    bl_count[8]++;\n  }\n  /* Codes 286 and 287 do not exist, but we must include them in the\n   * tree construction to get a canonical Huffman tree (longest code\n   * all ones)\n   */\n  gen_codes(static_ltree, L_CODES + 1, bl_count);\n\n  /* The static distance tree is trivial: */\n  for (n = 0; n < D_CODES; n++) {\n    static_dtree[n * 2 + 1]/*.Len*/ = 5;\n    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);\n  }\n\n  // Now data ready and we can init static trees\n  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);\n  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);\n  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);\n\n  //static_init_done = true;\n}\n\n\n/* ===========================================================================\n * Initialize a new block.\n */\nfunction init_block(s) {\n  var n; /* iterates over tree elements */\n\n  /* Initialize the trees. */\n  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }\n  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }\n  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }\n\n  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;\n  s.opt_len = s.static_len = 0;\n  s.last_lit = s.matches = 0;\n}\n\n\n/* ===========================================================================\n * Flush the bit buffer and align the output on a byte boundary\n */\nfunction bi_windup(s)\n{\n  if (s.bi_valid > 8) {\n    put_short(s, s.bi_buf);\n  } else if (s.bi_valid > 0) {\n    //put_byte(s, (Byte)s->bi_buf);\n    s.pending_buf[s.pending++] = s.bi_buf;\n  }\n  s.bi_buf = 0;\n  s.bi_valid = 0;\n}\n\n/* ===========================================================================\n * Copy a stored block, storing first the length and its\n * one's complement if requested.\n */\nfunction copy_block(s, buf, len, header)\n//DeflateState *s;\n//charf    *buf;    /* the input data */\n//unsigned len;     /* its length */\n//int      header;  /* true if block header must be written */\n{\n  bi_windup(s);        /* align on byte boundary */\n\n  if (header) {\n    put_short(s, len);\n    put_short(s, ~len);\n  }\n//  while (len--) {\n//    put_byte(s, *buf++);\n//  }\n  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);\n  s.pending += len;\n}\n\n/* ===========================================================================\n * Compares to subtrees, using the tree depth as tie breaker when\n * the subtrees have equal frequency. This minimizes the worst case length.\n */\nfunction smaller(tree, n, m, depth) {\n  var _n2 = n * 2;\n  var _m2 = m * 2;\n  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||\n         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));\n}\n\n/* ===========================================================================\n * Restore the heap property by moving down the tree starting at node k,\n * exchanging a node with the smallest of its two sons if necessary, stopping\n * when the heap property is re-established (each father smaller than its\n * two sons).\n */\nfunction pqdownheap(s, tree, k)\n//    deflate_state *s;\n//    ct_data *tree;  /* the tree to restore */\n//    int k;               /* node to move down */\n{\n  var v = s.heap[k];\n  var j = k << 1;  /* left son of k */\n  while (j <= s.heap_len) {\n    /* Set j to the smallest of the two sons: */\n    if (j < s.heap_len &&\n      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {\n      j++;\n    }\n    /* Exit if v is smaller than both sons */\n    if (smaller(tree, v, s.heap[j], s.depth)) { break; }\n\n    /* Exchange v with the smallest son */\n    s.heap[k] = s.heap[j];\n    k = j;\n\n    /* And continue down the tree, setting j to the left son of k */\n    j <<= 1;\n  }\n  s.heap[k] = v;\n}\n\n\n// inlined manually\n// var SMALLEST = 1;\n\n/* ===========================================================================\n * Send the block data compressed using the given Huffman trees\n */\nfunction compress_block(s, ltree, dtree)\n//    deflate_state *s;\n//    const ct_data *ltree; /* literal tree */\n//    const ct_data *dtree; /* distance tree */\n{\n  var dist;           /* distance of matched string */\n  var lc;             /* match length or unmatched char (if dist == 0) */\n  var lx = 0;         /* running index in l_buf */\n  var code;           /* the code to send */\n  var extra;          /* number of extra bits to send */\n\n  if (s.last_lit !== 0) {\n    do {\n      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);\n      lc = s.pending_buf[s.l_buf + lx];\n      lx++;\n\n      if (dist === 0) {\n        send_code(s, lc, ltree); /* send a literal byte */\n        //Tracecv(isgraph(lc), (stderr,\" '%c' \", lc));\n      } else {\n        /* Here, lc is the match length - MIN_MATCH */\n        code = _length_code[lc];\n        send_code(s, code + LITERALS + 1, ltree); /* send the length code */\n        extra = extra_lbits[code];\n        if (extra !== 0) {\n          lc -= base_length[code];\n          send_bits(s, lc, extra);       /* send the extra length bits */\n        }\n        dist--; /* dist is now the match distance - 1 */\n        code = d_code(dist);\n        //Assert (code < D_CODES, \"bad d_code\");\n\n        send_code(s, code, dtree);       /* send the distance code */\n        extra = extra_dbits[code];\n        if (extra !== 0) {\n          dist -= base_dist[code];\n          send_bits(s, dist, extra);   /* send the extra distance bits */\n        }\n      } /* literal or match pair ? */\n\n      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */\n      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,\n      //       \"pendingBuf overflow\");\n\n    } while (lx < s.last_lit);\n  }\n\n  send_code(s, END_BLOCK, ltree);\n}\n\n\n/* ===========================================================================\n * Construct one Huffman tree and assigns the code bit strings and lengths.\n * Update the total bit length for the current block.\n * IN assertion: the field freq is set for all tree elements.\n * OUT assertions: the fields len and code are set to the optimal bit length\n *     and corresponding code. The length opt_len is updated; static_len is\n *     also updated if stree is not null. The field max_code is set.\n */\nfunction build_tree(s, desc)\n//    deflate_state *s;\n//    tree_desc *desc; /* the tree descriptor */\n{\n  var tree     = desc.dyn_tree;\n  var stree    = desc.stat_desc.static_tree;\n  var has_stree = desc.stat_desc.has_stree;\n  var elems    = desc.stat_desc.elems;\n  var n, m;          /* iterate over heap elements */\n  var max_code = -1; /* largest code with non zero frequency */\n  var node;          /* new node being created */\n\n  /* Construct the initial heap, with least frequent element in\n   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].\n   * heap[0] is not used.\n   */\n  s.heap_len = 0;\n  s.heap_max = HEAP_SIZE;\n\n  for (n = 0; n < elems; n++) {\n    if (tree[n * 2]/*.Freq*/ !== 0) {\n      s.heap[++s.heap_len] = max_code = n;\n      s.depth[n] = 0;\n\n    } else {\n      tree[n * 2 + 1]/*.Len*/ = 0;\n    }\n  }\n\n  /* The pkzip format requires that at least one distance code exists,\n   * and that at least one bit should be sent even if there is only one\n   * possible code. So to avoid special checks later on we force at least\n   * two codes of non zero frequency.\n   */\n  while (s.heap_len < 2) {\n    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);\n    tree[node * 2]/*.Freq*/ = 1;\n    s.depth[node] = 0;\n    s.opt_len--;\n\n    if (has_stree) {\n      s.static_len -= stree[node * 2 + 1]/*.Len*/;\n    }\n    /* node is 0 or 1 so it does not have extra bits */\n  }\n  desc.max_code = max_code;\n\n  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,\n   * establish sub-heaps of increasing lengths:\n   */\n  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }\n\n  /* Construct the Huffman tree by repeatedly combining the least two\n   * frequent nodes.\n   */\n  node = elems;              /* next internal node of the tree */\n  do {\n    //pqremove(s, tree, n);  /* n = node of least frequency */\n    /*** pqremove ***/\n    n = s.heap[1/*SMALLEST*/];\n    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];\n    pqdownheap(s, tree, 1/*SMALLEST*/);\n    /***/\n\n    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */\n\n    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */\n    s.heap[--s.heap_max] = m;\n\n    /* Create a new node father of n and m */\n    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;\n    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;\n    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;\n\n    /* and insert the new node in the heap */\n    s.heap[1/*SMALLEST*/] = node++;\n    pqdownheap(s, tree, 1/*SMALLEST*/);\n\n  } while (s.heap_len >= 2);\n\n  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];\n\n  /* At this point, the fields freq and dad are set. We can now\n   * generate the bit lengths.\n   */\n  gen_bitlen(s, desc);\n\n  /* The field len is now set, we can generate the bit codes */\n  gen_codes(tree, max_code, s.bl_count);\n}\n\n\n/* ===========================================================================\n * Scan a literal or distance tree to determine the frequencies of the codes\n * in the bit length tree.\n */\nfunction scan_tree(s, tree, max_code)\n//    deflate_state *s;\n//    ct_data *tree;   /* the tree to be scanned */\n//    int max_code;    /* and its largest code of non zero frequency */\n{\n  var n;                     /* iterates over all tree elements */\n  var prevlen = -1;          /* last emitted length */\n  var curlen;                /* length of current code */\n\n  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */\n\n  var count = 0;             /* repeat count of the current code */\n  var max_count = 7;         /* max repeat count */\n  var min_count = 4;         /* min repeat count */\n\n  if (nextlen === 0) {\n    max_count = 138;\n    min_count = 3;\n  }\n  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */\n\n  for (n = 0; n <= max_code; n++) {\n    curlen = nextlen;\n    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;\n\n    if (++count < max_count && curlen === nextlen) {\n      continue;\n\n    } else if (count < min_count) {\n      s.bl_tree[curlen * 2]/*.Freq*/ += count;\n\n    } else if (curlen !== 0) {\n\n      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }\n      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;\n\n    } else if (count <= 10) {\n      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;\n\n    } else {\n      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;\n    }\n\n    count = 0;\n    prevlen = curlen;\n\n    if (nextlen === 0) {\n      max_count = 138;\n      min_count = 3;\n\n    } else if (curlen === nextlen) {\n      max_count = 6;\n      min_count = 3;\n\n    } else {\n      max_count = 7;\n      min_count = 4;\n    }\n  }\n}\n\n\n/* ===========================================================================\n * Send a literal or distance tree in compressed form, using the codes in\n * bl_tree.\n */\nfunction send_tree(s, tree, max_code)\n//    deflate_state *s;\n//    ct_data *tree; /* the tree to be scanned */\n//    int max_code;       /* and its largest code of non zero frequency */\n{\n  var n;                     /* iterates over all tree elements */\n  var prevlen = -1;          /* last emitted length */\n  var curlen;                /* length of current code */\n\n  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */\n\n  var count = 0;             /* repeat count of the current code */\n  var max_count = 7;         /* max repeat count */\n  var min_count = 4;         /* min repeat count */\n\n  /* tree[max_code+1].Len = -1; */  /* guard already set */\n  if (nextlen === 0) {\n    max_count = 138;\n    min_count = 3;\n  }\n\n  for (n = 0; n <= max_code; n++) {\n    curlen = nextlen;\n    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;\n\n    if (++count < max_count && curlen === nextlen) {\n      continue;\n\n    } else if (count < min_count) {\n      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);\n\n    } else if (curlen !== 0) {\n      if (curlen !== prevlen) {\n        send_code(s, curlen, s.bl_tree);\n        count--;\n      }\n      //Assert(count >= 3 && count <= 6, \" 3_6?\");\n      send_code(s, REP_3_6, s.bl_tree);\n      send_bits(s, count - 3, 2);\n\n    } else if (count <= 10) {\n      send_code(s, REPZ_3_10, s.bl_tree);\n      send_bits(s, count - 3, 3);\n\n    } else {\n      send_code(s, REPZ_11_138, s.bl_tree);\n      send_bits(s, count - 11, 7);\n    }\n\n    count = 0;\n    prevlen = curlen;\n    if (nextlen === 0) {\n      max_count = 138;\n      min_count = 3;\n\n    } else if (curlen === nextlen) {\n      max_count = 6;\n      min_count = 3;\n\n    } else {\n      max_count = 7;\n      min_count = 4;\n    }\n  }\n}\n\n\n/* ===========================================================================\n * Construct the Huffman tree for the bit lengths and return the index in\n * bl_order of the last bit length code to send.\n */\nfunction build_bl_tree(s) {\n  var max_blindex;  /* index of last bit length code of non zero freq */\n\n  /* Determine the bit length frequencies for literal and distance trees */\n  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);\n  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);\n\n  /* Build the bit length tree: */\n  build_tree(s, s.bl_desc);\n  /* opt_len now includes the length of the tree representations, except\n   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.\n   */\n\n  /* Determine the number of bit length codes to send. The pkzip format\n   * requires that at least 4 bit length codes be sent. (appnote.txt says\n   * 3 but the actual value used is 4.)\n   */\n  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {\n    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {\n      break;\n    }\n  }\n  /* Update opt_len to include the bit length tree and counts */\n  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;\n  //Tracev((stderr, \"\\ndyn trees: dyn %ld, stat %ld\",\n  //        s->opt_len, s->static_len));\n\n  return max_blindex;\n}\n\n\n/* ===========================================================================\n * Send the header for a block using dynamic Huffman trees: the counts, the\n * lengths of the bit length codes, the literal tree and the distance tree.\n * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.\n */\nfunction send_all_trees(s, lcodes, dcodes, blcodes)\n//    deflate_state *s;\n//    int lcodes, dcodes, blcodes; /* number of codes for each tree */\n{\n  var rank;                    /* index in bl_order */\n\n  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, \"not enough codes\");\n  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,\n  //        \"too many codes\");\n  //Tracev((stderr, \"\\nbl counts: \"));\n  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */\n  send_bits(s, dcodes - 1,   5);\n  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */\n  for (rank = 0; rank < blcodes; rank++) {\n    //Tracev((stderr, \"\\nbl code %2d \", bl_order[rank]));\n    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);\n  }\n  //Tracev((stderr, \"\\nbl tree: sent %ld\", s->bits_sent));\n\n  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */\n  //Tracev((stderr, \"\\nlit tree: sent %ld\", s->bits_sent));\n\n  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */\n  //Tracev((stderr, \"\\ndist tree: sent %ld\", s->bits_sent));\n}\n\n\n/* ===========================================================================\n * Check if the data type is TEXT or BINARY, using the following algorithm:\n * - TEXT if the two conditions below are satisfied:\n *    a) There are no non-portable control characters belonging to the\n *       \"black list\" (0..6, 14..25, 28..31).\n *    b) There is at least one printable character belonging to the\n *       \"white list\" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).\n * - BINARY otherwise.\n * - The following partially-portable control characters form a\n *   \"gray list\" that is ignored in this detection algorithm:\n *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).\n * IN assertion: the fields Freq of dyn_ltree are set.\n */\nfunction detect_data_type(s) {\n  /* black_mask is the bit mask of black-listed bytes\n   * set bits 0..6, 14..25, and 28..31\n   * 0xf3ffc07f = binary 11110011111111111100000001111111\n   */\n  var black_mask = 0xf3ffc07f;\n  var n;\n\n  /* Check for non-textual (\"black-listed\") bytes. */\n  for (n = 0; n <= 31; n++, black_mask >>>= 1) {\n    if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {\n      return Z_BINARY;\n    }\n  }\n\n  /* Check for textual (\"white-listed\") bytes. */\n  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||\n      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {\n    return Z_TEXT;\n  }\n  for (n = 32; n < LITERALS; n++) {\n    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {\n      return Z_TEXT;\n    }\n  }\n\n  /* There are no \"black-listed\" or \"white-listed\" bytes:\n   * this stream either is empty or has tolerated (\"gray-listed\") bytes only.\n   */\n  return Z_BINARY;\n}\n\n\nvar static_init_done = false;\n\n/* ===========================================================================\n * Initialize the tree data structures for a new zlib stream.\n */\nfunction _tr_init(s)\n{\n\n  if (!static_init_done) {\n    tr_static_init();\n    static_init_done = true;\n  }\n\n  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);\n  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);\n  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);\n\n  s.bi_buf = 0;\n  s.bi_valid = 0;\n\n  /* Initialize the first block of the first file: */\n  init_block(s);\n}\n\n\n/* ===========================================================================\n * Send a stored block\n */\nfunction _tr_stored_block(s, buf, stored_len, last)\n//DeflateState *s;\n//charf *buf;       /* input block */\n//ulg stored_len;   /* length of input block */\n//int last;         /* one if this is the last block for a file */\n{\n  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */\n  copy_block(s, buf, stored_len, true); /* with header */\n}\n\n\n/* ===========================================================================\n * Send one empty static block to give enough lookahead for inflate.\n * This takes 10 bits, of which 7 may remain in the bit buffer.\n */\nfunction _tr_align(s) {\n  send_bits(s, STATIC_TREES << 1, 3);\n  send_code(s, END_BLOCK, static_ltree);\n  bi_flush(s);\n}\n\n\n/* ===========================================================================\n * Determine the best encoding for the current block: dynamic trees, static\n * trees or store, and output the encoded block to the zip file.\n */\nfunction _tr_flush_block(s, buf, stored_len, last)\n//DeflateState *s;\n//charf *buf;       /* input block, or NULL if too old */\n//ulg stored_len;   /* length of input block */\n//int last;         /* one if this is the last block for a file */\n{\n  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */\n  var max_blindex = 0;        /* index of last bit length code of non zero freq */\n\n  /* Build the Huffman trees unless a stored block is forced */\n  if (s.level > 0) {\n\n    /* Check if the file is binary or text */\n    if (s.strm.data_type === Z_UNKNOWN) {\n      s.strm.data_type = detect_data_type(s);\n    }\n\n    /* Construct the literal and distance trees */\n    build_tree(s, s.l_desc);\n    // Tracev((stderr, \"\\nlit data: dyn %ld, stat %ld\", s->opt_len,\n    //        s->static_len));\n\n    build_tree(s, s.d_desc);\n    // Tracev((stderr, \"\\ndist data: dyn %ld, stat %ld\", s->opt_len,\n    //        s->static_len));\n    /* At this point, opt_len and static_len are the total bit lengths of\n     * the compressed block data, excluding the tree representations.\n     */\n\n    /* Build the bit length tree for the above two trees, and get the index\n     * in bl_order of the last bit length code to send.\n     */\n    max_blindex = build_bl_tree(s);\n\n    /* Determine the best encoding. Compute the block lengths in bytes. */\n    opt_lenb = (s.opt_len + 3 + 7) >>> 3;\n    static_lenb = (s.static_len + 3 + 7) >>> 3;\n\n    // Tracev((stderr, \"\\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u \",\n    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,\n    //        s->last_lit));\n\n    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }\n\n  } else {\n    // Assert(buf != (char*)0, \"lost buf\");\n    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */\n  }\n\n  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {\n    /* 4: two words for the lengths */\n\n    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.\n     * Otherwise we can't have processed more than WSIZE input bytes since\n     * the last block flush, because compression would have been\n     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to\n     * transform a block into a stored block.\n     */\n    _tr_stored_block(s, buf, stored_len, last);\n\n  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {\n\n    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);\n    compress_block(s, static_ltree, static_dtree);\n\n  } else {\n    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);\n    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);\n    compress_block(s, s.dyn_ltree, s.dyn_dtree);\n  }\n  // Assert (s->compressed_len == s->bits_sent, \"bad compressed size\");\n  /* The above check is made mod 2^32, for files larger than 512 MB\n   * and uLong implemented on 32 bits.\n   */\n  init_block(s);\n\n  if (last) {\n    bi_windup(s);\n  }\n  // Tracev((stderr,\"\\ncomprlen %lu(%lu) \", s->compressed_len>>3,\n  //       s->compressed_len-7*last));\n}\n\n/* ===========================================================================\n * Save the match info and tally the frequency counts. Return true if\n * the current block must be flushed.\n */\nfunction _tr_tally(s, dist, lc)\n//    deflate_state *s;\n//    unsigned dist;  /* distance of matched string */\n//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */\n{\n  //var out_length, in_length, dcode;\n\n  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;\n  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;\n\n  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;\n  s.last_lit++;\n\n  if (dist === 0) {\n    /* lc is the unmatched char */\n    s.dyn_ltree[lc * 2]/*.Freq*/++;\n  } else {\n    s.matches++;\n    /* Here, lc is the match length - MIN_MATCH */\n    dist--;             /* dist = match distance - 1 */\n    //Assert((ush)dist < (ush)MAX_DIST(s) &&\n    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&\n    //       (ush)d_code(dist) < (ush)D_CODES,  \"_tr_tally: bad match\");\n\n    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;\n    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;\n  }\n\n// (!) This block is disabled in zlib defaults,\n// don't enable it for binary compatibility\n\n//#ifdef TRUNCATE_BLOCK\n//  /* Try to guess if it is profitable to stop the current block here */\n//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {\n//    /* Compute an upper bound for the compressed length */\n//    out_length = s.last_lit*8;\n//    in_length = s.strstart - s.block_start;\n//\n//    for (dcode = 0; dcode < D_CODES; dcode++) {\n//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);\n//    }\n//    out_length >>>= 3;\n//    //Tracev((stderr,\"\\nlast_lit %u, in %ld, out ~%ld(%ld%%) \",\n//    //       s->last_lit, in_length, out_length,\n//    //       100L - out_length*100L/in_length));\n//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {\n//      return true;\n//    }\n//  }\n//#endif\n\n  return (s.last_lit === s.lit_bufsize - 1);\n  /* We avoid equality with lit_bufsize because of wraparound at 64K\n   * on 16 bit machines and because stored blocks are restricted to\n   * 64K-1 bytes.\n   */\n}\n\nexports._tr_init  = _tr_init;\nexports._tr_stored_block = _tr_stored_block;\nexports._tr_flush_block  = _tr_flush_block;\nexports._tr_tally = _tr_tally;\nexports._tr_align = _tr_align;\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/trees.js?");

/***/ }),

/***/ "./node_modules/pako/lib/zlib/zstream.js":
/*!***********************************************!*\
  !*** ./node_modules/pako/lib/zlib/zstream.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// (C) 1995-2013 Jean-loup Gailly and Mark Adler\n// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin\n//\n// This software is provided 'as-is', without any express or implied\n// warranty. In no event will the authors be held liable for any damages\n// arising from the use of this software.\n//\n// Permission is granted to anyone to use this software for any purpose,\n// including commercial applications, and to alter it and redistribute it\n// freely, subject to the following restrictions:\n//\n// 1. The origin of this software must not be misrepresented; you must not\n//   claim that you wrote the original software. If you use this software\n//   in a product, an acknowledgment in the product documentation would be\n//   appreciated but is not required.\n// 2. Altered source versions must be plainly marked as such, and must not be\n//   misrepresented as being the original software.\n// 3. This notice may not be removed or altered from any source distribution.\n\nfunction ZStream() {\n  /* next input byte */\n  this.input = null; // JS specific, because we have no pointers\n  this.next_in = 0;\n  /* number of bytes available at input */\n  this.avail_in = 0;\n  /* total number of input bytes read so far */\n  this.total_in = 0;\n  /* next output byte should be put there */\n  this.output = null; // JS specific, because we have no pointers\n  this.next_out = 0;\n  /* remaining free space at output */\n  this.avail_out = 0;\n  /* total number of bytes output so far */\n  this.total_out = 0;\n  /* last error message, NULL if no error */\n  this.msg = ''/*Z_NULL*/;\n  /* not visible by applications */\n  this.state = null;\n  /* best guess about the data type: binary or text */\n  this.data_type = 2/*Z_UNKNOWN*/;\n  /* adler32 value of the uncompressed data */\n  this.adler = 0;\n}\n\nmodule.exports = ZStream;\n\n\n//# sourceURL=webpack://PizZip/./node_modules/pako/lib/zlib/zstream.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var g;\n\n// This works in non-strict mode\ng = (function() {\n\treturn this;\n})();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || new Function(\"return this\")();\n} catch (e) {\n\t// This works if the window reference is available\n\tif (typeof window === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n\n//# sourceURL=webpack://PizZip/(webpack)/buildin/global.js?");

/***/ })

/******/ });
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Docxtemplater=f()}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r}()({1:[function(require,module,exports){"use strict";module.exports={XMLSerializer:window.XMLSerializer,DOMParser:window.DOMParser,XMLDocument:window.XMLDocument}},{}],2:[function(require,module,exports){"use strict";var ctXML="[Content_Types].xml";function collectContentTypes(overrides,defaults,zip){var partNames={};for(var i=0,len=overrides.length;i<len;i++){var override=overrides[i];var contentType=override.getAttribute("ContentType");var partName=override.getAttribute("PartName").substr(1);partNames[partName]=contentType}var _loop=function _loop(_i,_len){var def=defaults[_i];var contentType=def.getAttribute("ContentType");var extension=def.getAttribute("Extension");zip.file(/./).map(function(_ref){var name=_ref.name;if(name.slice(name.length-extension.length-1)===".xml"&&!partNames[name]&&name!==ctXML){partNames[name]=contentType}})};for(var _i=0,_len=defaults.length;_i<_len;_i++){_loop(_i,_len)}return partNames}module.exports=collectContentTypes},{}],3:[function(require,module,exports){"use strict";function _slicedToArray(arr,i){return _arrayWithHoles(arr)||_iterableToArrayLimit(arr,i)||_unsupportedIterableToArray(arr,i)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i]}return arr2}function _iterableToArrayLimit(arr,i){if(typeof Symbol==="undefined"||!(Symbol.iterator in Object(arr)))return;var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i["return"]!=null)_i["return"]()}finally{if(_d)throw _e}}return _arr}function _arrayWithHoles(arr){if(Array.isArray(arr))return arr}var _require=require("./browser-versions/xmldom.js"),DOMParser=_require.DOMParser,XMLSerializer=_require.XMLSerializer;var _require2=require("./errors"),throwXmlTagNotFound=_require2.throwXmlTagNotFound;var _require3=require("./utils"),last=_require3.last,first=_require3.first;function parser(tag){return{get:function get(scope){if(tag==="."){return scope}return scope[tag]}}}function getNearestLeftIndex(parsed,elements,index){for(var i=index;i>=0;i--){var part=parsed[i];for(var j=0,len=elements.length;j<len;j++){var element=elements[j];if(isStarting(part.value,element)){return j}}}return null}function getNearestRightIndex(parsed,elements,index){for(var i=index,l=parsed.length;i<l;i++){var part=parsed[i];for(var j=0,len=elements.length;j<len;j++){var element=elements[j];if(isEnding(part.value,element)){return j}}}return-1}function getNearestLeft(parsed,elements,index){var found=getNearestLeftIndex(parsed,elements,index);if(found!==-1){return elements[found]}return null}function getNearestRight(parsed,elements,index){var found=getNearestRightIndex(parsed,elements,index);if(found!==-1){return elements[found]}return null}function buildNearestCache(postparsed,tags){return postparsed.reduce(function(cached,part,i){if(part.type==="tag"&&tags.indexOf(part.tag)!==-1){cached.push({i:i,part:part})}return cached},[])}function getNearestLeftIndexWithCache(index,cache){if(cache.length===0){return-1}for(var i=0,len=cache.length;i<len;i++){var current=cache[i];var next=cache[i+1];if(current.i<index&&(!next||index<next.i)&&current.part.position==="start"){return i}}return-1}function getNearestLeftWithCache(index,cache){var found=getNearestLeftIndexWithCache(index,cache);if(found!==-1){return cache[found].part.tag}return null}function getNearestRightIndexWithCache(index,cache){if(cache.length===0){return-1}for(var i=0,len=cache.length;i<len;i++){var current=cache[i];var _last=cache[i-1];if(index<current.i&&(!_last||_last.i<index)&&current.part.position==="end"){return i}}return-1}function getNearestRightWithCache(index,cache){var found=getNearestRightIndexWithCache(index,cache);if(found!==-1){return cache[found].part.tag}return null}function endsWith(str,suffix){return str.indexOf(suffix,str.length-suffix.length)!==-1}function startsWith(str,prefix){return str.substring(0,prefix.length)===prefix}function unique(arr){var hash={},result=[];for(var i=0,l=arr.length;i<l;++i){if(!hash.hasOwnProperty(arr[i])){hash[arr[i]]=true;result.push(arr[i])}}return result}function chunkBy(parsed,f){return parsed.reduce(function(chunks,p){var currentChunk=last(chunks);var res=f(p);if(currentChunk.length===0){currentChunk.push(p);return chunks}if(res==="start"){chunks.push([p])}else if(res==="end"){currentChunk.push(p);chunks.push([])}else{currentChunk.push(p)}return chunks},[[]]).filter(function(p){return p.length>0})}var defaults={paragraphLoop:false,nullGetter:function nullGetter(part){if(!part.module){return"undefined"}if(part.module==="rawxml"){return""}return""},xmlFileNames:[],parser:parser,linebreaks:false,fileTypeConfig:null,delimiters:{start:"{",end:"}"}};function mergeObjects(){var resObj={};var obj,keys;for(var i=0;i<arguments.length;i+=1){obj=arguments[i];keys=Object.keys(obj);for(var j=0;j<keys.length;j+=1){resObj[keys[j]]=obj[keys[j]]}}return resObj}function xml2str(xmlNode){var a=new XMLSerializer;return a.serializeToString(xmlNode).replace(/xmlns(:[a-z0-9]+)?="" ?/g,"")}function str2xml(str){if(str.charCodeAt(0)===65279){str=str.substr(1)}var parser=new DOMParser;return parser.parseFromString(str,"text/xml")}var charMap=[["&","&amp;"],["<","&lt;"],[">","&gt;"],['"',"&quot;"],["'","&apos;"]];function escapeRegExp(str){return str.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}var charMapRegexes=charMap.map(function(_ref){var _ref2=_slicedToArray(_ref,2),endChar=_ref2[0],startChar=_ref2[1];return{rstart:new RegExp(escapeRegExp(startChar),"g"),rend:new RegExp(escapeRegExp(endChar),"g"),start:startChar,end:endChar}});function wordToUtf8(string){var r;for(var i=charMapRegexes.length-1;i>=0;i--){r=charMapRegexes[i];string=string.replace(r.rstart,r.end)}return string}function utf8ToWord(string){if(typeof string!=="string"){string=string.toString()}var r;for(var i=0,l=charMapRegexes.length;i<l;i++){r=charMapRegexes[i];string=string.replace(r.rend,r.start)}return string}function concatArrays(arrays){var result=[];for(var i=0;i<arrays.length;i++){var array=arrays[i];for(var j=0,len=array.length;j<len;j++){result.push(array[j])}}return result}var spaceRegexp=new RegExp(String.fromCharCode(160),"g");function convertSpaces(s){return s.replace(spaceRegexp," ")}function pregMatchAll(regex,content){var matchArray=[];var match;while((match=regex.exec(content))!=null){matchArray.push({array:match,offset:match.index})}return matchArray}function isEnding(value,element){return value==="</"+element+">"}function isStarting(value,element){return value.indexOf("<"+element)===0&&[">"," "].indexOf(value[element.length+1])!==-1}function getRight(parsed,element,index){var val=getRightOrNull(parsed,element,index);if(val!==null){return val}throwXmlTagNotFound({position:"right",element:element,parsed:parsed,index:index})}function getRightOrNull(parsed,elements,index){if(typeof elements==="string"){elements=[elements]}var level=1;for(var i=index,l=parsed.length;i<l;i++){var part=parsed[i];for(var j=0,len=elements.length;j<len;j++){var element=elements[j];if(isEnding(part.value,element)){level--}if(isStarting(part.value,element)){level++}if(level===0){return i}}}return null}function getLeft(parsed,element,index){var val=getLeftOrNull(parsed,element,index);if(val!==null){return val}throwXmlTagNotFound({position:"left",element:element,parsed:parsed,index:index})}function getLeftOrNull(parsed,elements,index){if(typeof elements==="string"){elements=[elements]}var level=1;for(var i=index;i>=0;i--){var part=parsed[i];for(var j=0,len=elements.length;j<len;j++){var element=elements[j];if(isStarting(part.value,element)){level--}if(isEnding(part.value,element)){level++}if(level===0){return i}}}return null}function isTagStart(tagType,_ref3){var type=_ref3.type,tag=_ref3.tag,position=_ref3.position;return type==="tag"&&tag===tagType&&position==="start"}function isTagEnd(tagType,_ref4){var type=_ref4.type,tag=_ref4.tag,position=_ref4.position;return type==="tag"&&tag===tagType&&position==="end"}function isParagraphStart(options){return isTagStart("w:p",options)||isTagStart("a:p",options)}function isParagraphEnd(options){return isTagEnd("w:p",options)||isTagEnd("a:p",options)}function isTextStart(part){return part.type==="tag"&&part.position==="start"&&part.text}function isTextEnd(part){return part.type==="tag"&&part.position==="end"&&part.text}function isContent(p){return p.type==="placeholder"||p.type==="content"&&p.position==="insidetag"}var corruptCharacters=/[\x00-\x08\x0B\x0C\x0E-\x1F]/;function hasCorruptCharacters(string){return corruptCharacters.test(string)}function invertMap(map){return Object.keys(map).reduce(function(invertedMap,key){var value=map[key];invertedMap[value]=invertedMap[value]||[];invertedMap[value].push(key);return invertedMap},{})}module.exports={endsWith:endsWith,startsWith:startsWith,getNearestLeft:getNearestLeft,getNearestRight:getNearestRight,getNearestLeftWithCache:getNearestLeftWithCache,getNearestRightWithCache:getNearestRightWithCache,getNearestLeftIndex:getNearestLeftIndex,getNearestRightIndex:getNearestRightIndex,getNearestLeftIndexWithCache:getNearestLeftIndexWithCache,getNearestRightIndexWithCache:getNearestRightIndexWithCache,buildNearestCache:buildNearestCache,isContent:isContent,isParagraphStart:isParagraphStart,isParagraphEnd:isParagraphEnd,isTagStart:isTagStart,isTagEnd:isTagEnd,isTextStart:isTextStart,isTextEnd:isTextEnd,unique:unique,chunkBy:chunkBy,last:last,first:first,mergeObjects:mergeObjects,xml2str:xml2str,str2xml:str2xml,getRightOrNull:getRightOrNull,getRight:getRight,getLeftOrNull:getLeftOrNull,getLeft:getLeft,pregMatchAll:pregMatchAll,convertSpaces:convertSpaces,escapeRegExp:escapeRegExp,charMapRegexes:charMapRegexes,hasCorruptCharacters:hasCorruptCharacters,defaults:defaults,wordToUtf8:wordToUtf8,utf8ToWord:utf8ToWord,concatArrays:concatArrays,invertMap:invertMap,charMap:charMap}},{"./browser-versions/xmldom.js":1,"./errors":4,"./utils":24}],4:[function(require,module,exports){"use strict";function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable});keys.push.apply(keys,symbols)}return keys}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(Object(source),true).forEach(function(key){_defineProperty(target,key,source[key])})}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source))}else{ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key))})}}return target}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}var _require=require("./utils"),last=_require.last,first=_require.first;function XTError(message){this.name="GenericError";this.message=message;this.stack=new Error(message).stack}XTError.prototype=Error.prototype;function XTTemplateError(message){this.name="TemplateError";this.message=message;this.stack=new Error(message).stack}XTTemplateError.prototype=new XTError;function XTRenderingError(message){this.name="RenderingError";this.message=message;this.stack=new Error(message).stack}XTRenderingError.prototype=new XTError;function XTScopeParserError(message){this.name="ScopeParserError";this.message=message;this.stack=new Error(message).stack}XTScopeParserError.prototype=new XTError;function XTInternalError(message){this.name="InternalError";this.properties={explanation:"InternalError"};this.message=message;this.stack=new Error(message).stack}XTInternalError.prototype=new XTError;function XTAPIVersionError(message){this.name="APIVersionError";this.properties={explanation:"APIVersionError"};this.message=message;this.stack=new Error(message).stack}XTAPIVersionError.prototype=new XTError;function throwApiVersionError(msg,properties){var err=new XTAPIVersionError(msg);err.properties=_objectSpread({id:"api_version_error"},properties);throw err}function throwMultiError(errors){var err=new XTTemplateError("Multi error");err.properties={errors:errors,id:"multi_error",explanation:"The template has multiple errors"};throw err}function getUnopenedTagException(options){var err=new XTTemplateError("Unopened tag");err.properties={xtag:last(options.xtag.split(" ")),id:"unopened_tag",context:options.xtag,offset:options.offset,lIndex:options.lIndex,explanation:'The tag beginning with "'.concat(options.xtag.substr(0,10),'" is unopened')};return err}function getDuplicateOpenTagException(options){var err=new XTTemplateError("Duplicate open tag, expected one open tag");err.properties={xtag:first(options.xtag.split(" ")),id:"duplicate_open_tag",context:options.xtag,offset:options.offset,lIndex:options.lIndex,explanation:'The tag beginning with "'.concat(options.xtag.substr(0,10),'" has duplicate open tags')};return err}function getDuplicateCloseTagException(options){var err=new XTTemplateError("Duplicate close tag, expected one close tag");err.properties={xtag:first(options.xtag.split(" ")),id:"duplicate_close_tag",context:options.xtag,offset:options.offset,lIndex:options.lIndex,explanation:'The tag ending with "'.concat(options.xtag.substr(0,10),'" has duplicate close tags')};return err}function getUnclosedTagException(options){var err=new XTTemplateError("Unclosed tag");err.properties={xtag:first(options.xtag.split(" ")).substr(1),id:"unclosed_tag",context:options.xtag,offset:options.offset,lIndex:options.lIndex,explanation:'The tag beginning with "'.concat(options.xtag.substr(0,10),'" is unclosed')};return err}function throwXmlTagNotFound(options){var err=new XTTemplateError('No tag "'.concat(options.element,'" was found at the ').concat(options.position));var part=options.parsed[options.index];err.properties={id:"no_xml_tag_found_at_".concat(options.position),explanation:'No tag "'.concat(options.element,'" was found at the ').concat(options.position),offset:part.offset,part:part,parsed:options.parsed,index:options.index,element:options.element};throw err}function getCorruptCharactersException(_ref){var tag=_ref.tag,value=_ref.value,offset=_ref.offset;var err=new XTRenderingError("There are some XML corrupt characters");err.properties={id:"invalid_xml_characters",xtag:tag,value:value,offset:offset,explanation:"There are some corrupt characters for the field ${tag}"};return err}function throwContentMustBeString(type){var err=new XTInternalError("Content must be a string");err.properties.id="xmltemplater_content_must_be_string";err.properties.type=type;throw err}function throwExpandNotFound(options){var _options$part=options.part,value=_options$part.value,offset=_options$part.offset,_options$id=options.id,id=_options$id===void 0?"raw_tag_outerxml_invalid":_options$id,_options$message=options.message,message=_options$message===void 0?"Raw tag not in paragraph":_options$message;var part=options.part;var _options$explanation=options.explanation,explanation=_options$explanation===void 0?'The tag "'.concat(value,'" is not inside a paragraph'):_options$explanation;if(typeof explanation==="function"){explanation=explanation(part)}var err=new XTTemplateError(message);err.properties={id:id,explanation:explanation,rootError:options.rootError,xtag:value,offset:offset,postparsed:options.postparsed,expandTo:options.expandTo,index:options.index};throw err}function throwRawTagShouldBeOnlyTextInParagraph(options){var err=new XTTemplateError("Raw tag should be the only text in paragraph");var tag=options.part.value;err.properties={id:"raw_xml_tag_should_be_only_text_in_paragraph",explanation:'The raw tag "'.concat(tag,'" should be the only text in this paragraph. This means that this tag should not be surrounded by any text or spaces.'),xtag:tag,offset:options.part.offset,paragraphParts:options.paragraphParts};throw err}function getUnmatchedLoopException(part){var location=part.location,offset=part.offset;var t=location==="start"?"unclosed":"unopened";var T=location==="start"?"Unclosed":"Unopened";var err=new XTTemplateError("".concat(T," loop"));var tag=part.value;err.properties={id:"".concat(t,"_loop"),explanation:'The loop with tag "'.concat(tag,'" is ').concat(t),xtag:tag,offset:offset};return err}function getUnbalancedLoopException(pair,lastPair){var err=new XTTemplateError("Unbalanced loop tag");var lastL=lastPair[0].part.value;var lastR=lastPair[1].part.value;var l=pair[0].part.value;var r=pair[1].part.value;err.properties={id:"unbalanced_loop_tags",explanation:"Unbalanced loop tags {#".concat(lastL,"}{/").concat(lastR,"}{#").concat(l,"}{/").concat(r,"}"),offset:[lastPair[0].part.offset,pair[1].part.offset],lastPair:{left:lastPair[0].part.value,right:lastPair[1].part.value},pair:{left:pair[0].part.value,right:pair[1].part.value}};return err}function getClosingTagNotMatchOpeningTag(_ref2){var tags=_ref2.tags;var err=new XTTemplateError("Closing tag does not match opening tag");err.properties={id:"closing_tag_does_not_match_opening_tag",explanation:'The tag "'.concat(tags[0].value,'" is closed by the tag "').concat(tags[1].value,'"'),openingtag:first(tags).value,offset:[first(tags).offset,last(tags).offset],closingtag:last(tags).value};return err}function getScopeCompilationError(_ref3){var tag=_ref3.tag,rootError=_ref3.rootError,offset=_ref3.offset;var err=new XTScopeParserError("Scope parser compilation failed");err.properties={id:"scopeparser_compilation_failed",offset:offset,tag:tag,explanation:'The scope parser for the tag "'.concat(tag,'" failed to compile'),rootError:rootError};return err}function getScopeParserExecutionError(_ref4){var tag=_ref4.tag,scope=_ref4.scope,error=_ref4.error,offset=_ref4.offset;var err=new XTScopeParserError("Scope parser execution failed");err.properties={id:"scopeparser_execution_failed",explanation:"The scope parser for the tag ".concat(tag," failed to execute"),scope:scope,offset:offset,tag:tag,rootError:error};return err}function getLoopPositionProducesInvalidXMLError(_ref5){var tag=_ref5.tag,offset=_ref5.offset;var err=new XTTemplateError('The position of the loop tags "'.concat(tag,'" would produce invalid XML'));err.properties={tag:tag,id:"loop_position_invalid",explanation:'The tags "'.concat(tag,'" are misplaced in the document, for example one of them is in a table and the other one outside the table'),offset:offset};return err}function throwUnimplementedTagType(part,index){var errorMsg='Unimplemented tag type "'.concat(part.type,'"');if(part.module){errorMsg+=' "'.concat(part.module,'"')}var err=new XTTemplateError(errorMsg);err.properties={part:part,index:index,id:"unimplemented_tag_type"};throw err}function throwMalformedXml(part){var err=new XTInternalError("Malformed xml");err.properties={part:part,id:"malformed_xml"};throw err}function throwLocationInvalid(part){throw new XTInternalError('Location should be one of "start" or "end" (given : '.concat(part.location,")"))}function throwResolveBeforeCompile(){var err=new XTInternalError("You must run `.compile()` before running `.resolveData()`");err.properties={id:"resolve_before_compile"};throw err}function throwRenderInvalidTemplate(){var err=new XTInternalError("You should not call .render on a document that had compilation errors");err.properties={id:"render_on_invalid_template"};throw err}function throwFileTypeNotIdentified(){var err=new XTInternalError("The filetype for this file could not be identified, is this file corrupted ?");err.properties={id:"filetype_not_identified"};throw err}function throwXmlInvalid(content,offset){var err=new XTTemplateError("An XML file has invalid xml");err.properties={id:"file_has_invalid_xml",content:content,offset:offset,explanation:"The docx contains invalid XML, it is most likely corrupt"};throw err}function throwFileTypeNotHandled(fileType){var err=new XTInternalError('The filetype "'.concat(fileType,'" is not handled by docxtemplater'));err.properties={id:"filetype_not_handled",explanation:'The file you are trying to generate is of type "'.concat(fileType,'", but only docx and pptx formats are handled'),fileType:fileType};throw err}module.exports={XTError:XTError,XTTemplateError:XTTemplateError,XTInternalError:XTInternalError,XTScopeParserError:XTScopeParserError,XTAPIVersionError:XTAPIVersionError,RenderingError:XTRenderingError,XTRenderingError:XTRenderingError,getClosingTagNotMatchOpeningTag:getClosingTagNotMatchOpeningTag,getLoopPositionProducesInvalidXMLError:getLoopPositionProducesInvalidXMLError,getScopeCompilationError:getScopeCompilationError,getScopeParserExecutionError:getScopeParserExecutionError,getUnclosedTagException:getUnclosedTagException,getUnopenedTagException:getUnopenedTagException,getUnmatchedLoopException:getUnmatchedLoopException,getDuplicateCloseTagException:getDuplicateCloseTagException,getDuplicateOpenTagException:getDuplicateOpenTagException,getCorruptCharactersException:getCorruptCharactersException,getUnbalancedLoopException:getUnbalancedLoopException,throwApiVersionError:throwApiVersionError,throwContentMustBeString:throwContentMustBeString,throwFileTypeNotHandled:throwFileTypeNotHandled,throwFileTypeNotIdentified:throwFileTypeNotIdentified,throwLocationInvalid:throwLocationInvalid,throwMalformedXml:throwMalformedXml,throwMultiError:throwMultiError,throwExpandNotFound:throwExpandNotFound,throwRawTagShouldBeOnlyTextInParagraph:throwRawTagShouldBeOnlyTextInParagraph,throwUnimplementedTagType:throwUnimplementedTagType,throwXmlTagNotFound:throwXmlTagNotFound,throwXmlInvalid:throwXmlInvalid,throwResolveBeforeCompile:throwResolveBeforeCompile,throwRenderInvalidTemplate:throwRenderInvalidTemplate}},{"./utils":24}],5:[function(require,module,exports){"use strict";var loopModule=require("./modules/loop");var spacePreserveModule=require("./modules/space-preserve");var rawXmlModule=require("./modules/rawxml");var expandPairTrait=require("./modules/expand-pair-trait");var render=require("./modules/render");function PptXFileTypeConfig(){return{getTemplatedFiles:function getTemplatedFiles(zip){var slideTemplates=zip.file(/ppt\/(slideMasters)\/(slideMaster)\d+\.xml/).map(function(file){return file.name});return slideTemplates.concat(["ppt/presentation.xml","docProps/app.xml","docProps/core.xml"])},textPath:function textPath(){return"ppt/slides/slide1.xml"},tagsXmlTextArray:["Company","HyperlinkBase","Manager","cp:category","cp:keywords","dc:creator","dc:description","dc:subject","dc:title","a:t","m:t","vt:lpstr"],tagsXmlLexedArray:["p:sp","a:tc","a:tr","a:table","a:p","a:r","a:rPr","p:txBody","a:txBody"],expandTags:[{contains:"a:tc",expand:"a:tr"}],onParagraphLoop:[{contains:"a:p",expand:"a:p",onlyTextInTag:true}],tagRawXml:"p:sp",tagTextXml:"a:t",baseModules:[loopModule,expandPairTrait,rawXmlModule,render],tagShouldContain:[{tag:"p:txBody",shouldContain:["a:p"],value:"<a:p></a:p>"},{tag:"a:txBody",shouldContain:["a:p"],value:"<a:p></a:p>"}]}}function DocXFileTypeConfig(){return{getTemplatedFiles:function getTemplatedFiles(zip){var baseTags=["docProps/core.xml","docProps/app.xml","word/settings.xml"];var headerFooters=zip.file(/word\/(header|footer)\d+\.xml/).map(function(file){return file.name});return headerFooters.concat(baseTags)},textPath:function textPath(doc){return doc.targets[0]},tagsXmlTextArray:["Company","HyperlinkBase","Manager","cp:category","cp:keywords","dc:creator","dc:description","dc:subject","dc:title","w:t","m:t","vt:lpstr"],tagsXmlLexedArray:["w:proofState","w:tc","w:tr","w:table","w:p","w:r","w:br","w:rPr","w:pPr","w:spacing","w:sdtContent","w:sectPr","w:headerReference","w:footerReference"],expandTags:[{contains:"w:tc",expand:"w:tr"}],onParagraphLoop:[{contains:"w:p",expand:"w:p",onlyTextInTag:true}],tagRawXml:"w:p",tagTextXml:"w:t",baseModules:[loopModule,spacePreserveModule,expandPairTrait,rawXmlModule,render],tagShouldContain:[{tag:"w:tc",shouldContain:["w:p"],value:"<w:p></w:p>"},{tag:"w:sdtContent",shouldContain:["w:p","w:r"],value:"<w:p></w:p>"}]}}module.exports={docx:DocXFileTypeConfig,pptx:PptXFileTypeConfig}},{"./modules/expand-pair-trait":12,"./modules/loop":13,"./modules/rawxml":14,"./modules/render":15,"./modules/space-preserve":16}],6:[function(require,module,exports){"use strict";var docxContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";var docxmContentType="application/vnd.ms-word.document.macroEnabled.main+xml";var pptxContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml";var dotxContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml";var dotmContentType="application/vnd.ms-word.template.macroEnabledTemplate.main+xml";var filetypes={docx:[docxContentType,docxmContentType,dotxContentType,dotmContentType],pptx:[pptxContentType]};module.exports=filetypes},{}],7:[function(require,module,exports){"use strict";var _require=require("./doc-utils"),endsWith=_require.endsWith,startsWith=_require.startsWith;var filetypes=require("./filetypes");function addEmptyParagraphAfterTable(parts){var beforeSectPr=false;for(var i=parts.length-1;i>=0;i--){var part=parts[i];if(startsWith(part,"<w:sectPr")){beforeSectPr=true}if(beforeSectPr){var trimmed=part.trim();if(endsWith(trimmed,"</w:tbl>")){parts.splice(i+1,0,"<w:p><w:r><w:t></w:t></w:r></w:p>");return parts}if(endsWith(trimmed,"</w:p>")){return parts}}}return parts}function joinUncorrupt(parts,options){var contains=options.fileTypeConfig.tagShouldContain||[];var collecting="";var currentlyCollecting=-1;if(!options.basePart&&filetypes.docx.indexOf(options.contentType)!==-1){parts=addEmptyParagraphAfterTable(parts)}return parts.reduce(function(full,part){for(var i=0,len=contains.length;i<len;i++){var _contains$i=contains[i],tag=_contains$i.tag,shouldContain=_contains$i.shouldContain,value=_contains$i.value;var startTagRegex=new RegExp("^(<(".concat(tag,")[^>]*>)$"),"g");if(currentlyCollecting===i){if(part==="</".concat(tag,">")){currentlyCollecting=-1;return full+collecting+value+part}collecting+=part;for(var j=0,len2=shouldContain.length;j<len2;j++){var sc=shouldContain[j];if(part.indexOf("<".concat(sc," "))!==-1||part.indexOf("<".concat(sc,">"))!==-1){currentlyCollecting=-1;return full+collecting}}return full}if(currentlyCollecting===-1&&startTagRegex.test(part)){if(part[part.length-2]==="/"){return full}currentlyCollecting=i;collecting=part;return full}}return full+part},"")}module.exports=joinUncorrupt},{"./doc-utils":3,"./filetypes":6}],8:[function(require,module,exports){"use strict";function _slicedToArray(arr,i){return _arrayWithHoles(arr)||_iterableToArrayLimit(arr,i)||_unsupportedIterableToArray(arr,i)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i]}return arr2}function _iterableToArrayLimit(arr,i){if(typeof Symbol==="undefined"||!(Symbol.iterator in Object(arr)))return;var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i["return"]!=null)_i["return"]()}finally{if(_d)throw _e}}return _arr}function _arrayWithHoles(arr){if(Array.isArray(arr))return arr}var _require=require("./errors"),getUnclosedTagException=_require.getUnclosedTagException,getUnopenedTagException=_require.getUnopenedTagException,getDuplicateOpenTagException=_require.getDuplicateOpenTagException,getDuplicateCloseTagException=_require.getDuplicateCloseTagException,throwMalformedXml=_require.throwMalformedXml,throwXmlInvalid=_require.throwXmlInvalid;var _require2=require("./doc-utils"),concatArrays=_require2.concatArrays,isTextStart=_require2.isTextStart,isTextEnd=_require2.isTextEnd;var NONE=-2;var EQUAL=0;var START=-1;var END=1;function inRange(range,match){return range[0]<=match.offset&&match.offset<range[1]}function updateInTextTag(part,inTextTag){if(isTextStart(part)){if(inTextTag){throwMalformedXml(part)}return true}if(isTextEnd(part)){if(!inTextTag){throwMalformedXml(part)}return false}return inTextTag}function getTag(tag){var position="";var start=1;var end=tag.indexOf(" ");if(tag[tag.length-2]==="/"){position="selfclosing";if(end===-1){end=tag.length-2}}else if(tag[1]==="/"){start=2;position="end";if(end===-1){end=tag.length-1}}else{position="start";if(end===-1){end=tag.length-1}}return{tag:tag.slice(start,end),position:position}}function tagMatcher(content,textMatchArray,othersMatchArray){var cursor=0;var contentLength=content.length;var allMatches=concatArrays([textMatchArray.map(function(tag){return{tag:tag,text:true}}),othersMatchArray.map(function(tag){return{tag:tag,text:false}})]).reduce(function(allMatches,t){allMatches[t.tag]=t.text;return allMatches},{});var totalMatches=[];while(cursor<contentLength){cursor=content.indexOf("<",cursor);if(cursor===-1){break}var offset=cursor;var nextOpening=content.indexOf("<",cursor+1);cursor=content.indexOf(">",cursor);if(cursor===-1||nextOpening!==-1&&cursor>nextOpening){throwXmlInvalid(content,offset)}var tagText=content.slice(offset,cursor+1);var _getTag=getTag(tagText),tag=_getTag.tag,position=_getTag.position;var text=allMatches[tag];if(text==null){continue}totalMatches.push({type:"tag",position:position,text:text,offset:offset,value:tagText,tag:tag})}return totalMatches}function getDelimiterErrors(delimiterMatches,fullText,ranges){if(delimiterMatches.length===0){return[]}var errors=[];var inDelimiter=false;var lastDelimiterMatch={offset:0};var xtag;var rangeIndex=0;delimiterMatches.forEach(function(delimiterMatch){while(ranges[rangeIndex+1]){if(ranges[rangeIndex+1].offset>delimiterMatch.offset){break}rangeIndex++}xtag=fullText.substr(lastDelimiterMatch.offset,delimiterMatch.offset-lastDelimiterMatch.offset);if(delimiterMatch.position==="start"&&inDelimiter||delimiterMatch.position==="end"&&!inDelimiter){if(delimiterMatch.position==="start"){if(lastDelimiterMatch.offset+lastDelimiterMatch.length===delimiterMatch.offset){xtag=fullText.substr(lastDelimiterMatch.offset,delimiterMatch.offset-lastDelimiterMatch.offset+lastDelimiterMatch.length+4);errors.push(getDuplicateOpenTagException({xtag:xtag,offset:lastDelimiterMatch.offset}))}else{errors.push(getUnclosedTagException({xtag:xtag,offset:lastDelimiterMatch.offset}))}delimiterMatch.error=true}else{if(lastDelimiterMatch.offset+lastDelimiterMatch.length===delimiterMatch.offset){xtag=fullText.substr(lastDelimiterMatch.offset-4,delimiterMatch.offset-lastDelimiterMatch.offset+4+lastDelimiterMatch.length);errors.push(getDuplicateCloseTagException({xtag:xtag,offset:lastDelimiterMatch.offset}))}else{errors.push(getUnopenedTagException({xtag:xtag,offset:delimiterMatch.offset}))}delimiterMatch.error=true}}else{inDelimiter=!inDelimiter}lastDelimiterMatch=delimiterMatch});var delimiterMatch={offset:fullText.length};xtag=fullText.substr(lastDelimiterMatch.offset,delimiterMatch.offset-lastDelimiterMatch.offset);if(inDelimiter){errors.push(getUnclosedTagException({xtag:xtag,offset:lastDelimiterMatch.offset}));delimiterMatch.error=true}return errors}function compareOffsets(startOffset,endOffset){if(startOffset===-1&&endOffset===-1){return NONE}if(startOffset===endOffset){return EQUAL}if(startOffset===-1||endOffset===-1){return endOffset<startOffset?START:END}return startOffset<endOffset?START:END}function splitDelimiters(inside){var newDelimiters=inside.split(" ");if(newDelimiters.length!==2){throw new Error("New Delimiters cannot be parsed")}var _newDelimiters=_slicedToArray(newDelimiters,2),start=_newDelimiters[0],end=_newDelimiters[1];if(start.length===0||end.length===0){throw new Error("New Delimiters cannot be parsed")}return[start,end]}function getAllIndexes(fullText,delimiters){var indexes=[];var start=delimiters.start,end=delimiters.end;var offset=-1;var insideTag=false;while(true){var startOffset=fullText.indexOf(start,offset+1);var endOffset=fullText.indexOf(end,offset+1);var position=null;var len=void 0;var compareResult=compareOffsets(startOffset,endOffset);if(compareResult===NONE){return indexes}if(compareResult===EQUAL){if(!insideTag){compareResult=START}else{compareResult=END}}if(compareResult===END){insideTag=false;offset=endOffset;position="end";len=end.length}if(compareResult===START){insideTag=true;offset=startOffset;position="start";len=start.length}if(position==="start"&&fullText[offset+start.length]==="="){indexes.push({offset:startOffset,position:"start",length:start.length,changedelimiter:true});var nextEqual=fullText.indexOf("=",offset+start.length+1);var _endOffset=fullText.indexOf(end,nextEqual+1);indexes.push({offset:_endOffset,position:"end",length:end.length,changedelimiter:true});var _insideTag=fullText.substr(offset+start.length+1,nextEqual-offset-start.length-1);var _splitDelimiters=splitDelimiters(_insideTag);var _splitDelimiters2=_slicedToArray(_splitDelimiters,2);start=_splitDelimiters2[0];end=_splitDelimiters2[1];offset=_endOffset;continue}indexes.push({offset:offset,position:position,length:len})}}function parseDelimiters(innerContentParts,delimiters){var full=innerContentParts.map(function(p){return p.value}).join("");var delimiterMatches=getAllIndexes(full,delimiters);var offset=0;var ranges=innerContentParts.map(function(part){offset+=part.value.length;return{offset:offset-part.value.length,lIndex:part.lIndex}});var errors=getDelimiterErrors(delimiterMatches,full,ranges);var cutNext=0;var delimiterIndex=0;var parsed=ranges.map(function(p,i){var offset=p.offset;var range=[offset,offset+innerContentParts[i].value.length];var partContent=innerContentParts[i].value;var delimitersInOffset=[];while(delimiterIndex<delimiterMatches.length&&inRange(range,delimiterMatches[delimiterIndex])){delimitersInOffset.push(delimiterMatches[delimiterIndex]);delimiterIndex++}var parts=[];var cursor=0;if(cutNext>0){cursor=cutNext;cutNext=0}var insideDelimiterChange;delimitersInOffset.forEach(function(delimiterInOffset){var value=partContent.substr(cursor,delimiterInOffset.offset-offset-cursor);if(value.length>0){if(insideDelimiterChange){if(delimiterInOffset.changedelimiter){cursor=delimiterInOffset.offset-offset+delimiterInOffset.length;insideDelimiterChange=delimiterInOffset.position==="start"}return}parts.push({type:"content",value:value,offset:cursor+offset});cursor+=value.length}var delimiterPart={type:"delimiter",position:delimiterInOffset.position,offset:cursor+offset};if(delimiterInOffset.error){delimiterPart.error=delimiterInOffset.error}if(delimiterInOffset.changedelimiter){insideDelimiterChange=delimiterInOffset.position==="start";cursor=delimiterInOffset.offset-offset+delimiterInOffset.length;return}parts.push(delimiterPart);cursor=delimiterInOffset.offset-offset+delimiterInOffset.length});cutNext=cursor-partContent.length;var value=partContent.substr(cursor);if(value.length>0){parts.push({type:"content",value:value,offset:offset})}return parts},this);return{parsed:parsed,errors:errors}}function getContentParts(xmlparsed){var inTextTag=false;var innerContentParts=[];xmlparsed.forEach(function(part){inTextTag=updateInTextTag(part,inTextTag);if(inTextTag&&part.type==="content"){innerContentParts.push(part)}});return innerContentParts}module.exports={parseDelimiters:parseDelimiters,parse:function parse(xmlparsed,delimiters){var inTextTag=false;var _parseDelimiters=parseDelimiters(getContentParts(xmlparsed),delimiters),delimiterParsed=_parseDelimiters.parsed,errors=_parseDelimiters.errors;var lexed=[];var index=0;xmlparsed.forEach(function(part){inTextTag=updateInTextTag(part,inTextTag);if(part.type==="content"){part.position=inTextTag?"insidetag":"outsidetag"}if(inTextTag&&part.type==="content"){Array.prototype.push.apply(lexed,delimiterParsed[index].map(function(p){if(p.type==="content"){p.position="insidetag"}return p}));index++}else{lexed.push(part)}});lexed=lexed.map(function(p,i){p.lIndex=i;return p});return{errors:errors,lexed:lexed}},xmlparse:function xmlparse(content,xmltags){var matches=tagMatcher(content,xmltags.text,xmltags.other);var cursor=0;var parsed=matches.reduce(function(parsed,match){var value=content.substr(cursor,match.offset-cursor);if(value.length>0){parsed.push({type:"content",value:value})}cursor=match.offset+match.value.length;delete match.offset;if(match.value.length>0){parsed.push(match)}return parsed},[]);var value=content.substr(cursor);if(value.length>0){parsed.push({type:"content",value:value})}return parsed}}},{"./doc-utils":3,"./errors":4}],9:[function(require,module,exports){"use strict";function getMinFromArrays(arrays,state){var minIndex=-1;for(var i=0,l=arrays.length;i<l;i++){if(state[i]>=arrays[i].length){continue}if(minIndex===-1||arrays[i][state[i]].offset<arrays[minIndex][state[minIndex]].offset){minIndex=i}}if(minIndex===-1){throw new Error("minIndex negative")}return minIndex}module.exports=function(arrays){var totalLength=arrays.reduce(function(sum,array){return sum+array.length},0);arrays=arrays.filter(function(array){return array.length>0});var resultArray=new Array(totalLength);var state=arrays.map(function(){return 0});var i=0;while(i<=totalLength-1){var arrayIndex=getMinFromArrays(arrays,state);resultArray[i]=arrays[arrayIndex][state[arrayIndex]];state[arrayIndex]++;i++}return resultArray}},{}],10:[function(require,module,exports){"use strict";function emptyFun(){}function identity(i){return i}module.exports=function(module){var defaults={set:emptyFun,parse:emptyFun,render:emptyFun,getTraits:emptyFun,getFileType:emptyFun,nullGetter:emptyFun,optionsTransformer:identity,postrender:identity,errorsTransformer:identity,getRenderedMap:identity,preparse:identity,postparse:identity,on:emptyFun,resolve:emptyFun};if(Object.keys(defaults).every(function(key){return!module[key]})){throw new Error("This module cannot be wrapped, because it doesn't define any of the necessary functions")}Object.keys(defaults).forEach(function(key){module[key]=module[key]||defaults[key]});return module}},{}],11:[function(require,module,exports){"use strict";function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var wrapper=require("../module-wrapper");var _require=require("../doc-utils"),concatArrays=_require.concatArrays;var filetypes=require("../filetypes");var Common=function(){function Common(){_classCallCheck(this,Common);this.name="Common"}_createClass(Common,[{key:"set",value:function set(_ref){var invertedContentTypes=_ref.invertedContentTypes;if(invertedContentTypes){this.invertedContentTypes=invertedContentTypes}}},{key:"getFileType",value:function getFileType(_ref2){var doc=_ref2.doc;var invertedContentTypes=this.invertedContentTypes;if(!this.invertedContentTypes){return}var keys=Object.keys(filetypes);for(var i=0,len=keys.length;i<len;i++){var ftCandidate=keys[i];var contentTypes=filetypes[ftCandidate];for(var j=0,len2=contentTypes.length;j<len2;j++){var ct=contentTypes[j];if(invertedContentTypes[ct]){doc.targets=concatArrays([doc.targets,invertedContentTypes[ct]]);return ftCandidate}}}}}]);return Common}();module.exports=function(){return wrapper(new Common)}},{"../doc-utils":3,"../filetypes":6,"../module-wrapper":10}],12:[function(require,module,exports){"use strict";var traitName="expandPair";var mergeSort=require("../mergesort");var _require=require("../doc-utils"),getLeft=_require.getLeft,getRight=_require.getRight;var wrapper=require("../module-wrapper");var _require2=require("../traits"),getExpandToDefault=_require2.getExpandToDefault;var _require3=require("../errors"),getUnmatchedLoopException=_require3.getUnmatchedLoopException,getClosingTagNotMatchOpeningTag=_require3.getClosingTagNotMatchOpeningTag,throwLocationInvalid=_require3.throwLocationInvalid,getUnbalancedLoopException=_require3.getUnbalancedLoopException;function getOpenCountChange(part){switch(part.location){case"start":return 1;case"end":return-1;default:throwLocationInvalid(part)}}function match(start,end){return start!=null&&end!=null&&(start.part.location==="start"&&end.part.location==="end"&&start.part.value===end.part.value||end.part.value==="")}function transformer(traits){var i=0;var errors=[];while(i<traits.length){var part=traits[i].part;if(part.location==="end"){if(i===0){traits.splice(0,1);errors.push(getUnmatchedLoopException(part));return{traits:traits,errors:errors}}var endIndex=i;var startIndex=i-1;var offseter=1;if(match(traits[startIndex],traits[endIndex])){traits.splice(endIndex,1);traits.splice(startIndex,1);return{errors:errors,traits:traits}}while(offseter<50){var startCandidate=traits[startIndex-offseter];var endCandidate=traits[endIndex+offseter];if(match(startCandidate,traits[endIndex])){traits.splice(endIndex,1);traits.splice(startIndex-offseter,1);return{errors:errors,traits:traits}}if(match(traits[startIndex],endCandidate)){traits.splice(endIndex+offseter,1);traits.splice(startIndex,1);return{errors:errors,traits:traits}}offseter++}errors.push(getClosingTagNotMatchOpeningTag({tags:[traits[startIndex].part,traits[endIndex].part]}));traits.splice(endIndex,1);traits.splice(startIndex,1);return{traits:traits,errors:errors}}if(traits[i]==null){break}i++}traits.forEach(function(_ref){var part=_ref.part;errors.push(getUnmatchedLoopException(part))});return{traits:[],errors:errors}}function getPairs(traits){var levelTraits={};var errors=[];var pairs=[];var countOpen=0;var transformedTraits=[];for(var i=0;i<traits.length;i++){var currentTrait=traits[i];var part=currentTrait.part;var change=getOpenCountChange(currentTrait.part);countOpen+=change;var level=void 0;if(change===1){level=countOpen-1}else{level=countOpen}transformedTraits.push({level:level,part:part})}while(transformedTraits.length>0){var result=transformer(transformedTraits);errors=errors.concat(result.errors);transformedTraits=result.traits}if(errors.length>0){return{pairs:pairs,errors:errors}}countOpen=0;for(var _i=0;_i<traits.length;_i++){var _currentTrait=traits[_i];var _part=_currentTrait.part;var _change=getOpenCountChange(_part);countOpen+=_change;if(_change===1){levelTraits[countOpen]=_currentTrait}else{var startTrait=levelTraits[countOpen+1];if(countOpen===0){pairs=pairs.concat([[startTrait,_currentTrait]])}}countOpen=countOpen>=0?countOpen:0}return{pairs:pairs,errors:errors}}var expandPairTrait={name:"ExpandPairTrait",optionsTransformer:function optionsTransformer(options,docxtemplater){this.expandTags=docxtemplater.fileTypeConfig.expandTags.concat(docxtemplater.options.paragraphLoop?docxtemplater.fileTypeConfig.onParagraphLoop:[]);return options},postparse:function postparse(postparsed,_ref2){var _this=this;var getTraits=_ref2.getTraits,postparse=_ref2.postparse;var traits=getTraits(traitName,postparsed);traits=traits.map(function(trait){return trait||[]});traits=mergeSort(traits);var _getPairs=getPairs(traits),pairs=_getPairs.pairs,errors=_getPairs.errors;var lastRight=0;var lastPair=null;var expandedPairs=pairs.map(function(pair){var expandTo=pair[0].part.expandTo;if(expandTo==="auto"){var result=getExpandToDefault(postparsed,pair,_this.expandTags);if(result.error){errors.push(result.error)}expandTo=result.value}if(!expandTo){var _left=pair[0].offset;var _right=pair[1].offset;if(_left<lastRight){errors.push(getUnbalancedLoopException(pair,lastPair))}lastPair=pair;lastRight=_right;return[_left,_right]}var left,right;try{left=getLeft(postparsed,expandTo,pair[0].offset)}catch(e){errors.push(e)}try{right=getRight(postparsed,expandTo,pair[1].offset)}catch(e){errors.push(e)}if(left<lastRight){errors.push(getUnbalancedLoopException(pair,lastPair))}lastRight=right;lastPair=pair;return[left,right]});if(errors.length>0){return{postparsed:postparsed,errors:errors}}var currentPairIndex=0;var innerParts;var newParsed=postparsed.reduce(function(newParsed,part,i){var inPair=currentPairIndex<pairs.length&&expandedPairs[currentPairIndex][0]<=i&&i<=expandedPairs[currentPairIndex][1];var pair=pairs[currentPairIndex];var expandedPair=expandedPairs[currentPairIndex];if(!inPair){newParsed.push(part);return newParsed}if(expandedPair[0]===i){innerParts=[]}if(pair[0].offset!==i&&pair[1].offset!==i){innerParts.push(part)}if(expandedPair[1]===i){var basePart=postparsed[pair[0].offset];basePart.subparsed=postparse(innerParts,{basePart:basePart});delete basePart.location;delete basePart.expandTo;newParsed.push(basePart);currentPairIndex++}return newParsed},[]);return{postparsed:newParsed,errors:errors}}};module.exports=function(){return wrapper(expandPairTrait)}},{"../doc-utils":3,"../errors":4,"../mergesort":9,"../module-wrapper":10,"../traits":23}],13:[function(require,module,exports){"use strict";function _toConsumableArray(arr){return _arrayWithoutHoles(arr)||_iterableToArray(arr)||_unsupportedIterableToArray(arr)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArray(iter){if(typeof Symbol!=="undefined"&&Symbol.iterator in Object(iter))return Array.from(iter)}function _arrayWithoutHoles(arr){if(Array.isArray(arr))return _arrayLikeToArray(arr)}function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable});keys.push.apply(keys,symbols)}return keys}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(Object(source),true).forEach(function(key){_defineProperty(target,key,source[key])})}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source))}else{ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key))})}}return target}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}function _slicedToArray(arr,i){return _arrayWithHoles(arr)||_iterableToArrayLimit(arr,i)||_unsupportedIterableToArray(arr,i)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i]}return arr2}function _iterableToArrayLimit(arr,i){if(typeof Symbol==="undefined"||!(Symbol.iterator in Object(arr)))return;var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i["return"]!=null)_i["return"]()}finally{if(_d)throw _e}}return _arr}function _arrayWithHoles(arr){if(Array.isArray(arr))return arr}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var _require=require("../doc-utils"),mergeObjects=_require.mergeObjects,chunkBy=_require.chunkBy,last=_require.last,isParagraphStart=_require.isParagraphStart,isParagraphEnd=_require.isParagraphEnd,isContent=_require.isContent,startsWith=_require.startsWith;var wrapper=require("../module-wrapper");var moduleName="loop";function hasContent(parts){return parts.some(function(part){return isContent(part)})}function getFirstMeaningFulPart(parsed){for(var i=0,len=parsed.length;i<len;i++){if(parsed[i].type!=="content"){return parsed[i]}}return null}function isInsideParagraphLoop(part){var firstMeaningfulPart=getFirstMeaningFulPart(part.subparsed);return firstMeaningfulPart!=null&&firstMeaningfulPart.tag!=="w:t"}function getPageBreakIfApplies(part){if(part.hasPageBreak){if(isInsideParagraphLoop(part)){return'<w:p><w:r><w:br w:type="page"/></w:r></w:p>'}}return""}function isEnclosedByParagraphs(parsed){if(parsed.length===0){return false}return isParagraphStart(parsed[0])&&isParagraphEnd(last(parsed))}function getOffset(chunk){return hasContent(chunk)?0:chunk.length}function addPageBreakAtEnd(subRendered){var found=false;var i=subRendered.parts.length-1;for(var j=subRendered.parts.length-1;i>=0;i--){var p=subRendered.parts[j];if(p==="</w:p>"&&!found){found=true;subRendered.parts.splice(j,0,'<w:r><w:br w:type="page"/></w:r>');break}}if(!found){subRendered.parts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')}}function addPageBreakAtBeginning(subRendered){subRendered.parts.unshift('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')}function addContinuousType(parts){var stop=false;var inSectPr=false;return parts.reduce(function(result,part){if(stop===false&&startsWith(part,"<w:sectPr")){inSectPr=true}if(inSectPr){if(startsWith(part,"<w:type")){stop=true}if(stop===false&&startsWith(part,"</w:sectPr")){result.push('<w:type w:val="continuous"/>')}}result.push(part);return result},[])}function dropHeaderFooterRefs(parts){return parts.filter(function(text){if(startsWith(text,"<w:headerReference")||startsWith(text,"<w:footerReference")){return false}return true})}function hasPageBreak(chunk){return chunk.some(function(part){if(part.tag==="w:br"&&part.value.indexOf('w:type="page"')!==-1){return true}})}function getSectPrHeaderFooterChangeCount(chunks){var collectSectPr=false;var sectPrCount=0;chunks.forEach(function(part){if(part.tag==="w:sectPr"&&part.position==="start"){collectSectPr=true}if(collectSectPr){if(part.tag==="w:headerReference"||part.tag==="w:footerReference"){sectPrCount++;collectSectPr=false}}if(part.tag==="w:sectPr"&&part.position==="end"){collectSectPr=false}});return sectPrCount}var LoopModule=function(){function LoopModule(){_classCallCheck(this,LoopModule);this.name="LoopModule";this.totalSectPr=0;this.prefix={start:"#",end:"/",dash:/^-([^\s]+)\s(.+)$/,inverted:"^"}}_createClass(LoopModule,[{key:"parse",value:function parse(placeHolderContent,_ref){var match=_ref.match,getValue=_ref.getValue,getValues=_ref.getValues;var module=moduleName;var type="placeholder";var _this$prefix=this.prefix,start=_this$prefix.start,inverted=_this$prefix.inverted,dash=_this$prefix.dash,end=_this$prefix.end;if(match(start,placeHolderContent)){return{type:type,value:getValue(start,placeHolderContent),expandTo:"auto",module:module,location:"start",inverted:false}}if(match(inverted,placeHolderContent)){return{type:type,value:getValue(inverted,placeHolderContent),expandTo:"auto",module:module,location:"start",inverted:true}}if(match(end,placeHolderContent)){return{type:type,value:getValue(end,placeHolderContent),module:module,location:"end"}}if(match(dash,placeHolderContent)){var _getValues=getValues(dash,placeHolderContent),_getValues2=_slicedToArray(_getValues,3),expandTo=_getValues2[1],value=_getValues2[2];return{type:type,value:value,expandTo:expandTo,module:module,location:"start",inverted:false}}return null}},{key:"getTraits",value:function getTraits(traitName,parsed){if(traitName!=="expandPair"){return}return parsed.reduce(function(tags,part,offset){if(part.type==="placeholder"&&part.module===moduleName&&part.subparsed==null){tags.push({part:part,offset:offset})}return tags},[])}},{key:"postparse",value:function postparse(parsed,_ref2){var basePart=_ref2.basePart;if(basePart){basePart.sectPrCount=getSectPrHeaderFooterChangeCount(parsed);basePart.sectPrIndex=this.totalSectPr;this.totalSectPr+=basePart.sectPrCount}if(!basePart||basePart.expandTo!=="auto"||basePart.module!==moduleName||!isEnclosedByParagraphs(parsed)){return parsed}var level=0;var chunks=chunkBy(parsed,function(p){if(isParagraphStart(p)){level++;if(level===1){return"start"}}if(isParagraphEnd(p)){level--;if(level===0){return"end"}}return null});if(chunks.length<=2){return parsed}var firstChunk=chunks[0];var lastChunk=last(chunks);var firstOffset=getOffset(firstChunk);var lastOffset=getOffset(lastChunk);basePart.hasPageBreak=hasPageBreak(lastChunk);basePart.hasPageBreakBeginning=hasPageBreak(firstChunk);if(firstOffset===0||lastOffset===0){return parsed}return parsed.slice(firstOffset,parsed.length-lastOffset)}},{key:"render",value:function render(part,options){if(part.type!=="placeholder"||part.module!==moduleName){return null}var totalValue=[];var errors=[];function loopOver(scope,i,length){var scopeManager=options.scopeManager.createSubScopeManager(scope,part.value,i,part,length);var subRendered=options.render(mergeObjects({},options,{compiled:part.subparsed,tags:{},scopeManager:scopeManager}));if(part.hasPageBreak&&i===length-1&&isInsideParagraphLoop(part)){addPageBreakAtEnd(subRendered)}var isNotFirst=scopeManager.scopePathItem.some(function(i){return i!==0});if(isNotFirst){if(part.sectPrCount===1){subRendered.parts=dropHeaderFooterRefs(subRendered.parts)}if(part.sectPrIndex===0){subRendered.parts=addContinuousType(subRendered.parts)}}if(part.hasPageBreakBeginning&&isInsideParagraphLoop(part)){addPageBreakAtBeginning(subRendered)}totalValue=totalValue.concat(subRendered.parts);errors=errors.concat(subRendered.errors||[])}var result;try{result=options.scopeManager.loopOver(part.value,loopOver,part.inverted,{part:part})}catch(e){errors.push(e);return{errors:errors}}if(result===false){return{value:getPageBreakIfApplies(part)||"",errors:errors}}return{value:options.joinUncorrupt(totalValue,_objectSpread(_objectSpread({},options),{},{basePart:part})),errors:errors}}},{key:"resolve",value:function resolve(part,options){if(part.type!=="placeholder"||part.module!==moduleName){return null}var sm=options.scopeManager;var promisedValue=sm.getValueAsync(part.value,{part:part});var promises=[];function loopOver(scope,i,length){var scopeManager=sm.createSubScopeManager(scope,part.value,i,part,length);promises.push(options.resolve({filePath:options.filePath,modules:options.modules,baseNullGetter:options.baseNullGetter,resolve:options.resolve,compiled:part.subparsed,tags:{},scopeManager:scopeManager}))}var errorList=[];return promisedValue.then(function(value){sm.loopOverValue(value,loopOver,part.inverted);return Promise.all(promises).then(function(r){return r.map(function(_ref3){var resolved=_ref3.resolved,errors=_ref3.errors;if(errors.length>0){errorList.push.apply(errorList,_toConsumableArray(errors))}return resolved})}).then(function(value){if(errorList.length>0){throw errorList}return value})})}}]);return LoopModule}();module.exports=function(){return wrapper(new LoopModule)}},{"../doc-utils":3,"../module-wrapper":10}],14:[function(require,module,exports){"use strict";function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var traits=require("../traits");var _require=require("../doc-utils"),isContent=_require.isContent;var _require2=require("../errors"),throwRawTagShouldBeOnlyTextInParagraph=_require2.throwRawTagShouldBeOnlyTextInParagraph;var moduleName="rawxml";var wrapper=require("../module-wrapper");function getInner(_ref){var part=_ref.part,left=_ref.left,right=_ref.right,postparsed=_ref.postparsed,index=_ref.index;var paragraphParts=postparsed.slice(left+1,right);paragraphParts.forEach(function(p,i){if(i===index-left-1){return}if(isContent(p)){throwRawTagShouldBeOnlyTextInParagraph({paragraphParts:paragraphParts,part:part})}});return part}var RawXmlModule=function(){function RawXmlModule(){_classCallCheck(this,RawXmlModule);this.name="RawXmlModule";this.prefix="@"}_createClass(RawXmlModule,[{key:"optionsTransformer",value:function optionsTransformer(options,docxtemplater){this.fileTypeConfig=docxtemplater.fileTypeConfig;return options}},{key:"parse",value:function parse(placeHolderContent,_ref2){var match=_ref2.match,getValue=_ref2.getValue;var type="placeholder";if(match(this.prefix,placeHolderContent)){return{type:type,value:getValue(this.prefix,placeHolderContent),module:moduleName}}return null}},{key:"postparse",value:function postparse(postparsed){return traits.expandToOne(postparsed,{moduleName:moduleName,getInner:getInner,expandTo:this.fileTypeConfig.tagRawXml,error:{message:"Raw tag not in paragraph",id:"raw_tag_outerxml_invalid",explanation:function explanation(part){return'The tag "'.concat(part.value,'" is not inside a paragraph, putting raw tags inside an inline loop is disallowed.')}}})}},{key:"render",value:function render(part,options){if(part.module!==moduleName){return null}var value;var errors=[];try{value=options.scopeManager.getValue(part.value,{part:part});if(value==null){value=options.nullGetter(part)}}catch(e){errors.push(e);return{errors:errors}}if(!value){return{value:""}}return{value:value}}},{key:"resolve",value:function resolve(part,options){if(part.type!=="placeholder"||part.module!==moduleName){return null}return options.scopeManager.getValueAsync(part.value,{part:part}).then(function(value){if(value==null){return options.nullGetter(part)}return value})}}]);return RawXmlModule}();module.exports=function(){return wrapper(new RawXmlModule)}},{"../doc-utils":3,"../errors":4,"../module-wrapper":10,"../traits":23}],15:[function(require,module,exports){"use strict";function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var wrapper=require("../module-wrapper");var _require=require("../errors"),getScopeCompilationError=_require.getScopeCompilationError;var _require2=require("../doc-utils"),utf8ToWord=_require2.utf8ToWord,hasCorruptCharacters=_require2.hasCorruptCharacters;var _require3=require("../errors"),getCorruptCharactersException=_require3.getCorruptCharactersException;var ftprefix={docx:"w",pptx:"a"};var Render=function(){function Render(){_classCallCheck(this,Render);this.name="Render";this.recordRun=false;this.recordedRun=[]}_createClass(Render,[{key:"set",value:function set(obj){if(obj.compiled){this.compiled=obj.compiled}if(obj.data!=null){this.data=obj.data}}},{key:"getRenderedMap",value:function getRenderedMap(mapper){var _this=this;return Object.keys(this.compiled).reduce(function(mapper,from){mapper[from]={from:from,data:_this.data};return mapper},mapper)}},{key:"optionsTransformer",value:function optionsTransformer(options,docxtemplater){this.parser=docxtemplater.parser;this.fileType=docxtemplater.fileType;return options}},{key:"postparse",value:function postparse(postparsed,options){var _this2=this;var errors=[];postparsed.forEach(function(p){if(p.type==="placeholder"){var tag=p.value;try{options.cachedParsers[p.lIndex]=_this2.parser(tag,{tag:p})}catch(rootError){errors.push(getScopeCompilationError({tag:tag,rootError:rootError,offset:p.offset}))}}});return{postparsed:postparsed,errors:errors}}},{key:"recordRuns",value:function recordRuns(part){if(part.tag==="".concat(ftprefix[this.fileType],":r")){this.recordRun=false;this.recordedRun=[]}else if(part.tag==="".concat(ftprefix[this.fileType],":rPr")){if(part.position==="start"){this.recordRun=true;this.recordedRun=[part.value]}if(part.position==="end"){this.recordedRun.push(part.value);this.recordRun=false}}else if(this.recordRun){this.recordedRun.push(part.value)}}},{key:"render",value:function render(part,_ref){var scopeManager=_ref.scopeManager,linebreaks=_ref.linebreaks,nullGetter=_ref.nullGetter;if(linebreaks){this.recordRuns(part)}if(part.type!=="placeholder"||part.module){return}var value;try{value=scopeManager.getValue(part.value,{part:part})}catch(e){return{errors:[e]}}if(value==null){value=nullGetter(part)}if(hasCorruptCharacters(value)){return{errors:[getCorruptCharactersException({tag:part.value,value:value,offset:part.offset})]}}if(typeof value!=="string"){value=value.toString()}if(linebreaks){return this.renderLineBreaks(value)}return{value:utf8ToWord(value)}}},{key:"renderLineBreaks",value:function renderLineBreaks(value){var p=ftprefix[this.fileType];var br=this.fileType==="docx"?"<w:r><w:br/></w:r>":"<a:br/>";var lines=value.split("\n");var runprops=this.recordedRun.join("");return{value:lines.map(function(line){return utf8ToWord(line)}).join("</".concat(p,":t></").concat(p,":r>").concat(br,"<").concat(p,":r>").concat(runprops,"<").concat(p,":t").concat(this.fileType==="docx"?' xml:space="preserve"':"",">"))}}}]);return Render}();module.exports=function(){return wrapper(new Render)}},{"../doc-utils":3,"../errors":4,"../module-wrapper":10}],16:[function(require,module,exports){"use strict";var wrapper=require("../module-wrapper");var _require=require("../doc-utils"),isTextStart=_require.isTextStart,isTextEnd=_require.isTextEnd,endsWith=_require.endsWith,startsWith=_require.startsWith;var wTpreserve='<w:t xml:space="preserve">';var wTpreservelen=wTpreserve.length;var wtEnd="</w:t>";var wtEndlen=wtEnd.length;function isWtStart(part){return isTextStart(part)&&part.tag==="w:t"}function addXMLPreserve(chunk,index){var tag=chunk[index].value;if(chunk[index+1].value==="</w:t>"){return tag}if(tag.indexOf('xml:space="preserve"')!==-1){return tag}return tag.substr(0,tag.length-1)+' xml:space="preserve">'}function isInsideLoop(meta,chunk){return meta&&meta.basePart&&chunk.length>1}var spacePreserve={name:"SpacePreserveModule",postparse:function postparse(postparsed,meta){var chunk=[],inTextTag=false,endLindex=0,lastTextTag=0;function isStartingPlaceHolder(part,chunk){return part.type==="placeholder"&&(!part.module||part.module==="loop")&&chunk.length>1}var result=postparsed.reduce(function(postparsed,part){if(isWtStart(part)){inTextTag=true;lastTextTag=chunk.length}if(!inTextTag){postparsed.push(part);return postparsed}chunk.push(part);if(isInsideLoop(meta,chunk)){endLindex=meta.basePart.endLindex;chunk[0].value=addXMLPreserve(chunk,0)}if(isStartingPlaceHolder(part,chunk)){chunk[lastTextTag].value=addXMLPreserve(chunk,lastTextTag);endLindex=part.endLindex}if(isTextEnd(part)&&part.lIndex>endLindex){if(endLindex!==0){chunk[lastTextTag].value=addXMLPreserve(chunk,lastTextTag)}Array.prototype.push.apply(postparsed,chunk);chunk=[];inTextTag=false;endLindex=0;lastTextTag=0}return postparsed},[]);Array.prototype.push.apply(result,chunk);return result},postrender:function postrender(parts){var lastNonEmpty="";var lastNonEmptyIndex=0;return parts.reduce(function(newParts,p,index){if(p===""){newParts.push(p);return newParts}if(p.indexOf('<w:t xml:space="preserve"></w:t>')!==-1){p=p.replace(/<w:t xml:space="preserve"><\/w:t>/g,"<w:t/>")}if(endsWith(lastNonEmpty,wTpreserve)&&startsWith(p,wtEnd)){newParts[lastNonEmptyIndex]=lastNonEmpty.substr(0,lastNonEmpty.length-wTpreservelen)+"<w:t/>";p=p.substr(wtEndlen)}lastNonEmpty=p;lastNonEmptyIndex=index;newParts.push(p);return newParts},[])}};module.exports=function(){return wrapper(spacePreserve)}},{"../doc-utils":3,"../module-wrapper":10}],17:[function(require,module,exports){"use strict";function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable});keys.push.apply(keys,symbols)}return keys}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(Object(source),true).forEach(function(key){_defineProperty(target,key,source[key])})}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source))}else{ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key))})}}return target}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}var _require=require("./doc-utils"),wordToUtf8=_require.wordToUtf8,concatArrays=_require.concatArrays;var _require2=require("./prefix-matcher"),match=_require2.match,getValue=_require2.getValue,getValues=_require2.getValues;function moduleParse(placeHolderContent,options){var modules=options.modules;var startOffset=options.startOffset;var endLindex=options.lIndex;var moduleParsed;options.offset=startOffset;options.lIndex=endLindex;options.match=match;options.getValue=getValue;options.getValues=getValues;for(var i=0,l=modules.length;i<l;i++){var _module=modules[i];moduleParsed=_module.parse(placeHolderContent,options);if(moduleParsed){moduleParsed.offset=startOffset;moduleParsed.endLindex=endLindex;moduleParsed.lIndex=endLindex;moduleParsed.raw=placeHolderContent;return moduleParsed}}return{type:"placeholder",value:placeHolderContent,offset:startOffset,endLindex:endLindex,lIndex:endLindex}}var parser={preparse:function preparse(parsed,modules,options){function preparse(parsed,options){return modules.forEach(function(module){module.preparse(parsed,options)})}return{preparsed:preparse(parsed,options)}},postparse:function postparse(postparsed,modules,options){function getTraits(traitName,postparsed){return modules.map(function(module){return module.getTraits(traitName,postparsed)})}var errors=[];function _postparse(postparsed,options){return modules.reduce(function(postparsed,module){var r=module.postparse(postparsed,_objectSpread(_objectSpread({},options),{},{postparse:function postparse(parsed,opts){return _postparse(parsed,_objectSpread(_objectSpread({},options),opts))},getTraits:getTraits}));if(r==null){return postparsed}if(r.errors){errors=concatArrays([errors,r.errors]);return r.postparsed}return r},postparsed)}return{postparsed:_postparse(postparsed,options),errors:errors}},parse:function parse(lexed,modules,options){var inPlaceHolder=false;var placeHolderContent="";var startOffset;var tailParts=[];return lexed.reduce(function lexedToParsed(parsed,token){if(token.type==="delimiter"){inPlaceHolder=token.position==="start";if(token.position==="end"){placeHolderContent=wordToUtf8(placeHolderContent);options.parse=function(placeHolderContent){return moduleParse(placeHolderContent,_objectSpread(_objectSpread(_objectSpread({},options),token),{},{startOffset:startOffset,modules:modules}))};parsed.push(options.parse(placeHolderContent));Array.prototype.push.apply(parsed,tailParts);tailParts=[]}if(token.position==="start"){tailParts=[];startOffset=token.offset}placeHolderContent="";return parsed}if(!inPlaceHolder){parsed.push(token);return parsed}if(token.type!=="content"||token.position!=="insidetag"){tailParts.push(token);return parsed}placeHolderContent+=token.value;return parsed},[])}};module.exports=parser},{"./doc-utils":3,"./prefix-matcher":19}],18:[function(require,module,exports){"use strict";function postrender(parts,options){for(var i=0,l=options.modules.length;i<l;i++){var _module=options.modules[i];parts=_module.postrender(parts,options)}return options.joinUncorrupt(parts,options)}module.exports=postrender},{}],19:[function(require,module,exports){"use strict";function match(condition,placeHolderContent){if(typeof condition==="string"){return placeHolderContent.substr(0,condition.length)===condition}if(condition instanceof RegExp){return condition.test(placeHolderContent)}}function getValue(condition,placeHolderContent){if(typeof condition==="string"){return placeHolderContent.substr(condition.length)}if(condition instanceof RegExp){return placeHolderContent.match(condition)[1]}}function getValues(condition,placeHolderContent){if(condition instanceof RegExp){return placeHolderContent.match(condition)}}module.exports={match:match,getValue:getValue,getValues:getValues}},{}],20:[function(require,module,exports){"use strict";var _require=require("./doc-utils"),concatArrays=_require.concatArrays;var _require2=require("./errors"),throwUnimplementedTagType=_require2.throwUnimplementedTagType;function moduleRender(part,options){var moduleRendered;for(var i=0,l=options.modules.length;i<l;i++){var _module=options.modules[i];moduleRendered=_module.render(part,options);if(moduleRendered){return moduleRendered}}return false}function render(options){var baseNullGetter=options.baseNullGetter;var compiled=options.compiled,scopeManager=options.scopeManager;options.nullGetter=function(part,sm){return baseNullGetter(part,sm||scopeManager)};if(!options.prefix){options.prefix=""}if(options.index){options.prefix=options.prefix+options.index+"-"}var errors=[];var parts=compiled.map(function(part,i){options.index=i;var moduleRendered=moduleRender(part,options);if(moduleRendered){if(moduleRendered.errors){errors=concatArrays([errors,moduleRendered.errors])}return moduleRendered.value}if(part.type==="content"||part.type==="tag"){return part.value}throwUnimplementedTagType(part,i)});return{errors:errors,parts:parts}}module.exports=render},{"./doc-utils":3,"./errors":4}],21:[function(require,module,exports){"use strict";function _toConsumableArray(arr){return _arrayWithoutHoles(arr)||_iterableToArray(arr)||_unsupportedIterableToArray(arr)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}function _iterableToArray(iter){if(typeof Symbol!=="undefined"&&Symbol.iterator in Object(iter))return Array.from(iter)}function _arrayWithoutHoles(arr){if(Array.isArray(arr))return _arrayLikeToArray(arr)}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i]}return arr2}function moduleResolve(part,options){var moduleResolved;for(var i=0,l=options.modules.length;i<l;i++){var _module=options.modules[i];moduleResolved=_module.resolve(part,options);if(moduleResolved){return moduleResolved}}return false}function resolve(options){var resolved=[];var baseNullGetter=options.baseNullGetter;var compiled=options.compiled,scopeManager=options.scopeManager;options.nullGetter=function(part,sm){return baseNullGetter(part,sm||scopeManager)};options.resolved=resolved;var errors=[];return Promise.all(compiled.filter(function(part){return["content","tag"].indexOf(part.type)===-1}).reduce(function(promises,part){var moduleResolved=moduleResolve(part,options);var result;if(moduleResolved){result=moduleResolved.then(function(value){resolved.push({tag:part.value,value:value,lIndex:part.lIndex})})}else if(part.type==="placeholder"){result=scopeManager.getValueAsync(part.value,{part:part}).then(function(value){if(value==null){value=options.nullGetter(part)}resolved.push({tag:part.value,value:value,lIndex:part.lIndex});return value})}else{return}promises.push(result["catch"](function(e){if(e.length>1){errors.push.apply(errors,_toConsumableArray(e))}else{errors.push(e)}}));return promises},[])).then(function(){return{errors:errors,resolved:resolved}})}module.exports=resolve},{}],22:[function(require,module,exports){"use strict";function _slicedToArray(arr,i){return _arrayWithHoles(arr)||_iterableToArrayLimit(arr,i)||_unsupportedIterableToArray(arr,i)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i]}return arr2}function _iterableToArrayLimit(arr,i){if(typeof Symbol==="undefined"||!(Symbol.iterator in Object(arr)))return;var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i["return"]!=null)_i["return"]()}finally{if(_d)throw _e}}return _arr}function _arrayWithHoles(arr){if(Array.isArray(arr))return arr}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var _require=require("./errors"),getScopeParserExecutionError=_require.getScopeParserExecutionError;var _require2=require("./utils"),last=_require2.last;var _require3=require("./doc-utils"),concatArrays=_require3.concatArrays;function find(list,fn){var length=list.length>>>0;var value;for(var i=0;i<length;i++){value=list[i];if(fn.call(this,value,i,list)){return value}}return undefined}function _getValue(tag,meta,num){var _this=this;var scope=this.scopeList[num];if(this.root.finishedResolving){var w=this.resolved;this.scopePath.forEach(function(p,index){var lIndex=_this.scopeLindex[index];w=find(w,function(r){return r.lIndex===lIndex});w=w.value[_this.scopePathItem[index]]});return[this.scopePath.length-1,find(w,function(r){return meta.part.lIndex===r.lIndex}).value]}var result;var parser;if(!this.cachedParsers||!meta.part){parser=this.parser(tag,{scopePath:this.scopePath})}else if(this.cachedParsers[meta.part.lIndex]){parser=this.cachedParsers[meta.part.lIndex]}else{parser=this.cachedParsers[meta.part.lIndex]=this.parser(tag,{scopePath:this.scopePath})}try{result=parser.get(scope,this.getContext(meta,num))}catch(error){throw getScopeParserExecutionError({tag:tag,scope:scope,error:error,offset:meta.part.offset})}if(result==null&&num>0){return _getValue.call(this,tag,meta,num-1)}return[num,result]}function _getValueAsync(tag,meta,num){var _this2=this;var scope=this.scopeList[num];var parser;if(!this.cachedParsers||!meta.part){parser=this.parser(tag,{scopePath:this.scopePath})}else if(this.cachedParsers[meta.part.lIndex]){parser=this.cachedParsers[meta.part.lIndex]}else{parser=this.cachedParsers[meta.part.lIndex]=this.parser(tag,{scopePath:this.scopePath})}return Promise.resolve().then(function(){return parser.get(scope,_this2.getContext(meta,num))})["catch"](function(error){throw getScopeParserExecutionError({tag:tag,scope:scope,error:error,offset:meta.part.offset})}).then(function(result){if(result==null&&num>0){return _getValueAsync.call(_this2,tag,meta,num-1)}return result})}var ScopeManager=function(){function ScopeManager(options){_classCallCheck(this,ScopeManager);this.root=options.root||this;this.scopePath=options.scopePath;this.scopePathItem=options.scopePathItem;this.scopePathLength=options.scopePathLength;this.scopeList=options.scopeList;this.scopeLindex=options.scopeLindex;this.parser=options.parser;this.resolved=options.resolved;this.cachedParsers=options.cachedParsers}_createClass(ScopeManager,[{key:"loopOver",value:function loopOver(tag,functor,inverted,meta){return this.loopOverValue(this.getValue(tag,meta),functor,inverted)}},{key:"functorIfInverted",value:function functorIfInverted(inverted,functor,value,i,length){if(inverted){functor(value,i,length)}return inverted}},{key:"isValueFalsy",value:function isValueFalsy(value,type){return value==null||!value||type==="[object Array]"&&value.length===0}},{key:"loopOverValue",value:function loopOverValue(value,functor,inverted){if(this.root.finishedResolving){inverted=false}var type=Object.prototype.toString.call(value);if(this.isValueFalsy(value,type)){return this.functorIfInverted(inverted,functor,last(this.scopeList),0,1)}if(type==="[object Array]"){for(var i=0;i<value.length;i++){this.functorIfInverted(!inverted,functor,value[i],i,value.length)}return true}if(type==="[object Object]"){return this.functorIfInverted(!inverted,functor,value,0,1)}return this.functorIfInverted(!inverted,functor,last(this.scopeList),0,1)}},{key:"getValue",value:function getValue(tag,meta){var _getValue$call=_getValue.call(this,tag,meta,this.scopeList.length-1),_getValue$call2=_slicedToArray(_getValue$call,2),num=_getValue$call2[0],result=_getValue$call2[1];this.num=num;return result}},{key:"getValueAsync",value:function getValueAsync(tag,meta){return _getValueAsync.call(this,tag,meta,this.scopeList.length-1)}},{key:"getContext",value:function getContext(meta,num){return{num:num,meta:meta,scopeList:this.scopeList,resolved:this.resolved,scopePath:this.scopePath,scopePathItem:this.scopePathItem,scopePathLength:this.scopePathLength}}},{key:"createSubScopeManager",value:function createSubScopeManager(scope,tag,i,part,length){return new ScopeManager({root:this.root,resolved:this.resolved,parser:this.parser,cachedParsers:this.cachedParsers,scopeList:concatArrays([this.scopeList,[scope]]),scopePath:concatArrays([this.scopePath,[tag]]),scopePathItem:concatArrays([this.scopePathItem,[i]]),scopePathLength:concatArrays([this.scopePathLength,[length]]),scopeLindex:concatArrays([this.scopeLindex,[part.lIndex]])})}}]);return ScopeManager}();module.exports=function(options){options.scopePath=[];options.scopePathItem=[];options.scopePathLength=[];options.scopeLindex=[];options.scopeList=[options.tags];return new ScopeManager(options)}},{"./doc-utils":3,"./errors":4,"./utils":24}],23:[function(require,module,exports){"use strict";function _toConsumableArray(arr){return _arrayWithoutHoles(arr)||_iterableToArray(arr)||_unsupportedIterableToArray(arr)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}function _iterableToArray(iter){if(typeof Symbol!=="undefined"&&Symbol.iterator in Object(iter))return Array.from(iter)}function _arrayWithoutHoles(arr){if(Array.isArray(arr))return _arrayLikeToArray(arr)}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i]}return arr2}function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable});keys.push.apply(keys,symbols)}return keys}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(Object(source),true).forEach(function(key){_defineProperty(target,key,source[key])})}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source))}else{ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key))})}}return target}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}function _typeof(obj){"@babel/helpers - typeof";if(typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"){_typeof=function _typeof(obj){return typeof obj}}else{_typeof=function _typeof(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj}}return _typeof(obj)}var _require=require("./doc-utils"),getRightOrNull=_require.getRightOrNull,getRight=_require.getRight,getLeft=_require.getLeft,getLeftOrNull=_require.getLeftOrNull,chunkBy=_require.chunkBy,isTagStart=_require.isTagStart,isTagEnd=_require.isTagEnd,isContent=_require.isContent,last=_require.last,first=_require.first;var _require2=require("./errors"),XTTemplateError=_require2.XTTemplateError,throwExpandNotFound=_require2.throwExpandNotFound,getLoopPositionProducesInvalidXMLError=_require2.getLoopPositionProducesInvalidXMLError;function lastTagIsOpenTag(tags,tag){if(tags.length===0){return false}var innerLastTag=last(tags).tag.substr(1);var innerCurrentTag=tag.substr(2,tag.length-3);return innerLastTag.indexOf(innerCurrentTag)===0}function addTag(tags,tag){tags.push({tag:tag});return tags}function getListXmlElements(parts){var tags=parts.filter(function(part){return part.type==="tag"});var result=[];for(var i=0,tag;i<tags.length;i++){tag=tags[i].value;if(tag[1]==="/"){if(lastTagIsOpenTag(result,tag)){result.pop()}else{result=addTag(result,tag)}}else if(tag[tag.length-2]!=="/"){result=addTag(result,tag)}}return result}function has(name,xmlElements){for(var i=0;i<xmlElements.length;i++){var xmlElement=xmlElements[i];if(xmlElement.tag.indexOf("<".concat(name))===0){return true}}return false}function getExpandToDefault(postparsed,pair,expandTags){var parts=postparsed.slice(pair[0].offset,pair[1].offset);var xmlElements=getListXmlElements(parts);var closingTagCount=xmlElements.filter(function(xmlElement){return xmlElement.tag[1]==="/"}).length;var startingTagCount=xmlElements.filter(function(xmlElement){var tag=xmlElement.tag;return tag[1]!=="/"&&tag[tag.length-2]!=="/"}).length;if(closingTagCount!==startingTagCount){return{error:getLoopPositionProducesInvalidXMLError({tag:first(pair).part.value,offset:[first(pair).part.offset,last(pair).part.offset]})}}var _loop=function _loop(i,len){var _expandTags$i=expandTags[i],contains=_expandTags$i.contains,expand=_expandTags$i.expand,onlyTextInTag=_expandTags$i.onlyTextInTag;if(has(contains,xmlElements)){if(onlyTextInTag){var left=getLeftOrNull(postparsed,contains,pair[0].offset);var right=getRightOrNull(postparsed,contains,pair[1].offset);if(left===null||right===null){return"continue"}var chunks=chunkBy(postparsed.slice(left,right),function(p){if(isTagStart(contains,p)){return"start"}if(isTagEnd(contains,p)){return"end"}return null});if(chunks.length<=2){return"continue"}var firstChunk=first(chunks);var lastChunk=last(chunks);var firstContent=firstChunk.filter(isContent);var lastContent=lastChunk.filter(isContent);if(firstContent.length!==1||lastContent.length!==1){return"continue"}}return{v:{value:expand}}}};for(var i=0,len=expandTags.length;i<len;i++){var _ret=_loop(i,len);if(_ret==="continue")continue;if(_typeof(_ret)==="object")return _ret.v}return false}function expandOne(part,index,postparsed,options){var expandTo=part.expandTo||options.expandTo;if(!expandTo){return postparsed}var right,left;try{left=getLeft(postparsed,expandTo,index);right=getRight(postparsed,expandTo,index)}catch(rootError){if(rootError instanceof XTTemplateError){throwExpandNotFound(_objectSpread({part:part,rootError:rootError,postparsed:postparsed,expandTo:expandTo,index:index},options.error))}throw rootError}var leftParts=postparsed.slice(left,index);var rightParts=postparsed.slice(index+1,right+1);var inner=options.getInner({postparse:options.postparse,index:index,part:part,leftParts:leftParts,rightParts:rightParts,left:left,right:right,postparsed:postparsed});if(!inner.length){inner.expanded=[leftParts,rightParts];inner=[inner]}return{left:left,right:right,inner:inner}}function expandToOne(postparsed,options){var errors=[];if(postparsed.errors){errors=postparsed.errors;postparsed=postparsed.postparsed}var results=[];for(var i=0,len=postparsed.length;i<len;i++){var part=postparsed[i];if(part.type==="placeholder"&&part.module===options.moduleName){try{var result=expandOne(part,i,postparsed,options);i=result.right;results.push(result)}catch(error){if(error instanceof XTTemplateError){errors.push(error)}else{throw error}}}}var newParsed=[];var currentResult=0;for(var _i=0,_len=postparsed.length;_i<_len;_i++){var _part=postparsed[_i];var _result=results[currentResult];if(_result&&_result.left===_i){newParsed.push.apply(newParsed,_toConsumableArray(results[currentResult].inner));currentResult++;_i=_result.right}else{newParsed.push(_part)}}return{postparsed:newParsed,errors:errors}}module.exports={expandToOne:expandToOne,getExpandToDefault:getExpandToDefault}},{"./doc-utils":3,"./errors":4}],24:[function(require,module,exports){"use strict";function last(a){return a[a.length-1]}function first(a){return a[0]}module.exports={last:last,first:first}},{}],25:[function(require,module,exports){"use strict";var _require=require("./doc-utils"),pregMatchAll=_require.pregMatchAll;function handleRecursiveCase(res){function replacerUnshift(){var pn={array:Array.prototype.slice.call(arguments)};pn.array.shift();var match=pn.array[0]+pn.array[1];pn.array.unshift(match);pn.array.pop();var offset=pn.array.pop();pn.offset=offset;pn.first=true;res.matches.unshift(pn)}if(res.content.indexOf("<")===-1&&res.content.indexOf(">")===-1){res.content.replace(/^()([^<>]*)$/,replacerUnshift)}var r=new RegExp("^()([^<]+)</(?:".concat(res.tagsXmlArrayJoined,")>"));res.content.replace(r,replacerUnshift);function replacerPush(){var pn={array:Array.prototype.slice.call(arguments)};pn.array.pop();var offset=pn.array.pop();pn.offset=offset;pn.last=true;if(pn.array[0].indexOf("/>")!==-1){return}res.matches.push(pn)}r=new RegExp("(<(?:".concat(res.tagsXmlArrayJoined,")[^>]*>)([^>]+)$"));res.content.replace(r,replacerPush);return res}module.exports=function xmlMatcher(content,tagsXmlArray){var res={};res.content=content;res.tagsXmlArray=tagsXmlArray;res.tagsXmlArrayJoined=res.tagsXmlArray.join("|");var regexp=new RegExp("(?:(<(?:".concat(res.tagsXmlArrayJoined,")[^>]*>)([^<>]*)</(?:").concat(res.tagsXmlArrayJoined,")>)|(<(?:").concat(res.tagsXmlArrayJoined,")[^>]*/>)"),"g");res.matches=pregMatchAll(regexp,res.content);return handleRecursiveCase(res)}},{"./doc-utils":3}],26:[function(require,module,exports){"use strict";function _typeof(obj){"@babel/helpers - typeof";if(typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"){_typeof=function _typeof(obj){return typeof obj}}else{_typeof=function _typeof(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj}}return _typeof(obj)}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var _require=require("./doc-utils"),wordToUtf8=_require.wordToUtf8,convertSpaces=_require.convertSpaces,defaults=_require.defaults;var xmlMatcher=require("./xml-matcher");var _require2=require("./errors"),throwContentMustBeString=_require2.throwContentMustBeString;var Lexer=require("./lexer");var Parser=require("./parser.js");var _render=require("./render.js");var postrender=require("./postrender.js");var resolve=require("./resolve.js");var joinUncorrupt=require("./join-uncorrupt");function _getFullText(content,tagsXmlArray){var matcher=xmlMatcher(content,tagsXmlArray);var result=matcher.matches.map(function(match){return match.array[2]});return wordToUtf8(convertSpaces(result.join("")))}module.exports=function(){function XmlTemplater(content,options){_classCallCheck(this,XmlTemplater);this.filePath=options.filePath;this.cachedParsers={};this.modules=options.modules;this.fileTypeConfig=options.fileTypeConfig;this.contentType=options.contentType;Object.keys(defaults).map(function(key){this[key]=options[key]!=null?options[key]:defaults[key]},this);this.setModules({inspect:{filePath:this.filePath}});this.load(content)}_createClass(XmlTemplater,[{key:"load",value:function load(content){if(typeof content!=="string"){throwContentMustBeString(_typeof(content))}this.content=content}},{key:"setTags",value:function setTags(tags){this.tags=tags!=null?tags:{};return this}},{key:"resolveTags",value:function resolveTags(tags){var _this=this;this.tags=tags!=null?tags:{};var options=this.getOptions();options.scopeManager=this.scopeManager;options.resolve=resolve;return resolve(options).then(function(_ref){var resolved=_ref.resolved,errors=_ref.errors;errors.forEach(function(error){error.properties=error.properties||{};error.properties.file=_this.filePath});if(errors.length!==0){throw errors}return Promise.all(resolved).then(function(resolved){options.scopeManager.finishedResolving=true;options.scopeManager.resolved=resolved;_this.setModules({inspect:{resolved:resolved}});return resolved})})}},{key:"getFullText",value:function getFullText(){return _getFullText(this.content,this.fileTypeConfig.tagsXmlTextArray)}},{key:"setModules",value:function setModules(obj){this.modules.forEach(function(module){module.set(obj)})}},{key:"preparse",value:function preparse(){this.allErrors=[];this.xmllexed=Lexer.xmlparse(this.content,{text:this.fileTypeConfig.tagsXmlTextArray,other:this.fileTypeConfig.tagsXmlLexedArray});this.setModules({inspect:{xmllexed:this.xmllexed}});var _Lexer$parse=Lexer.parse(this.xmllexed,this.delimiters),lexed=_Lexer$parse.lexed,lexerErrors=_Lexer$parse.errors;this.allErrors=this.allErrors.concat(lexerErrors);this.lexed=lexed;this.setModules({inspect:{lexed:this.lexed}});var options=this.getOptions();Parser.preparse(this.lexed,this.modules,options)}},{key:"parse",value:function parse(){this.setModules({inspect:{filePath:this.filePath}});var options=this.getOptions();this.parsed=Parser.parse(this.lexed,this.modules,options);this.setModules({inspect:{parsed:this.parsed}});var _Parser$postparse=Parser.postparse(this.parsed,this.modules,options),postparsed=_Parser$postparse.postparsed,postparsedErrors=_Parser$postparse.errors;this.postparsed=postparsed;this.setModules({inspect:{postparsed:this.postparsed}});this.allErrors=this.allErrors.concat(postparsedErrors);this.errorChecker(this.allErrors);return this}},{key:"errorChecker",value:function errorChecker(errors){var _this2=this;if(errors.length){errors.forEach(function(error){error.properties=error.properties||{};error.properties.file=_this2.filePath});this.modules.forEach(function(module){errors=module.errorsTransformer(errors)})}}},{key:"baseNullGetter",value:function baseNullGetter(part,sm){var _this3=this;var value=this.modules.reduce(function(value,module){if(value!=null){return value}return module.nullGetter(part,sm,_this3)},null);if(value!=null){return value}return this.nullGetter(part,sm)}},{key:"getOptions",value:function getOptions(){return{compiled:this.postparsed,cachedParsers:this.cachedParsers,tags:this.tags,modules:this.modules,parser:this.parser,contentType:this.contentType,baseNullGetter:this.baseNullGetter.bind(this),filePath:this.filePath,fileTypeConfig:this.fileTypeConfig,linebreaks:this.linebreaks}}},{key:"render",value:function render(to){this.filePath=to;var options=this.getOptions();options.resolved=this.scopeManager.resolved;options.scopeManager=this.scopeManager;options.render=_render;options.joinUncorrupt=joinUncorrupt;var _render2=_render(options),errors=_render2.errors,parts=_render2.parts;this.allErrors=errors;this.errorChecker(errors);if(errors.length>0){return this}this.content=postrender(parts,options);this.setModules({inspect:{content:this.content}});return this}}]);return XmlTemplater}()},{"./doc-utils":3,"./errors":4,"./join-uncorrupt":7,"./lexer":8,"./parser.js":17,"./postrender.js":18,"./render.js":20,"./resolve.js":21,"./xml-matcher":25}],"/src/js/docxtemplater.js":[function(require,module,exports){"use strict";function _objectWithoutProperties(source,excluded){if(source==null)return{};var target=_objectWithoutPropertiesLoose(source,excluded);var key,i;if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++){key=sourceSymbolKeys[i];if(excluded.indexOf(key)>=0)continue;if(!Object.prototype.propertyIsEnumerable.call(source,key))continue;target[key]=source[key]}}return target}function _objectWithoutPropertiesLoose(source,excluded){if(source==null)return{};var target={};var sourceKeys=Object.keys(source);var key,i;for(i=0;i<sourceKeys.length;i++){key=sourceKeys[i];if(excluded.indexOf(key)>=0)continue;target[key]=source[key]}return target}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var DocUtils=require("./doc-utils");DocUtils.traits=require("./traits");DocUtils.moduleWrapper=require("./module-wrapper");var createScope=require("./scope-manager");var _require=require("./errors"),throwMultiError=_require.throwMultiError,throwResolveBeforeCompile=_require.throwResolveBeforeCompile,throwRenderInvalidTemplate=_require.throwRenderInvalidTemplate;var collectContentTypes=require("./collect-content-types");var ctXML="[Content_Types].xml";var commonModule=require("./modules/common");var Lexer=require("./lexer");var defaults=DocUtils.defaults,str2xml=DocUtils.str2xml,xml2str=DocUtils.xml2str,moduleWrapper=DocUtils.moduleWrapper,utf8ToWord=DocUtils.utf8ToWord,concatArrays=DocUtils.concatArrays,unique=DocUtils.unique;var _require2=require("./errors"),XTInternalError=_require2.XTInternalError,throwFileTypeNotIdentified=_require2.throwFileTypeNotIdentified,throwFileTypeNotHandled=_require2.throwFileTypeNotHandled,throwApiVersionError=_require2.throwApiVersionError;var currentModuleApiVersion=[3,25,0];var Docxtemplater=function(){function Docxtemplater(zip){var _this=this;var _ref=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{},_ref$modules=_ref.modules,modules=_ref$modules===void 0?[]:_ref$modules,options=_objectWithoutProperties(_ref,["modules"]);_classCallCheck(this,Docxtemplater);if(!Array.isArray(modules)){throw new Error("The modules argument of docxtemplater's constructor must be an array")}this.scopeManagers={};this.compiled={};this.modules=[commonModule()];this.setOptions(options);modules.forEach(function(module){_this.attachModule(module)});if(arguments.length>0){if(!zip||!zip.files||typeof zip.file!=="function"){throw new Error("The first argument of docxtemplater's constructor must be a valid zip file (jszip v2 or pizzip v3)")}this.loadZip(zip);this.modules=this.modules.filter(function(module){if(module.supportedFileTypes){if(!Array.isArray(module.supportedFileTypes)){throw new Error("The supportedFileTypes field of the module must be an array")}var isSupportedModule=module.supportedFileTypes.indexOf(_this.fileType)!==-1;if(!isSupportedModule){module.on("detached")}return isSupportedModule}return true});this.compile();this.v4Constructor=true}}_createClass(Docxtemplater,[{key:"getModuleApiVersion",value:function getModuleApiVersion(){return currentModuleApiVersion.join(".")}},{key:"verifyApiVersion",value:function verifyApiVersion(neededVersion){neededVersion=neededVersion.split(".").map(function(i){return parseInt(i,10)});if(neededVersion.length!==3){throwApiVersionError("neededVersion is not a valid version",{neededVersion:neededVersion,explanation:"the neededVersion must be an array of length 3"})}if(neededVersion[0]!==currentModuleApiVersion[0]){throwApiVersionError("The major api version do not match, you probably have to update docxtemplater with npm install --save docxtemplater",{neededVersion:neededVersion,currentModuleApiVersion:currentModuleApiVersion,explanation:"moduleAPIVersionMismatch : needed=".concat(neededVersion.join("."),", current=").concat(currentModuleApiVersion.join("."))})}if(neededVersion[1]>currentModuleApiVersion[1]){throwApiVersionError("The minor api version is not uptodate, you probably have to update docxtemplater with npm install --save docxtemplater",{neededVersion:neededVersion,currentModuleApiVersion:currentModuleApiVersion,explanation:"moduleAPIVersionMismatch : needed=".concat(neededVersion.join("."),", current=").concat(currentModuleApiVersion.join("."))})}if(neededVersion[1]===currentModuleApiVersion[1]&&neededVersion[2]>currentModuleApiVersion[2]){throwApiVersionError("The patch api version is not uptodate, you probably have to update docxtemplater with npm install --save docxtemplater",{neededVersion:neededVersion,currentModuleApiVersion:currentModuleApiVersion,explanation:"moduleAPIVersionMismatch : needed=".concat(neededVersion.join("."),", current=").concat(currentModuleApiVersion.join("."))})}return true}},{key:"setModules",value:function setModules(obj){this.modules.forEach(function(module){module.set(obj)})}},{key:"sendEvent",value:function sendEvent(eventName){this.modules.forEach(function(module){module.on(eventName)})}},{key:"attachModule",value:function attachModule(module){var options=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};if(this.v4Constructor){throw new Error("attachModule() should not be called manually when using the v4 constructor")}if(module.requiredAPIVersion){this.verifyApiVersion(module.requiredAPIVersion)}if(module.attached===true){throw new Error('Cannot attach a module that was already attached : "'.concat(module.name,'". Maybe you are instantiating the module at the root level, and using it for multiple instances of Docxtemplater'))}module.attached=true;var prefix=options.prefix;if(prefix){module.prefix=prefix}var wrappedModule=moduleWrapper(module);this.modules.push(wrappedModule);wrappedModule.on("attached");return this}},{key:"setOptions",value:function setOptions(options){var _this2=this;if(this.v4Constructor){throw new Error("setOptions() should not be called manually when using the v4 constructor")}if(!options){throw new Error("setOptions should be called with an object as first parameter")}if(options.delimiters){options.delimiters.start=utf8ToWord(options.delimiters.start);options.delimiters.end=utf8ToWord(options.delimiters.end)}this.options={};Object.keys(defaults).forEach(function(key){var defaultValue=defaults[key];_this2.options[key]=options[key]!=null?options[key]:defaultValue;_this2[key]=_this2.options[key]});if(this.zip){this.updateFileTypeConfig()}return this}},{key:"loadZip",value:function loadZip(zip){if(zip.loadAsync){throw new XTInternalError("Docxtemplater doesn't handle JSZip version >=3, please use pizzip")}this.zip=zip;this.updateFileTypeConfig();this.modules=concatArrays([this.fileTypeConfig.baseModules.map(function(moduleFunction){return moduleFunction()}),this.modules]);return this}},{key:"compileFile",value:function compileFile(fileName){this.compiled[fileName].parse()}},{key:"precompileFile",value:function precompileFile(fileName){var currentFile=this.createTemplateClass(fileName);currentFile.preparse();this.compiled[fileName]=currentFile}},{key:"getScopeManager",value:function getScopeManager(to,currentFile,tags){if(!this.scopeManagers[to]){this.scopeManagers[to]=createScope({tags:tags||{},parser:this.parser,cachedParsers:currentFile.cachedParsers})}return this.scopeManagers[to]}},{key:"resolveData",value:function resolveData(data){var _this3=this;var errors=[];if(!Object.keys(this.compiled).length){throwResolveBeforeCompile()}return Promise.resolve(data).then(function(data){_this3.setData(data);_this3.setModules({data:_this3.data,Lexer:Lexer});_this3.mapper=_this3.modules.reduce(function(value,module){return module.getRenderedMap(value)},{});return Promise.all(Object.keys(_this3.mapper).map(function(to){var _this3$mapper$to=_this3.mapper[to],from=_this3$mapper$to.from,data=_this3$mapper$to.data;return Promise.resolve(data).then(function(data){var currentFile=_this3.compiled[from];currentFile.filePath=to;currentFile.scopeManager=_this3.getScopeManager(to,currentFile,data);currentFile.scopeManager.resolved=[];return currentFile.resolveTags(data).then(function(result){currentFile.scopeManager.finishedResolving=true;return result},function(errs){errors=errors.concat(errs)})})})).then(function(resolved){if(errors.length!==0){throwMultiError(errors)}return concatArrays(resolved)})})}},{key:"compile",value:function compile(){var _this4=this;if(Object.keys(this.compiled).length){return this}this.options=this.modules.reduce(function(options,module){return module.optionsTransformer(options,_this4)},this.options);this.options.xmlFileNames=unique(this.options.xmlFileNames);this.xmlDocuments=this.options.xmlFileNames.reduce(function(xmlDocuments,fileName){var content=_this4.zip.files[fileName].asText();xmlDocuments[fileName]=str2xml(content);return xmlDocuments},{});this.setModules({zip:this.zip,xmlDocuments:this.xmlDocuments});this.getTemplatedFiles();this.setModules({compiled:this.compiled});this.templatedFiles.forEach(function(fileName){if(_this4.zip.files[fileName]!=null){_this4.precompileFile(fileName)}});this.templatedFiles.forEach(function(fileName){if(_this4.zip.files[fileName]!=null){_this4.compileFile(fileName)}});verifyErrors(this);return this}},{key:"updateFileTypeConfig",value:function updateFileTypeConfig(){var _this5=this;var fileType;if(this.zip.files.mimetype){fileType="odt"}var contentTypes=this.zip.files[ctXML];this.targets=[];var contentTypeXml=contentTypes?str2xml(contentTypes.asText()):null;var overrides=contentTypeXml?contentTypeXml.getElementsByTagName("Override"):null;var defaults=contentTypeXml?contentTypeXml.getElementsByTagName("Default"):null;if(contentTypeXml){this.filesContentTypes=collectContentTypes(overrides,defaults,this.zip);this.invertedContentTypes=DocUtils.invertMap(this.filesContentTypes);this.setModules({contentTypes:this.contentTypes,invertedContentTypes:this.invertedContentTypes})}this.modules.forEach(function(module){fileType=module.getFileType({zip:_this5.zip,contentTypes:contentTypes,contentTypeXml:contentTypeXml,overrides:overrides,defaults:defaults,doc:_this5})||fileType});if(fileType==="odt"){throwFileTypeNotHandled(fileType)}if(!fileType){throwFileTypeNotIdentified()}this.fileType=fileType;this.fileTypeConfig=this.options.fileTypeConfig||this.fileTypeConfig||Docxtemplater.FileTypeConfig[this.fileType]();return this}},{key:"render",value:function render(){var _this6=this;this.compile();if(this.errors.length>0){throwRenderInvalidTemplate()}this.setModules({data:this.data,Lexer:Lexer});this.mapper=this.modules.reduce(function(value,module){return module.getRenderedMap(value)},{});this.fileTypeConfig.tagsXmlLexedArray=unique(this.fileTypeConfig.tagsXmlLexedArray);this.fileTypeConfig.tagsXmlTextArray=unique(this.fileTypeConfig.tagsXmlTextArray);Object.keys(this.mapper).forEach(function(to){var _this6$mapper$to=_this6.mapper[to],from=_this6$mapper$to.from,data=_this6$mapper$to.data;var currentFile=_this6.compiled[from];currentFile.setTags(data);currentFile.scopeManager=_this6.getScopeManager(to,currentFile,data);currentFile.render(to);_this6.zip.file(to,currentFile.content,{createFolders:true})});verifyErrors(this);this.sendEvent("syncing-zip");this.syncZip();return this}},{key:"syncZip",value:function syncZip(){var _this7=this;Object.keys(this.xmlDocuments).forEach(function(fileName){_this7.zip.remove(fileName);var content=xml2str(_this7.xmlDocuments[fileName]);return _this7.zip.file(fileName,content,{createFolders:true})})}},{key:"setData",value:function setData(data){this.data=data;return this}},{key:"getZip",value:function getZip(){return this.zip}},{key:"createTemplateClass",value:function createTemplateClass(path){var content=this.zip.files[path].asText();return this.createTemplateClassFromContent(content,path)}},{key:"createTemplateClassFromContent",value:function createTemplateClassFromContent(content,filePath){var _this8=this;var xmltOptions={filePath:filePath,contentType:this.filesContentTypes[filePath]};Object.keys(defaults).concat(["filesContentTypes","fileTypeConfig","modules"]).forEach(function(key){xmltOptions[key]=_this8[key]});return new Docxtemplater.XmlTemplater(content,xmltOptions)}},{key:"getFullText",value:function getFullText(path){return this.createTemplateClass(path||this.fileTypeConfig.textPath(this)).getFullText()}},{key:"getTemplatedFiles",value:function getTemplatedFiles(){var _this9=this;this.templatedFiles=this.fileTypeConfig.getTemplatedFiles(this.zip);this.targets.forEach(function(target){_this9.templatedFiles.push(target)});return this.templatedFiles}}]);return Docxtemplater}();function verifyErrors(doc){var compiled=doc.compiled;var allErrors=[];Object.keys(compiled).forEach(function(name){var templatePart=compiled[name];allErrors=concatArrays([allErrors,templatePart.allErrors])});doc.errors=allErrors;if(allErrors.length!==0){throwMultiError(allErrors)}}Docxtemplater.DocUtils=DocUtils;Docxtemplater.Errors=require("./errors");Docxtemplater.XmlTemplater=require("./xml-templater");Docxtemplater.FileTypeConfig=require("./file-type-config");Docxtemplater.XmlMatcher=require("./xml-matcher");module.exports=Docxtemplater},{"./collect-content-types":2,"./doc-utils":3,"./errors":4,"./file-type-config":5,"./lexer":8,"./module-wrapper":10,"./modules/common":11,"./scope-manager":22,"./traits":23,"./xml-matcher":25,"./xml-templater":26}]},{},[])("/src/js/docxtemplater.js")});

/**
 * @lib Dig Безопасная работа с json
 * @ver 0.2.2
 * @url github.yandex-team.ru/kovchiy/dig
 */

'use strict';

var Dig

;(function () {

var regExpComma = /,\s?/
var regExpEqual = /\s?=\s?/
var regExpOr = /\s?\|\s?/

/**
 * Core method
 *
 * @content  object   Pointer to start with
 * @path     string   Extraction path in formats:
 *                    - field1.field2
 *                    - field1.field2[].field3[0]
 *                    - field1.field2[].field3[0].field4(requiredField1, requiredField2[0])
 *                    - field1.field2 = x
 *                    - field1.field2(requiredField1 = x)
 *                    - field1.field2 | field1.field3
 * @callback function Applied to extracted data: callback.call(finalContext, finalContext, i)
 * @return   boolean  If every extraction was success
 */
function dig (context, path, callback, requiredFields, condition) {
    if (typeof context === 'undefined' || context === null || path === '') return false

    // x | y
    if (path.search(regExpOr) > -1) {
        var paths = path.split(regExpOr)
        for (var i = 0, ii = paths.length; i < ii; i++) {
            if (dig(context, paths[i], callback)) return true
        }

        return false
    }

    // x(y)
    var indexOfOpenBracket = path.indexOf('(')
    if (indexOfOpenBracket > -1) {
        requiredFields = path.substring(indexOfOpenBracket+1, path.length-1).split(regExpComma)
        path = path.substring(0, indexOfOpenBracket)
    }

    // x = y
    if (typeof condition === 'undefined') {
        if (path.search(regExpEqual) > -1) {
            var equalExp = path.split(regExpEqual)
            path = equalExp[0]
            condition = {
                type: '=',
                value: equalExp[1]
            }
        }
    }

    // x.y.z
    var dotIndex = path.indexOf('.')
    var pathItem

    while (path !== '') {
        if (dotIndex !== -1) {
            pathItem = path.substr(0, dotIndex)
            path = path.substr(dotIndex + 1)
            dotIndex = path.indexOf('.')
        } else {
            pathItem = path
            path = ''
        }

        if (pathItem !== '' && (typeof context !== 'object' || context === null)) {
            return false
        } else if (pathItem.indexOf('[') > -1) {
            return digArray(context, pathItem, path, callback, requiredFields, condition)
        } else if (typeof context[pathItem] === 'undefined') {
            return false
        } else {
            context = context[pathItem]
        }
    }

    if (checkCondition(context, condition) && hasPath(context, requiredFields)) {
        var callbackResult
        if (callback) {
            callbackResult = callback.call(context, context)
        }

        return typeof callbackResult !== 'undefined' ? callbackResult : true
    }

    return false
}

function digArray (context, pathItem, path, callback, requiredFields, condition) {
    var arrayItem
    var specificIndex
    var indexOfOpenBracket = pathItem.indexOf('[')

    if (pathItem[indexOfOpenBracket + 1] !== ']') {
        specificIndex = pathItem.substring(
            indexOfOpenBracket + 1,
            pathItem.indexOf(']')
        )
    }

    pathItem = pathItem.substring(0, indexOfOpenBracket)

    if (Array.isArray(context[pathItem])) {
        if (typeof specificIndex !== 'undefined') {
            arrayItem = context[pathItem][specificIndex]
            if (typeof arrayItem !== 'undefined') {
                if (path === '' && hasPath(arrayItem, requiredFields) && checkCondition(arrayItem, condition)) {
                    var callbackResult
                    if (callback) {
                        callbackResult = callback.call(arrayItem, arrayItem)
                    }
                    return typeof callbackResult !== 'undefined' ? callbackResult : true
                } else {
                    return dig(arrayItem, path, callback, requiredFields, condition)
                }
            } else {
                return false
            }
        } else {
            var failOnce = false
            var fail = false
            var ctx
            var callbackResults

            for (var i = 0, ii = context[pathItem].length; i < ii; i++) {
                ctx = context[pathItem][i]

                if (path === '' && hasPath(ctx, requiredFields) && checkCondition(ctx, condition)) {
                    if (callback) {
                        var callbackResult = callback.call(ctx, ctx, i)
                        if (typeof callbackResult !== 'undefined') {
                            if (typeof callbackResults === 'undefined') {
                                callbackResults = []
                            }
                            callbackResults.push(callbackResult)
                        }
                    }
                } else {
                    var digResult = dig(ctx, path, callback, requiredFields, condition)
                    if (digResult && digResult !== true) {
                        if (typeof callbackResults === 'undefined') {
                            callbackResults = []
                        }
                        callbackResults.push(digResult)
                    }

                    fail = digResult ? false : true
                }

                if (fail && !failOnce) {
                    failOnce = true
                }
            }

            return typeof callbackResults !== 'undefined' ? callbackResults : !failOnce
        }
    } else {
        return false
    }
}

function hasPath (context, requiredFields) {
    if (typeof requiredFields === 'undefined') return true

    for (var i = 0, ii = requiredFields.length; i < ii; i++) {
        if (!dig(context, requiredFields[i])) return false
    }

    return true
}

function checkCondition (context, condition) {
    if (typeof condition === 'undefined') return true

    if (condition.type === '=' && condition.value === context) {
        return true
    }

    return false
}

Dig = dig

})();

if (typeof module !== 'undefined') {
    module.exports = Dig
}

/*! jQuery v3.3.1 | (c) JS Foundation and other contributors | jquery.org/license */
!function(e,t){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(e,t){"use strict";var n=[],r=e.document,i=Object.getPrototypeOf,o=n.slice,a=n.concat,s=n.push,u=n.indexOf,l={},c=l.toString,f=l.hasOwnProperty,p=f.toString,d=p.call(Object),h={},g=function e(t){return"function"==typeof t&&"number"!=typeof t.nodeType},y=function e(t){return null!=t&&t===t.window},v={type:!0,src:!0,noModule:!0};function m(e,t,n){var i,o=(t=t||r).createElement("script");if(o.text=e,n)for(i in v)n[i]&&(o[i]=n[i]);t.head.appendChild(o).parentNode.removeChild(o)}function x(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?l[c.call(e)]||"object":typeof e}var b="3.3.1",w=function(e,t){return new w.fn.init(e,t)},T=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;w.fn=w.prototype={jquery:"3.3.1",constructor:w,length:0,toArray:function(){return o.call(this)},get:function(e){return null==e?o.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=w.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return w.each(this,e)},map:function(e){return this.pushStack(w.map(this,function(t,n){return e.call(t,n,t)}))},slice:function(){return this.pushStack(o.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(n>=0&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:s,sort:n.sort,splice:n.splice},w.extend=w.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,l=!1;for("boolean"==typeof a&&(l=a,a=arguments[s]||{},s++),"object"==typeof a||g(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)n=a[t],a!==(r=e[t])&&(l&&r&&(w.isPlainObject(r)||(i=Array.isArray(r)))?(i?(i=!1,o=n&&Array.isArray(n)?n:[]):o=n&&w.isPlainObject(n)?n:{},a[t]=w.extend(l,o,r)):void 0!==r&&(a[t]=r));return a},w.extend({expando:"jQuery"+("3.3.1"+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==c.call(e))&&(!(t=i(e))||"function"==typeof(n=f.call(t,"constructor")&&t.constructor)&&p.call(n)===d)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e){m(e)},each:function(e,t){var n,r=0;if(C(e)){for(n=e.length;r<n;r++)if(!1===t.call(e[r],r,e[r]))break}else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},trim:function(e){return null==e?"":(e+"").replace(T,"")},makeArray:function(e,t){var n=t||[];return null!=e&&(C(Object(e))?w.merge(n,"string"==typeof e?[e]:e):s.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:u.call(t,e,n)},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r,i=[],o=0,a=e.length,s=!n;o<a;o++)(r=!t(e[o],o))!==s&&i.push(e[o]);return i},map:function(e,t,n){var r,i,o=0,s=[];if(C(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&s.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&s.push(i);return a.apply([],s)},guid:1,support:h}),"function"==typeof Symbol&&(w.fn[Symbol.iterator]=n[Symbol.iterator]),w.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){l["[object "+t+"]"]=t.toLowerCase()});function C(e){var t=!!e&&"length"in e&&e.length,n=x(e);return!g(e)&&!y(e)&&("array"===n||0===t||"number"==typeof t&&t>0&&t-1 in e)}var E=function(e){var t,n,r,i,o,a,s,u,l,c,f,p,d,h,g,y,v,m,x,b="sizzle"+1*new Date,w=e.document,T=0,C=0,E=ae(),k=ae(),S=ae(),D=function(e,t){return e===t&&(f=!0),0},N={}.hasOwnProperty,A=[],j=A.pop,q=A.push,L=A.push,H=A.slice,O=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return-1},P="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",R="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",I="\\["+M+"*("+R+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+R+"))|)"+M+"*\\]",W=":("+R+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+I+")*)|.*)\\)|)",$=new RegExp(M+"+","g"),B=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),F=new RegExp("^"+M+"*,"+M+"*"),_=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),z=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),X=new RegExp(W),U=new RegExp("^"+R+"$"),V={ID:new RegExp("^#("+R+")"),CLASS:new RegExp("^\\.("+R+")"),TAG:new RegExp("^("+R+"|[*])"),ATTR:new RegExp("^"+I),PSEUDO:new RegExp("^"+W),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+P+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},G=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Q=/^[^{]+\{\s*\[native \w/,J=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,K=/[+~]/,Z=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),ee=function(e,t,n){var r="0x"+t-65536;return r!==r||n?t:r<0?String.fromCharCode(r+65536):String.fromCharCode(r>>10|55296,1023&r|56320)},te=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ne=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},re=function(){p()},ie=me(function(e){return!0===e.disabled&&("form"in e||"label"in e)},{dir:"parentNode",next:"legend"});try{L.apply(A=H.call(w.childNodes),w.childNodes),A[w.childNodes.length].nodeType}catch(e){L={apply:A.length?function(e,t){q.apply(e,H.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}function oe(e,t,r,i){var o,s,l,c,f,h,v,m=t&&t.ownerDocument,T=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==T&&9!==T&&11!==T)return r;if(!i&&((t?t.ownerDocument||t:w)!==d&&p(t),t=t||d,g)){if(11!==T&&(f=J.exec(e)))if(o=f[1]){if(9===T){if(!(l=t.getElementById(o)))return r;if(l.id===o)return r.push(l),r}else if(m&&(l=m.getElementById(o))&&x(t,l)&&l.id===o)return r.push(l),r}else{if(f[2])return L.apply(r,t.getElementsByTagName(e)),r;if((o=f[3])&&n.getElementsByClassName&&t.getElementsByClassName)return L.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!S[e+" "]&&(!y||!y.test(e))){if(1!==T)m=t,v=e;else if("object"!==t.nodeName.toLowerCase()){(c=t.getAttribute("id"))?c=c.replace(te,ne):t.setAttribute("id",c=b),s=(h=a(e)).length;while(s--)h[s]="#"+c+" "+ve(h[s]);v=h.join(","),m=K.test(e)&&ge(t.parentNode)||t}if(v)try{return L.apply(r,m.querySelectorAll(v)),r}catch(e){}finally{c===b&&t.removeAttribute("id")}}}return u(e.replace(B,"$1"),t,r,i)}function ae(){var e=[];function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}return t}function se(e){return e[b]=!0,e}function ue(e){var t=d.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function le(e,t){var n=e.split("|"),i=n.length;while(i--)r.attrHandle[n[i]]=t}function ce(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function fe(e){return function(t){return"input"===t.nodeName.toLowerCase()&&t.type===e}}function pe(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function de(e){return function(t){return"form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ie(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function he(e){return se(function(t){return t=+t,se(function(n,r){var i,o=e([],n.length,t),a=o.length;while(a--)n[i=o[a]]&&(n[i]=!(r[i]=n[i]))})})}function ge(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}n=oe.support={},o=oe.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return!!t&&"HTML"!==t.nodeName},p=oe.setDocument=function(e){var t,i,a=e?e.ownerDocument||e:w;return a!==d&&9===a.nodeType&&a.documentElement?(d=a,h=d.documentElement,g=!o(d),w!==d&&(i=d.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",re,!1):i.attachEvent&&i.attachEvent("onunload",re)),n.attributes=ue(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=ue(function(e){return e.appendChild(d.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Q.test(d.getElementsByClassName),n.getById=ue(function(e){return h.appendChild(e).id=b,!d.getElementsByName||!d.getElementsByName(b).length}),n.getById?(r.filter.ID=function(e){var t=e.replace(Z,ee);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(Z,ee);return function(e){var n="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),r.find.TAG=n.getElementsByTagName?function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if("undefined"!=typeof t.getElementsByClassName&&g)return t.getElementsByClassName(e)},v=[],y=[],(n.qsa=Q.test(d.querySelectorAll))&&(ue(function(e){h.appendChild(e).innerHTML="<a id='"+b+"'></a><select id='"+b+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&y.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||y.push("\\["+M+"*(?:value|"+P+")"),e.querySelectorAll("[id~="+b+"-]").length||y.push("~="),e.querySelectorAll(":checked").length||y.push(":checked"),e.querySelectorAll("a#"+b+"+*").length||y.push(".#.+[+~]")}),ue(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=d.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&y.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&y.push(":enabled",":disabled"),h.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&y.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),y.push(",.*:")})),(n.matchesSelector=Q.test(m=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&ue(function(e){n.disconnectedMatch=m.call(e,"*"),m.call(e,"[s!='']:x"),v.push("!=",W)}),y=y.length&&new RegExp(y.join("|")),v=v.length&&new RegExp(v.join("|")),t=Q.test(h.compareDocumentPosition),x=t||Q.test(h.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},D=t?function(e,t){if(e===t)return f=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)===(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e===d||e.ownerDocument===w&&x(w,e)?-1:t===d||t.ownerDocument===w&&x(w,t)?1:c?O(c,e)-O(c,t):0:4&r?-1:1)}:function(e,t){if(e===t)return f=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,a=[e],s=[t];if(!i||!o)return e===d?-1:t===d?1:i?-1:o?1:c?O(c,e)-O(c,t):0;if(i===o)return ce(e,t);n=e;while(n=n.parentNode)a.unshift(n);n=t;while(n=n.parentNode)s.unshift(n);while(a[r]===s[r])r++;return r?ce(a[r],s[r]):a[r]===w?-1:s[r]===w?1:0},d):d},oe.matches=function(e,t){return oe(e,null,null,t)},oe.matchesSelector=function(e,t){if((e.ownerDocument||e)!==d&&p(e),t=t.replace(z,"='$1']"),n.matchesSelector&&g&&!S[t+" "]&&(!v||!v.test(t))&&(!y||!y.test(t)))try{var r=m.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){}return oe(t,d,null,[e]).length>0},oe.contains=function(e,t){return(e.ownerDocument||e)!==d&&p(e),x(e,t)},oe.attr=function(e,t){(e.ownerDocument||e)!==d&&p(e);var i=r.attrHandle[t.toLowerCase()],o=i&&N.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},oe.escape=function(e){return(e+"").replace(te,ne)},oe.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},oe.uniqueSort=function(e){var t,r=[],i=0,o=0;if(f=!n.detectDuplicates,c=!n.sortStable&&e.slice(0),e.sort(D),f){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1)}return c=null,e},i=oe.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e)}else if(3===o||4===o)return e.nodeValue}else while(t=e[r++])n+=i(t);return n},(r=oe.selectors={cacheLength:50,createPseudo:se,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(Z,ee),e[3]=(e[3]||e[4]||e[5]||"").replace(Z,ee),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||oe.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&oe.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return V.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=a(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(Z,ee).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=E[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&E(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=oe.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace($," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),a="last"!==e.slice(-4),s="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var l,c,f,p,d,h,g=o!==a?"nextSibling":"previousSibling",y=t.parentNode,v=s&&t.nodeName.toLowerCase(),m=!u&&!s,x=!1;if(y){if(o){while(g){p=t;while(p=p[g])if(s?p.nodeName.toLowerCase()===v:1===p.nodeType)return!1;h=g="only"===e&&!h&&"nextSibling"}return!0}if(h=[a?y.firstChild:y.lastChild],a&&m){x=(d=(l=(c=(f=(p=y)[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]||[])[0]===T&&l[1])&&l[2],p=d&&y.childNodes[d];while(p=++d&&p&&p[g]||(x=d=0)||h.pop())if(1===p.nodeType&&++x&&p===t){c[e]=[T,d,x];break}}else if(m&&(x=d=(l=(c=(f=(p=t)[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]||[])[0]===T&&l[1]),!1===x)while(p=++d&&p&&p[g]||(x=d=0)||h.pop())if((s?p.nodeName.toLowerCase()===v:1===p.nodeType)&&++x&&(m&&((c=(f=p[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]=[T,x]),p===t))break;return(x-=i)===r||x%r==0&&x/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||oe.error("unsupported pseudo: "+e);return i[b]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?se(function(e,n){var r,o=i(e,t),a=o.length;while(a--)e[r=O(e,o[a])]=!(n[r]=o[a])}):function(e){return i(e,0,n)}):i}},pseudos:{not:se(function(e){var t=[],n=[],r=s(e.replace(B,"$1"));return r[b]?se(function(e,t,n,i){var o,a=r(e,null,i,[]),s=e.length;while(s--)(o=a[s])&&(e[s]=!(t[s]=o))}):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}}),has:se(function(e){return function(t){return oe(e,t).length>0}}),contains:se(function(e){return e=e.replace(Z,ee),function(t){return(t.textContent||t.innerText||i(t)).indexOf(e)>-1}}),lang:se(function(e){return U.test(e||"")||oe.error("unsupported lang: "+e),e=e.replace(Z,ee).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return(n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===d.activeElement&&(!d.hasFocus||d.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:de(!1),disabled:de(!0),checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!r.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return G.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:he(function(){return[0]}),last:he(function(e,t){return[t-1]}),eq:he(function(e,t,n){return[n<0?n+t:n]}),even:he(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:he(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:he(function(e,t,n){for(var r=n<0?n+t:n;--r>=0;)e.push(r);return e}),gt:he(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=r.pseudos.eq;for(t in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=fe(t);for(t in{submit:!0,reset:!0})r.pseudos[t]=pe(t);function ye(){}ye.prototype=r.filters=r.pseudos,r.setFilters=new ye,a=oe.tokenize=function(e,t){var n,i,o,a,s,u,l,c=k[e+" "];if(c)return t?0:c.slice(0);s=e,u=[],l=r.preFilter;while(s){n&&!(i=F.exec(s))||(i&&(s=s.slice(i[0].length)||s),u.push(o=[])),n=!1,(i=_.exec(s))&&(n=i.shift(),o.push({value:n,type:i[0].replace(B," ")}),s=s.slice(n.length));for(a in r.filter)!(i=V[a].exec(s))||l[a]&&!(i=l[a](i))||(n=i.shift(),o.push({value:n,type:a,matches:i}),s=s.slice(n.length));if(!n)break}return t?s.length:s?oe.error(e):k(e,u).slice(0)};function ve(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function me(e,t,n){var r=t.dir,i=t.next,o=i||r,a=n&&"parentNode"===o,s=C++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||a)return e(t,n,i);return!1}:function(t,n,u){var l,c,f,p=[T,s];if(u){while(t=t[r])if((1===t.nodeType||a)&&e(t,n,u))return!0}else while(t=t[r])if(1===t.nodeType||a)if(f=t[b]||(t[b]={}),c=f[t.uniqueID]||(f[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else{if((l=c[o])&&l[0]===T&&l[1]===s)return p[2]=l[2];if(c[o]=p,p[2]=e(t,n,u))return!0}return!1}}function xe(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function be(e,t,n){for(var r=0,i=t.length;r<i;r++)oe(e,t[r],n);return n}function we(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,l=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),l&&t.push(s)));return a}function Te(e,t,n,r,i,o){return r&&!r[b]&&(r=Te(r)),i&&!i[b]&&(i=Te(i,o)),se(function(o,a,s,u){var l,c,f,p=[],d=[],h=a.length,g=o||be(t||"*",s.nodeType?[s]:s,[]),y=!e||!o&&t?g:we(g,p,e,s,u),v=n?i||(o?e:h||r)?[]:a:y;if(n&&n(y,v,s,u),r){l=we(v,d),r(l,[],s,u),c=l.length;while(c--)(f=l[c])&&(v[d[c]]=!(y[d[c]]=f))}if(o){if(i||e){if(i){l=[],c=v.length;while(c--)(f=v[c])&&l.push(y[c]=f);i(null,v=[],l,u)}c=v.length;while(c--)(f=v[c])&&(l=i?O(o,f):p[c])>-1&&(o[l]=!(a[l]=f))}}else v=we(v===a?v.splice(h,v.length):v),i?i(null,a,v,u):L.apply(a,v)})}function Ce(e){for(var t,n,i,o=e.length,a=r.relative[e[0].type],s=a||r.relative[" "],u=a?1:0,c=me(function(e){return e===t},s,!0),f=me(function(e){return O(t,e)>-1},s,!0),p=[function(e,n,r){var i=!a&&(r||n!==l)||((t=n).nodeType?c(e,n,r):f(e,n,r));return t=null,i}];u<o;u++)if(n=r.relative[e[u].type])p=[me(xe(p),n)];else{if((n=r.filter[e[u].type].apply(null,e[u].matches))[b]){for(i=++u;i<o;i++)if(r.relative[e[i].type])break;return Te(u>1&&xe(p),u>1&&ve(e.slice(0,u-1).concat({value:" "===e[u-2].type?"*":""})).replace(B,"$1"),n,u<i&&Ce(e.slice(u,i)),i<o&&Ce(e=e.slice(i)),i<o&&ve(e))}p.push(n)}return xe(p)}function Ee(e,t){var n=t.length>0,i=e.length>0,o=function(o,a,s,u,c){var f,h,y,v=0,m="0",x=o&&[],b=[],w=l,C=o||i&&r.find.TAG("*",c),E=T+=null==w?1:Math.random()||.1,k=C.length;for(c&&(l=a===d||a||c);m!==k&&null!=(f=C[m]);m++){if(i&&f){h=0,a||f.ownerDocument===d||(p(f),s=!g);while(y=e[h++])if(y(f,a||d,s)){u.push(f);break}c&&(T=E)}n&&((f=!y&&f)&&v--,o&&x.push(f))}if(v+=m,n&&m!==v){h=0;while(y=t[h++])y(x,b,a,s);if(o){if(v>0)while(m--)x[m]||b[m]||(b[m]=j.call(u));b=we(b)}L.apply(u,b),c&&!o&&b.length>0&&v+t.length>1&&oe.uniqueSort(u)}return c&&(T=E,l=w),x};return n?se(o):o}return s=oe.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=a(e)),n=t.length;while(n--)(o=Ce(t[n]))[b]?r.push(o):i.push(o);(o=S(e,Ee(i,r))).selector=e}return o},u=oe.select=function(e,t,n,i){var o,u,l,c,f,p="function"==typeof e&&e,d=!i&&a(e=p.selector||e);if(n=n||[],1===d.length){if((u=d[0]=d[0].slice(0)).length>2&&"ID"===(l=u[0]).type&&9===t.nodeType&&g&&r.relative[u[1].type]){if(!(t=(r.find.ID(l.matches[0].replace(Z,ee),t)||[])[0]))return n;p&&(t=t.parentNode),e=e.slice(u.shift().value.length)}o=V.needsContext.test(e)?0:u.length;while(o--){if(l=u[o],r.relative[c=l.type])break;if((f=r.find[c])&&(i=f(l.matches[0].replace(Z,ee),K.test(u[0].type)&&ge(t.parentNode)||t))){if(u.splice(o,1),!(e=i.length&&ve(u)))return L.apply(n,i),n;break}}}return(p||s(e,d))(i,t,!g,n,!t||K.test(e)&&ge(t.parentNode)||t),n},n.sortStable=b.split("").sort(D).join("")===b,n.detectDuplicates=!!f,p(),n.sortDetached=ue(function(e){return 1&e.compareDocumentPosition(d.createElement("fieldset"))}),ue(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||le("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&ue(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||le("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),ue(function(e){return null==e.getAttribute("disabled")})||le(P,function(e,t,n){var r;if(!n)return!0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null}),oe}(e);w.find=E,w.expr=E.selectors,w.expr[":"]=w.expr.pseudos,w.uniqueSort=w.unique=E.uniqueSort,w.text=E.getText,w.isXMLDoc=E.isXML,w.contains=E.contains,w.escapeSelector=E.escape;var k=function(e,t,n){var r=[],i=void 0!==n;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&w(e).is(n))break;r.push(e)}return r},S=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},D=w.expr.match.needsContext;function N(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}var A=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function j(e,t,n){return g(t)?w.grep(e,function(e,r){return!!t.call(e,r,e)!==n}):t.nodeType?w.grep(e,function(e){return e===t!==n}):"string"!=typeof t?w.grep(e,function(e){return u.call(t,e)>-1!==n}):w.filter(t,e,n)}w.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?w.find.matchesSelector(r,e)?[r]:[]:w.find.matches(e,w.grep(t,function(e){return 1===e.nodeType}))},w.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(w(e).filter(function(){for(t=0;t<r;t++)if(w.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)w.find(e,i[t],n);return r>1?w.uniqueSort(n):n},filter:function(e){return this.pushStack(j(this,e||[],!1))},not:function(e){return this.pushStack(j(this,e||[],!0))},is:function(e){return!!j(this,"string"==typeof e&&D.test(e)?w(e):e||[],!1).length}});var q,L=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(w.fn.init=function(e,t,n){var i,o;if(!e)return this;if(n=n||q,"string"==typeof e){if(!(i="<"===e[0]&&">"===e[e.length-1]&&e.length>=3?[null,e,null]:L.exec(e))||!i[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(i[1]){if(t=t instanceof w?t[0]:t,w.merge(this,w.parseHTML(i[1],t&&t.nodeType?t.ownerDocument||t:r,!0)),A.test(i[1])&&w.isPlainObject(t))for(i in t)g(this[i])?this[i](t[i]):this.attr(i,t[i]);return this}return(o=r.getElementById(i[2]))&&(this[0]=o,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):g(e)?void 0!==n.ready?n.ready(e):e(w):w.makeArray(e,this)}).prototype=w.fn,q=w(r);var H=/^(?:parents|prev(?:Until|All))/,O={children:!0,contents:!0,next:!0,prev:!0};w.fn.extend({has:function(e){var t=w(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(w.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&w(e);if(!D.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?a.index(n)>-1:1===n.nodeType&&w.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(o.length>1?w.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?u.call(w(e),this[0]):u.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(w.uniqueSort(w.merge(this.get(),w(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}});function P(e,t){while((e=e[t])&&1!==e.nodeType);return e}w.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return k(e,"parentNode")},parentsUntil:function(e,t,n){return k(e,"parentNode",n)},next:function(e){return P(e,"nextSibling")},prev:function(e){return P(e,"previousSibling")},nextAll:function(e){return k(e,"nextSibling")},prevAll:function(e){return k(e,"previousSibling")},nextUntil:function(e,t,n){return k(e,"nextSibling",n)},prevUntil:function(e,t,n){return k(e,"previousSibling",n)},siblings:function(e){return S((e.parentNode||{}).firstChild,e)},children:function(e){return S(e.firstChild)},contents:function(e){return N(e,"iframe")?e.contentDocument:(N(e,"template")&&(e=e.content||e),w.merge([],e.childNodes))}},function(e,t){w.fn[e]=function(n,r){var i=w.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=w.filter(r,i)),this.length>1&&(O[e]||w.uniqueSort(i),H.test(e)&&i.reverse()),this.pushStack(i)}});var M=/[^\x20\t\r\n\f]+/g;function R(e){var t={};return w.each(e.match(M)||[],function(e,n){t[n]=!0}),t}w.Callbacks=function(e){e="string"==typeof e?R(e):w.extend({},e);var t,n,r,i,o=[],a=[],s=-1,u=function(){for(i=i||e.once,r=t=!0;a.length;s=-1){n=a.shift();while(++s<o.length)!1===o[s].apply(n[0],n[1])&&e.stopOnFalse&&(s=o.length,n=!1)}e.memory||(n=!1),t=!1,i&&(o=n?[]:"")},l={add:function(){return o&&(n&&!t&&(s=o.length-1,a.push(n)),function t(n){w.each(n,function(n,r){g(r)?e.unique&&l.has(r)||o.push(r):r&&r.length&&"string"!==x(r)&&t(r)})}(arguments),n&&!t&&u()),this},remove:function(){return w.each(arguments,function(e,t){var n;while((n=w.inArray(t,o,n))>-1)o.splice(n,1),n<=s&&s--}),this},has:function(e){return e?w.inArray(e,o)>-1:o.length>0},empty:function(){return o&&(o=[]),this},disable:function(){return i=a=[],o=n="",this},disabled:function(){return!o},lock:function(){return i=a=[],n||t||(o=n=""),this},locked:function(){return!!i},fireWith:function(e,n){return i||(n=[e,(n=n||[]).slice?n.slice():n],a.push(n),t||u()),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!r}};return l};function I(e){return e}function W(e){throw e}function $(e,t,n,r){var i;try{e&&g(i=e.promise)?i.call(e).done(t).fail(n):e&&g(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}w.extend({Deferred:function(t){var n=[["notify","progress",w.Callbacks("memory"),w.Callbacks("memory"),2],["resolve","done",w.Callbacks("once memory"),w.Callbacks("once memory"),0,"resolved"],["reject","fail",w.Callbacks("once memory"),w.Callbacks("once memory"),1,"rejected"]],r="pending",i={state:function(){return r},always:function(){return o.done(arguments).fail(arguments),this},"catch":function(e){return i.then(null,e)},pipe:function(){var e=arguments;return w.Deferred(function(t){w.each(n,function(n,r){var i=g(e[r[4]])&&e[r[4]];o[r[1]](function(){var e=i&&i.apply(this,arguments);e&&g(e.promise)?e.promise().progress(t.notify).done(t.resolve).fail(t.reject):t[r[0]+"With"](this,i?[e]:arguments)})}),e=null}).promise()},then:function(t,r,i){var o=0;function a(t,n,r,i){return function(){var s=this,u=arguments,l=function(){var e,l;if(!(t<o)){if((e=r.apply(s,u))===n.promise())throw new TypeError("Thenable self-resolution");l=e&&("object"==typeof e||"function"==typeof e)&&e.then,g(l)?i?l.call(e,a(o,n,I,i),a(o,n,W,i)):(o++,l.call(e,a(o,n,I,i),a(o,n,W,i),a(o,n,I,n.notifyWith))):(r!==I&&(s=void 0,u=[e]),(i||n.resolveWith)(s,u))}},c=i?l:function(){try{l()}catch(e){w.Deferred.exceptionHook&&w.Deferred.exceptionHook(e,c.stackTrace),t+1>=o&&(r!==W&&(s=void 0,u=[e]),n.rejectWith(s,u))}};t?c():(w.Deferred.getStackHook&&(c.stackTrace=w.Deferred.getStackHook()),e.setTimeout(c))}}return w.Deferred(function(e){n[0][3].add(a(0,e,g(i)?i:I,e.notifyWith)),n[1][3].add(a(0,e,g(t)?t:I)),n[2][3].add(a(0,e,g(r)?r:W))}).promise()},promise:function(e){return null!=e?w.extend(e,i):i}},o={};return w.each(n,function(e,t){var a=t[2],s=t[5];i[t[1]]=a.add,s&&a.add(function(){r=s},n[3-e][2].disable,n[3-e][3].disable,n[0][2].lock,n[0][3].lock),a.add(t[3].fire),o[t[0]]=function(){return o[t[0]+"With"](this===o?void 0:this,arguments),this},o[t[0]+"With"]=a.fireWith}),i.promise(o),t&&t.call(o,o),o},when:function(e){var t=arguments.length,n=t,r=Array(n),i=o.call(arguments),a=w.Deferred(),s=function(e){return function(n){r[e]=this,i[e]=arguments.length>1?o.call(arguments):n,--t||a.resolveWith(r,i)}};if(t<=1&&($(e,a.done(s(n)).resolve,a.reject,!t),"pending"===a.state()||g(i[n]&&i[n].then)))return a.then();while(n--)$(i[n],s(n),a.reject);return a.promise()}});var B=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;w.Deferred.exceptionHook=function(t,n){e.console&&e.console.warn&&t&&B.test(t.name)&&e.console.warn("jQuery.Deferred exception: "+t.message,t.stack,n)},w.readyException=function(t){e.setTimeout(function(){throw t})};var F=w.Deferred();w.fn.ready=function(e){return F.then(e)["catch"](function(e){w.readyException(e)}),this},w.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--w.readyWait:w.isReady)||(w.isReady=!0,!0!==e&&--w.readyWait>0||F.resolveWith(r,[w]))}}),w.ready.then=F.then;function _(){r.removeEventListener("DOMContentLoaded",_),e.removeEventListener("load",_),w.ready()}"complete"===r.readyState||"loading"!==r.readyState&&!r.documentElement.doScroll?e.setTimeout(w.ready):(r.addEventListener("DOMContentLoaded",_),e.addEventListener("load",_));var z=function(e,t,n,r,i,o,a){var s=0,u=e.length,l=null==n;if("object"===x(n)){i=!0;for(s in n)z(e,t,s,n[s],!0,o,a)}else if(void 0!==r&&(i=!0,g(r)||(a=!0),l&&(a?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(w(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:l?t.call(e):u?t(e[0],n):o},X=/^-ms-/,U=/-([a-z])/g;function V(e,t){return t.toUpperCase()}function G(e){return e.replace(X,"ms-").replace(U,V)}var Y=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function Q(){this.expando=w.expando+Q.uid++}Q.uid=1,Q.prototype={cache:function(e){var t=e[this.expando];return t||(t={},Y(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[G(t)]=n;else for(r in t)i[G(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][G(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(G):(t=G(t))in r?[t]:t.match(M)||[]).length;while(n--)delete r[t[n]]}(void 0===t||w.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!w.isEmptyObject(t)}};var J=new Q,K=new Q,Z=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,ee=/[A-Z]/g;function te(e){return"true"===e||"false"!==e&&("null"===e?null:e===+e+""?+e:Z.test(e)?JSON.parse(e):e)}function ne(e,t,n){var r;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(ee,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n=te(n)}catch(e){}K.set(e,t,n)}else n=void 0;return n}w.extend({hasData:function(e){return K.hasData(e)||J.hasData(e)},data:function(e,t,n){return K.access(e,t,n)},removeData:function(e,t){K.remove(e,t)},_data:function(e,t,n){return J.access(e,t,n)},_removeData:function(e,t){J.remove(e,t)}}),w.fn.extend({data:function(e,t){var n,r,i,o=this[0],a=o&&o.attributes;if(void 0===e){if(this.length&&(i=K.get(o),1===o.nodeType&&!J.get(o,"hasDataAttrs"))){n=a.length;while(n--)a[n]&&0===(r=a[n].name).indexOf("data-")&&(r=G(r.slice(5)),ne(o,r,i[r]));J.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof e?this.each(function(){K.set(this,e)}):z(this,function(t){var n;if(o&&void 0===t){if(void 0!==(n=K.get(o,e)))return n;if(void 0!==(n=ne(o,e)))return n}else this.each(function(){K.set(this,e,t)})},null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){K.remove(this,e)})}}),w.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=J.get(e,t),n&&(!r||Array.isArray(n)?r=J.access(e,t,w.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=w.queue(e,t),r=n.length,i=n.shift(),o=w._queueHooks(e,t),a=function(){w.dequeue(e,t)};"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,a,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return J.get(e,n)||J.access(e,n,{empty:w.Callbacks("once memory").add(function(){J.remove(e,[t+"queue",n])})})}}),w.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),arguments.length<n?w.queue(this[0],e):void 0===t?this:this.each(function(){var n=w.queue(this,e,t);w._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&w.dequeue(this,e)})},dequeue:function(e){return this.each(function(){w.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=w.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(a--)(n=J.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var re=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,ie=new RegExp("^(?:([+-])=|)("+re+")([a-z%]*)$","i"),oe=["Top","Right","Bottom","Left"],ae=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&w.contains(e.ownerDocument,e)&&"none"===w.css(e,"display")},se=function(e,t,n,r){var i,o,a={};for(o in t)a[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=a[o];return i};function ue(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return w.css(e,t,"")},u=s(),l=n&&n[3]||(w.cssNumber[t]?"":"px"),c=(w.cssNumber[t]||"px"!==l&&+u)&&ie.exec(w.css(e,t));if(c&&c[3]!==l){u/=2,l=l||c[3],c=+u||1;while(a--)w.style(e,t,c+l),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),c/=o;c*=2,w.style(e,t,c+l),n=n||[]}return n&&(c=+c||+u||0,i=n[1]?c+(n[1]+1)*n[2]:+n[2],r&&(r.unit=l,r.start=c,r.end=i)),i}var le={};function ce(e){var t,n=e.ownerDocument,r=e.nodeName,i=le[r];return i||(t=n.body.appendChild(n.createElement(r)),i=w.css(t,"display"),t.parentNode.removeChild(t),"none"===i&&(i="block"),le[r]=i,i)}function fe(e,t){for(var n,r,i=[],o=0,a=e.length;o<a;o++)(r=e[o]).style&&(n=r.style.display,t?("none"===n&&(i[o]=J.get(r,"display")||null,i[o]||(r.style.display="")),""===r.style.display&&ae(r)&&(i[o]=ce(r))):"none"!==n&&(i[o]="none",J.set(r,"display",n)));for(o=0;o<a;o++)null!=i[o]&&(e[o].style.display=i[o]);return e}w.fn.extend({show:function(){return fe(this,!0)},hide:function(){return fe(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){ae(this)?w(this).show():w(this).hide()})}});var pe=/^(?:checkbox|radio)$/i,de=/<([a-z][^\/\0>\x20\t\r\n\f]+)/i,he=/^$|^module$|\/(?:java|ecma)script/i,ge={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ge.optgroup=ge.option,ge.tbody=ge.tfoot=ge.colgroup=ge.caption=ge.thead,ge.th=ge.td;function ye(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&N(e,t)?w.merge([e],n):n}function ve(e,t){for(var n=0,r=e.length;n<r;n++)J.set(e[n],"globalEval",!t||J.get(t[n],"globalEval"))}var me=/<|&#?\w+;/;function xe(e,t,n,r,i){for(var o,a,s,u,l,c,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if((o=e[d])||0===o)if("object"===x(o))w.merge(p,o.nodeType?[o]:o);else if(me.test(o)){a=a||f.appendChild(t.createElement("div")),s=(de.exec(o)||["",""])[1].toLowerCase(),u=ge[s]||ge._default,a.innerHTML=u[1]+w.htmlPrefilter(o)+u[2],c=u[0];while(c--)a=a.lastChild;w.merge(p,a.childNodes),(a=f.firstChild).textContent=""}else p.push(t.createTextNode(o));f.textContent="",d=0;while(o=p[d++])if(r&&w.inArray(o,r)>-1)i&&i.push(o);else if(l=w.contains(o.ownerDocument,o),a=ye(f.appendChild(o),"script"),l&&ve(a),n){c=0;while(o=a[c++])he.test(o.type||"")&&n.push(o)}return f}!function(){var e=r.createDocumentFragment().appendChild(r.createElement("div")),t=r.createElement("input");t.setAttribute("type","radio"),t.setAttribute("checked","checked"),t.setAttribute("name","t"),e.appendChild(t),h.checkClone=e.cloneNode(!0).cloneNode(!0).lastChild.checked,e.innerHTML="<textarea>x</textarea>",h.noCloneChecked=!!e.cloneNode(!0).lastChild.defaultValue}();var be=r.documentElement,we=/^key/,Te=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,Ce=/^([^.]*)(?:\.(.+)|)/;function Ee(){return!0}function ke(){return!1}function Se(){try{return r.activeElement}catch(e){}}function De(e,t,n,r,i,o){var a,s;if("object"==typeof t){"string"!=typeof n&&(r=r||n,n=void 0);for(s in t)De(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=ke;else if(!i)return e;return 1===o&&(a=i,(i=function(e){return w().off(e),a.apply(this,arguments)}).guid=a.guid||(a.guid=w.guid++)),e.each(function(){w.event.add(this,t,i,r,n)})}w.event={global:{},add:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,y=J.get(e);if(y){n.handler&&(n=(o=n).handler,i=o.selector),i&&w.find.matchesSelector(be,i),n.guid||(n.guid=w.guid++),(u=y.events)||(u=y.events={}),(a=y.handle)||(a=y.handle=function(t){return"undefined"!=typeof w&&w.event.triggered!==t.type?w.event.dispatch.apply(e,arguments):void 0}),l=(t=(t||"").match(M)||[""]).length;while(l--)d=g=(s=Ce.exec(t[l])||[])[1],h=(s[2]||"").split(".").sort(),d&&(f=w.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=w.event.special[d]||{},c=w.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&w.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||((p=u[d]=[]).delegateCount=0,f.setup&&!1!==f.setup.call(e,r,h,a)||e.addEventListener&&e.addEventListener(d,a)),f.add&&(f.add.call(e,c),c.handler.guid||(c.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,c):p.push(c),w.event.global[d]=!0)}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,y=J.hasData(e)&&J.get(e);if(y&&(u=y.events)){l=(t=(t||"").match(M)||[""]).length;while(l--)if(s=Ce.exec(t[l])||[],d=g=s[1],h=(s[2]||"").split(".").sort(),d){f=w.event.special[d]||{},p=u[d=(r?f.delegateType:f.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||s&&!s.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));a&&!p.length&&(f.teardown&&!1!==f.teardown.call(e,h,y.handle)||w.removeEvent(e,d,y.handle),delete u[d])}else for(d in u)w.event.remove(e,d+t[l],n,r,!0);w.isEmptyObject(u)&&J.remove(e,"handle events")}},dispatch:function(e){var t=w.event.fix(e),n,r,i,o,a,s,u=new Array(arguments.length),l=(J.get(this,"events")||{})[t.type]||[],c=w.event.special[t.type]||{};for(u[0]=t,n=1;n<arguments.length;n++)u[n]=arguments[n];if(t.delegateTarget=this,!c.preDispatch||!1!==c.preDispatch.call(this,t)){s=w.event.handlers.call(this,t,l),n=0;while((o=s[n++])&&!t.isPropagationStopped()){t.currentTarget=o.elem,r=0;while((a=o.handlers[r++])&&!t.isImmediatePropagationStopped())t.rnamespace&&!t.rnamespace.test(a.namespace)||(t.handleObj=a,t.data=a.data,void 0!==(i=((w.event.special[a.origType]||{}).handle||a.handler).apply(o.elem,u))&&!1===(t.result=i)&&(t.preventDefault(),t.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,t),t.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,l=e.target;if(u&&l.nodeType&&!("click"===e.type&&e.button>=1))for(;l!==this;l=l.parentNode||this)if(1===l.nodeType&&("click"!==e.type||!0!==l.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?w(i,this).index(l)>-1:w.find(i,this,null,[l]).length),a[i]&&o.push(r);o.length&&s.push({elem:l,handlers:o})}return l=this,u<t.length&&s.push({elem:l,handlers:t.slice(u)}),s},addProp:function(e,t){Object.defineProperty(w.Event.prototype,e,{enumerable:!0,configurable:!0,get:g(t)?function(){if(this.originalEvent)return t(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[e]},set:function(t){Object.defineProperty(this,e,{enumerable:!0,configurable:!0,writable:!0,value:t})}})},fix:function(e){return e[w.expando]?e:new w.Event(e)},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==Se()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===Se()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&N(this,"input"))return this.click(),!1},_default:function(e){return N(e.target,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},w.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},w.Event=function(e,t){if(!(this instanceof w.Event))return new w.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Ee:ke,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&w.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[w.expando]=!0},w.Event.prototype={constructor:w.Event,isDefaultPrevented:ke,isPropagationStopped:ke,isImmediatePropagationStopped:ke,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Ee,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Ee,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Ee,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},w.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(e){var t=e.button;return null==e.which&&we.test(e.type)?null!=e.charCode?e.charCode:e.keyCode:!e.which&&void 0!==t&&Te.test(e.type)?1&t?1:2&t?3:4&t?2:0:e.which}},w.event.addProp),w.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,t){w.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return i&&(i===r||w.contains(r,i))||(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),w.fn.extend({on:function(e,t,n,r){return De(this,e,t,n,r)},one:function(e,t,n,r){return De(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,w(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=ke),this.each(function(){w.event.remove(this,e,n,t)})}});var Ne=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,Ae=/<script|<style|<link/i,je=/checked\s*(?:[^=]|=\s*.checked.)/i,qe=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function Le(e,t){return N(e,"table")&&N(11!==t.nodeType?t:t.firstChild,"tr")?w(e).children("tbody")[0]||e:e}function He(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function Oe(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Pe(e,t){var n,r,i,o,a,s,u,l;if(1===t.nodeType){if(J.hasData(e)&&(o=J.access(e),a=J.set(t,o),l=o.events)){delete a.handle,a.events={};for(i in l)for(n=0,r=l[i].length;n<r;n++)w.event.add(t,i,l[i][n])}K.hasData(e)&&(s=K.access(e),u=w.extend({},s),K.set(t,u))}}function Me(e,t){var n=t.nodeName.toLowerCase();"input"===n&&pe.test(e.type)?t.checked=e.checked:"input"!==n&&"textarea"!==n||(t.defaultValue=e.defaultValue)}function Re(e,t,n,r){t=a.apply([],t);var i,o,s,u,l,c,f=0,p=e.length,d=p-1,y=t[0],v=g(y);if(v||p>1&&"string"==typeof y&&!h.checkClone&&je.test(y))return e.each(function(i){var o=e.eq(i);v&&(t[0]=y.call(this,i,o.html())),Re(o,t,n,r)});if(p&&(i=xe(t,e[0].ownerDocument,!1,e,r),o=i.firstChild,1===i.childNodes.length&&(i=o),o||r)){for(u=(s=w.map(ye(i,"script"),He)).length;f<p;f++)l=i,f!==d&&(l=w.clone(l,!0,!0),u&&w.merge(s,ye(l,"script"))),n.call(e[f],l,f);if(u)for(c=s[s.length-1].ownerDocument,w.map(s,Oe),f=0;f<u;f++)l=s[f],he.test(l.type||"")&&!J.access(l,"globalEval")&&w.contains(c,l)&&(l.src&&"module"!==(l.type||"").toLowerCase()?w._evalUrl&&w._evalUrl(l.src):m(l.textContent.replace(qe,""),c,l))}return e}function Ie(e,t,n){for(var r,i=t?w.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||w.cleanData(ye(r)),r.parentNode&&(n&&w.contains(r.ownerDocument,r)&&ve(ye(r,"script")),r.parentNode.removeChild(r));return e}w.extend({htmlPrefilter:function(e){return e.replace(Ne,"<$1></$2>")},clone:function(e,t,n){var r,i,o,a,s=e.cloneNode(!0),u=w.contains(e.ownerDocument,e);if(!(h.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||w.isXMLDoc(e)))for(a=ye(s),r=0,i=(o=ye(e)).length;r<i;r++)Me(o[r],a[r]);if(t)if(n)for(o=o||ye(e),a=a||ye(s),r=0,i=o.length;r<i;r++)Pe(o[r],a[r]);else Pe(e,s);return(a=ye(s,"script")).length>0&&ve(a,!u&&ye(e,"script")),s},cleanData:function(e){for(var t,n,r,i=w.event.special,o=0;void 0!==(n=e[o]);o++)if(Y(n)){if(t=n[J.expando]){if(t.events)for(r in t.events)i[r]?w.event.remove(n,r):w.removeEvent(n,r,t.handle);n[J.expando]=void 0}n[K.expando]&&(n[K.expando]=void 0)}}}),w.fn.extend({detach:function(e){return Ie(this,e,!0)},remove:function(e){return Ie(this,e)},text:function(e){return z(this,function(e){return void 0===e?w.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return Re(this,arguments,function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||Le(this,e).appendChild(e)})},prepend:function(){return Re(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Le(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return Re(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return Re(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(w.cleanData(ye(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return w.clone(this,e,t)})},html:function(e){return z(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Ae.test(e)&&!ge[(de.exec(e)||["",""])[1].toLowerCase()]){e=w.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(w.cleanData(ye(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=[];return Re(this,arguments,function(t){var n=this.parentNode;w.inArray(this,e)<0&&(w.cleanData(ye(this)),n&&n.replaceChild(t,this))},e)}}),w.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){w.fn[e]=function(e){for(var n,r=[],i=w(e),o=i.length-1,a=0;a<=o;a++)n=a===o?this:this.clone(!0),w(i[a])[t](n),s.apply(r,n.get());return this.pushStack(r)}});var We=new RegExp("^("+re+")(?!px)[a-z%]+$","i"),$e=function(t){var n=t.ownerDocument.defaultView;return n&&n.opener||(n=e),n.getComputedStyle(t)},Be=new RegExp(oe.join("|"),"i");!function(){function t(){if(c){l.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",c.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",be.appendChild(l).appendChild(c);var t=e.getComputedStyle(c);i="1%"!==t.top,u=12===n(t.marginLeft),c.style.right="60%",s=36===n(t.right),o=36===n(t.width),c.style.position="absolute",a=36===c.offsetWidth||"absolute",be.removeChild(l),c=null}}function n(e){return Math.round(parseFloat(e))}var i,o,a,s,u,l=r.createElement("div"),c=r.createElement("div");c.style&&(c.style.backgroundClip="content-box",c.cloneNode(!0).style.backgroundClip="",h.clearCloneStyle="content-box"===c.style.backgroundClip,w.extend(h,{boxSizingReliable:function(){return t(),o},pixelBoxStyles:function(){return t(),s},pixelPosition:function(){return t(),i},reliableMarginLeft:function(){return t(),u},scrollboxSize:function(){return t(),a}}))}();function Fe(e,t,n){var r,i,o,a,s=e.style;return(n=n||$e(e))&&(""!==(a=n.getPropertyValue(t)||n[t])||w.contains(e.ownerDocument,e)||(a=w.style(e,t)),!h.pixelBoxStyles()&&We.test(a)&&Be.test(t)&&(r=s.width,i=s.minWidth,o=s.maxWidth,s.minWidth=s.maxWidth=s.width=a,a=n.width,s.width=r,s.minWidth=i,s.maxWidth=o)),void 0!==a?a+"":a}function _e(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}var ze=/^(none|table(?!-c[ea]).+)/,Xe=/^--/,Ue={position:"absolute",visibility:"hidden",display:"block"},Ve={letterSpacing:"0",fontWeight:"400"},Ge=["Webkit","Moz","ms"],Ye=r.createElement("div").style;function Qe(e){if(e in Ye)return e;var t=e[0].toUpperCase()+e.slice(1),n=Ge.length;while(n--)if((e=Ge[n]+t)in Ye)return e}function Je(e){var t=w.cssProps[e];return t||(t=w.cssProps[e]=Qe(e)||e),t}function Ke(e,t,n){var r=ie.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function Ze(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(u+=w.css(e,n+oe[a],!0,i)),r?("content"===n&&(u-=w.css(e,"padding"+oe[a],!0,i)),"margin"!==n&&(u-=w.css(e,"border"+oe[a]+"Width",!0,i))):(u+=w.css(e,"padding"+oe[a],!0,i),"padding"!==n?u+=w.css(e,"border"+oe[a]+"Width",!0,i):s+=w.css(e,"border"+oe[a]+"Width",!0,i));return!r&&o>=0&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))),u}function et(e,t,n){var r=$e(e),i=Fe(e,t,r),o="border-box"===w.css(e,"boxSizing",!1,r),a=o;if(We.test(i)){if(!n)return i;i="auto"}return a=a&&(h.boxSizingReliable()||i===e.style[t]),("auto"===i||!parseFloat(i)&&"inline"===w.css(e,"display",!1,r))&&(i=e["offset"+t[0].toUpperCase()+t.slice(1)],a=!0),(i=parseFloat(i)||0)+Ze(e,t,n||(o?"border":"content"),a,r,i)+"px"}w.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Fe(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=G(t),u=Xe.test(t),l=e.style;if(u||(t=Je(s)),a=w.cssHooks[t]||w.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:l[t];"string"==(o=typeof n)&&(i=ie.exec(n))&&i[1]&&(n=ue(e,t,i),o="number"),null!=n&&n===n&&("number"===o&&(n+=i&&i[3]||(w.cssNumber[s]?"":"px")),h.clearCloneStyle||""!==n||0!==t.indexOf("background")||(l[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?l.setProperty(t,n):l[t]=n))}},css:function(e,t,n,r){var i,o,a,s=G(t);return Xe.test(t)||(t=Je(s)),(a=w.cssHooks[t]||w.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Fe(e,t,r)),"normal"===i&&t in Ve&&(i=Ve[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),w.each(["height","width"],function(e,t){w.cssHooks[t]={get:function(e,n,r){if(n)return!ze.test(w.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?et(e,t,r):se(e,Ue,function(){return et(e,t,r)})},set:function(e,n,r){var i,o=$e(e),a="border-box"===w.css(e,"boxSizing",!1,o),s=r&&Ze(e,t,r,a,o);return a&&h.scrollboxSize()===o.position&&(s-=Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-parseFloat(o[t])-Ze(e,t,"border",!1,o)-.5)),s&&(i=ie.exec(n))&&"px"!==(i[3]||"px")&&(e.style[t]=n,n=w.css(e,t)),Ke(e,n,s)}}}),w.cssHooks.marginLeft=_e(h.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Fe(e,"marginLeft"))||e.getBoundingClientRect().left-se(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),w.each({margin:"",padding:"",border:"Width"},function(e,t){w.cssHooks[e+t]={expand:function(n){for(var r=0,i={},o="string"==typeof n?n.split(" "):[n];r<4;r++)i[e+oe[r]+t]=o[r]||o[r-2]||o[0];return i}},"margin"!==e&&(w.cssHooks[e+t].set=Ke)}),w.fn.extend({css:function(e,t){return z(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=$e(e),i=t.length;a<i;a++)o[t[a]]=w.css(e,t[a],!1,r);return o}return void 0!==n?w.style(e,t,n):w.css(e,t)},e,t,arguments.length>1)}});function tt(e,t,n,r,i){return new tt.prototype.init(e,t,n,r,i)}w.Tween=tt,tt.prototype={constructor:tt,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||w.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(w.cssNumber[n]?"":"px")},cur:function(){var e=tt.propHooks[this.prop];return e&&e.get?e.get(this):tt.propHooks._default.get(this)},run:function(e){var t,n=tt.propHooks[this.prop];return this.options.duration?this.pos=t=w.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):tt.propHooks._default.set(this),this}},tt.prototype.init.prototype=tt.prototype,tt.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=w.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){w.fx.step[e.prop]?w.fx.step[e.prop](e):1!==e.elem.nodeType||null==e.elem.style[w.cssProps[e.prop]]&&!w.cssHooks[e.prop]?e.elem[e.prop]=e.now:w.style(e.elem,e.prop,e.now+e.unit)}}},tt.propHooks.scrollTop=tt.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},w.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},w.fx=tt.prototype.init,w.fx.step={};var nt,rt,it=/^(?:toggle|show|hide)$/,ot=/queueHooks$/;function at(){rt&&(!1===r.hidden&&e.requestAnimationFrame?e.requestAnimationFrame(at):e.setTimeout(at,w.fx.interval),w.fx.tick())}function st(){return e.setTimeout(function(){nt=void 0}),nt=Date.now()}function ut(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=oe[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function lt(e,t,n){for(var r,i=(pt.tweeners[t]||[]).concat(pt.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function ct(e,t,n){var r,i,o,a,s,u,l,c,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&ae(e),y=J.get(e,"fxshow");n.queue||(null==(a=w._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,w.queue(e,"fx").length||a.empty.fire()})}));for(r in t)if(i=t[r],it.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!y||void 0===y[r])continue;g=!0}d[r]=y&&y[r]||w.style(e,r)}if((u=!w.isEmptyObject(t))||!w.isEmptyObject(d)){f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],null==(l=y&&y.display)&&(l=J.get(e,"display")),"none"===(c=w.css(e,"display"))&&(l?c=l:(fe([e],!0),l=e.style.display||l,c=w.css(e,"display"),fe([e]))),("inline"===c||"inline-block"===c&&null!=l)&&"none"===w.css(e,"float")&&(u||(p.done(function(){h.display=l}),null==l&&(c=h.display,l="none"===c?"":c)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1;for(r in d)u||(y?"hidden"in y&&(g=y.hidden):y=J.access(e,"fxshow",{display:l}),o&&(y.hidden=!g),g&&fe([e],!0),p.done(function(){g||fe([e]),J.remove(e,"fxshow");for(r in d)w.style(e,r,d[r])})),u=lt(g?y[r]:0,r,p),r in y||(y[r]=u.start,g&&(u.end=u.start,u.start=0))}}function ft(e,t){var n,r,i,o,a;for(n in e)if(r=G(n),i=t[r],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=w.cssHooks[r])&&"expand"in a){o=a.expand(o),delete e[r];for(n in o)n in e||(e[n]=o[n],t[n]=i)}else t[r]=i}function pt(e,t,n){var r,i,o=0,a=pt.prefilters.length,s=w.Deferred().always(function(){delete u.elem}),u=function(){if(i)return!1;for(var t=nt||st(),n=Math.max(0,l.startTime+l.duration-t),r=1-(n/l.duration||0),o=0,a=l.tweens.length;o<a;o++)l.tweens[o].run(r);return s.notifyWith(e,[l,r,n]),r<1&&a?n:(a||s.notifyWith(e,[l,1,0]),s.resolveWith(e,[l]),!1)},l=s.promise({elem:e,props:w.extend({},t),opts:w.extend(!0,{specialEasing:{},easing:w.easing._default},n),originalProperties:t,originalOptions:n,startTime:nt||st(),duration:n.duration,tweens:[],createTween:function(t,n){var r=w.Tween(e,l.opts,t,n,l.opts.specialEasing[t]||l.opts.easing);return l.tweens.push(r),r},stop:function(t){var n=0,r=t?l.tweens.length:0;if(i)return this;for(i=!0;n<r;n++)l.tweens[n].run(1);return t?(s.notifyWith(e,[l,1,0]),s.resolveWith(e,[l,t])):s.rejectWith(e,[l,t]),this}}),c=l.props;for(ft(c,l.opts.specialEasing);o<a;o++)if(r=pt.prefilters[o].call(l,e,c,l.opts))return g(r.stop)&&(w._queueHooks(l.elem,l.opts.queue).stop=r.stop.bind(r)),r;return w.map(c,lt,l),g(l.opts.start)&&l.opts.start.call(e,l),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always),w.fx.timer(w.extend(u,{elem:e,anim:l,queue:l.opts.queue})),l}w.Animation=w.extend(pt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return ue(n.elem,e,ie.exec(t),n),n}]},tweener:function(e,t){g(e)?(t=e,e=["*"]):e=e.match(M);for(var n,r=0,i=e.length;r<i;r++)n=e[r],pt.tweeners[n]=pt.tweeners[n]||[],pt.tweeners[n].unshift(t)},prefilters:[ct],prefilter:function(e,t){t?pt.prefilters.unshift(e):pt.prefilters.push(e)}}),w.speed=function(e,t,n){var r=e&&"object"==typeof e?w.extend({},e):{complete:n||!n&&t||g(e)&&e,duration:e,easing:n&&t||t&&!g(t)&&t};return w.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in w.fx.speeds?r.duration=w.fx.speeds[r.duration]:r.duration=w.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){g(r.old)&&r.old.call(this),r.queue&&w.dequeue(this,r.queue)},r},w.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ae).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=w.isEmptyObject(e),o=w.speed(t,n,r),a=function(){var t=pt(this,w.extend({},e),o);(i||J.get(this,"finish"))&&t.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=void 0),t&&!1!==e&&this.queue(e||"fx",[]),this.each(function(){var t=!0,i=null!=e&&e+"queueHooks",o=w.timers,a=J.get(this);if(i)a[i]&&a[i].stop&&r(a[i]);else for(i in a)a[i]&&a[i].stop&&ot.test(i)&&r(a[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));!t&&n||w.dequeue(this,e)})},finish:function(e){return!1!==e&&(e=e||"fx"),this.each(function(){var t,n=J.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=w.timers,a=r?r.length:0;for(n.finish=!0,w.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;t<a;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}}),w.each(["toggle","show","hide"],function(e,t){var n=w.fn[t];w.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(ut(t,!0),e,r,i)}}),w.each({slideDown:ut("show"),slideUp:ut("hide"),slideToggle:ut("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){w.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),w.timers=[],w.fx.tick=function(){var e,t=0,n=w.timers;for(nt=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||w.fx.stop(),nt=void 0},w.fx.timer=function(e){w.timers.push(e),w.fx.start()},w.fx.interval=13,w.fx.start=function(){rt||(rt=!0,at())},w.fx.stop=function(){rt=null},w.fx.speeds={slow:600,fast:200,_default:400},w.fn.delay=function(t,n){return t=w.fx?w.fx.speeds[t]||t:t,n=n||"fx",this.queue(n,function(n,r){var i=e.setTimeout(n,t);r.stop=function(){e.clearTimeout(i)}})},function(){var e=r.createElement("input"),t=r.createElement("select").appendChild(r.createElement("option"));e.type="checkbox",h.checkOn=""!==e.value,h.optSelected=t.selected,(e=r.createElement("input")).value="t",e.type="radio",h.radioValue="t"===e.value}();var dt,ht=w.expr.attrHandle;w.fn.extend({attr:function(e,t){return z(this,w.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){w.removeAttr(this,e)})}}),w.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?w.prop(e,t,n):(1===o&&w.isXMLDoc(e)||(i=w.attrHooks[t.toLowerCase()]||(w.expr.match.bool.test(t)?dt:void 0)),void 0!==n?null===n?void w.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=w.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!h.radioValue&&"radio"===t&&N(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(M);if(i&&1===e.nodeType)while(n=i[r++])e.removeAttribute(n)}}),dt={set:function(e,t,n){return!1===t?w.removeAttr(e,n):e.setAttribute(n,n),n}},w.each(w.expr.match.bool.source.match(/\w+/g),function(e,t){var n=ht[t]||w.find.attr;ht[t]=function(e,t,r){var i,o,a=t.toLowerCase();return r||(o=ht[a],ht[a]=i,i=null!=n(e,t,r)?a:null,ht[a]=o),i}});var gt=/^(?:input|select|textarea|button)$/i,yt=/^(?:a|area)$/i;w.fn.extend({prop:function(e,t){return z(this,w.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each(function(){delete this[w.propFix[e]||e]})}}),w.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&w.isXMLDoc(e)||(t=w.propFix[t]||t,i=w.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=w.find.attr(e,"tabindex");return t?parseInt(t,10):gt.test(e.nodeName)||yt.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),h.optSelected||(w.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),w.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){w.propFix[this.toLowerCase()]=this});function vt(e){return(e.match(M)||[]).join(" ")}function mt(e){return e.getAttribute&&e.getAttribute("class")||""}function xt(e){return Array.isArray(e)?e:"string"==typeof e?e.match(M)||[]:[]}w.fn.extend({addClass:function(e){var t,n,r,i,o,a,s,u=0;if(g(e))return this.each(function(t){w(this).addClass(e.call(this,t,mt(this)))});if((t=xt(e)).length)while(n=this[u++])if(i=mt(n),r=1===n.nodeType&&" "+vt(i)+" "){a=0;while(o=t[a++])r.indexOf(" "+o+" ")<0&&(r+=o+" ");i!==(s=vt(r))&&n.setAttribute("class",s)}return this},removeClass:function(e){var t,n,r,i,o,a,s,u=0;if(g(e))return this.each(function(t){w(this).removeClass(e.call(this,t,mt(this)))});if(!arguments.length)return this.attr("class","");if((t=xt(e)).length)while(n=this[u++])if(i=mt(n),r=1===n.nodeType&&" "+vt(i)+" "){a=0;while(o=t[a++])while(r.indexOf(" "+o+" ")>-1)r=r.replace(" "+o+" "," ");i!==(s=vt(r))&&n.setAttribute("class",s)}return this},toggleClass:function(e,t){var n=typeof e,r="string"===n||Array.isArray(e);return"boolean"==typeof t&&r?t?this.addClass(e):this.removeClass(e):g(e)?this.each(function(n){w(this).toggleClass(e.call(this,n,mt(this),t),t)}):this.each(function(){var t,i,o,a;if(r){i=0,o=w(this),a=xt(e);while(t=a[i++])o.hasClass(t)?o.removeClass(t):o.addClass(t)}else void 0!==e&&"boolean"!==n||((t=mt(this))&&J.set(this,"__className__",t),this.setAttribute&&this.setAttribute("class",t||!1===e?"":J.get(this,"__className__")||""))})},hasClass:function(e){var t,n,r=0;t=" "+e+" ";while(n=this[r++])if(1===n.nodeType&&(" "+vt(mt(n))+" ").indexOf(t)>-1)return!0;return!1}});var bt=/\r/g;w.fn.extend({val:function(e){var t,n,r,i=this[0];{if(arguments.length)return r=g(e),this.each(function(n){var i;1===this.nodeType&&(null==(i=r?e.call(this,n,w(this).val()):e)?i="":"number"==typeof i?i+="":Array.isArray(i)&&(i=w.map(i,function(e){return null==e?"":e+""})),(t=w.valHooks[this.type]||w.valHooks[this.nodeName.toLowerCase()])&&"set"in t&&void 0!==t.set(this,i,"value")||(this.value=i))});if(i)return(t=w.valHooks[i.type]||w.valHooks[i.nodeName.toLowerCase()])&&"get"in t&&void 0!==(n=t.get(i,"value"))?n:"string"==typeof(n=i.value)?n.replace(bt,""):null==n?"":n}}}),w.extend({valHooks:{option:{get:function(e){var t=w.find.attr(e,"value");return null!=t?t:vt(w.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!N(n.parentNode,"optgroup"))){if(t=w(n).val(),a)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=w.makeArray(t),a=i.length;while(a--)((r=i[a]).selected=w.inArray(w.valHooks.option.get(r),o)>-1)&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),w.each(["radio","checkbox"],function(){w.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=w.inArray(w(e).val(),t)>-1}},h.checkOn||(w.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})}),h.focusin="onfocusin"in e;var wt=/^(?:focusinfocus|focusoutblur)$/,Tt=function(e){e.stopPropagation()};w.extend(w.event,{trigger:function(t,n,i,o){var a,s,u,l,c,p,d,h,v=[i||r],m=f.call(t,"type")?t.type:t,x=f.call(t,"namespace")?t.namespace.split("."):[];if(s=h=u=i=i||r,3!==i.nodeType&&8!==i.nodeType&&!wt.test(m+w.event.triggered)&&(m.indexOf(".")>-1&&(m=(x=m.split(".")).shift(),x.sort()),c=m.indexOf(":")<0&&"on"+m,t=t[w.expando]?t:new w.Event(m,"object"==typeof t&&t),t.isTrigger=o?2:3,t.namespace=x.join("."),t.rnamespace=t.namespace?new RegExp("(^|\\.)"+x.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=void 0,t.target||(t.target=i),n=null==n?[t]:w.makeArray(n,[t]),d=w.event.special[m]||{},o||!d.trigger||!1!==d.trigger.apply(i,n))){if(!o&&!d.noBubble&&!y(i)){for(l=d.delegateType||m,wt.test(l+m)||(s=s.parentNode);s;s=s.parentNode)v.push(s),u=s;u===(i.ownerDocument||r)&&v.push(u.defaultView||u.parentWindow||e)}a=0;while((s=v[a++])&&!t.isPropagationStopped())h=s,t.type=a>1?l:d.bindType||m,(p=(J.get(s,"events")||{})[t.type]&&J.get(s,"handle"))&&p.apply(s,n),(p=c&&s[c])&&p.apply&&Y(s)&&(t.result=p.apply(s,n),!1===t.result&&t.preventDefault());return t.type=m,o||t.isDefaultPrevented()||d._default&&!1!==d._default.apply(v.pop(),n)||!Y(i)||c&&g(i[m])&&!y(i)&&((u=i[c])&&(i[c]=null),w.event.triggered=m,t.isPropagationStopped()&&h.addEventListener(m,Tt),i[m](),t.isPropagationStopped()&&h.removeEventListener(m,Tt),w.event.triggered=void 0,u&&(i[c]=u)),t.result}},simulate:function(e,t,n){var r=w.extend(new w.Event,n,{type:e,isSimulated:!0});w.event.trigger(r,null,t)}}),w.fn.extend({trigger:function(e,t){return this.each(function(){w.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return w.event.trigger(e,t,n,!0)}}),h.focusin||w.each({focus:"focusin",blur:"focusout"},function(e,t){var n=function(e){w.event.simulate(t,e.target,w.event.fix(e))};w.event.special[t]={setup:function(){var r=this.ownerDocument||this,i=J.access(r,t);i||r.addEventListener(e,n,!0),J.access(r,t,(i||0)+1)},teardown:function(){var r=this.ownerDocument||this,i=J.access(r,t)-1;i?J.access(r,t,i):(r.removeEventListener(e,n,!0),J.remove(r,t))}}});var Ct=e.location,Et=Date.now(),kt=/\?/;w.parseXML=function(t){var n;if(!t||"string"!=typeof t)return null;try{n=(new e.DOMParser).parseFromString(t,"text/xml")}catch(e){n=void 0}return n&&!n.getElementsByTagName("parsererror").length||w.error("Invalid XML: "+t),n};var St=/\[\]$/,Dt=/\r?\n/g,Nt=/^(?:submit|button|image|reset|file)$/i,At=/^(?:input|select|textarea|keygen)/i;function jt(e,t,n,r){var i;if(Array.isArray(t))w.each(t,function(t,i){n||St.test(e)?r(e,i):jt(e+"["+("object"==typeof i&&null!=i?t:"")+"]",i,n,r)});else if(n||"object"!==x(t))r(e,t);else for(i in t)jt(e+"["+i+"]",t[i],n,r)}w.param=function(e,t){var n,r=[],i=function(e,t){var n=g(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(Array.isArray(e)||e.jquery&&!w.isPlainObject(e))w.each(e,function(){i(this.name,this.value)});else for(n in e)jt(n,e[n],t,i);return r.join("&")},w.fn.extend({serialize:function(){return w.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=w.prop(this,"elements");return e?w.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!w(this).is(":disabled")&&At.test(this.nodeName)&&!Nt.test(e)&&(this.checked||!pe.test(e))}).map(function(e,t){var n=w(this).val();return null==n?null:Array.isArray(n)?w.map(n,function(e){return{name:t.name,value:e.replace(Dt,"\r\n")}}):{name:t.name,value:n.replace(Dt,"\r\n")}}).get()}});var qt=/%20/g,Lt=/#.*$/,Ht=/([?&])_=[^&]*/,Ot=/^(.*?):[ \t]*([^\r\n]*)$/gm,Pt=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Mt=/^(?:GET|HEAD)$/,Rt=/^\/\//,It={},Wt={},$t="*/".concat("*"),Bt=r.createElement("a");Bt.href=Ct.href;function Ft(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(M)||[];if(g(n))while(r=o[i++])"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function _t(e,t,n,r){var i={},o=e===Wt;function a(s){var u;return i[s]=!0,w.each(e[s]||[],function(e,s){var l=s(t,n,r);return"string"!=typeof l||o||i[l]?o?!(u=l):void 0:(t.dataTypes.unshift(l),a(l),!1)}),u}return a(t.dataTypes[0])||!i["*"]&&a("*")}function zt(e,t){var n,r,i=w.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&w.extend(!0,e,r),e}function Xt(e,t,n){var r,i,o,a,s=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}function Ut(e,t,n,r){var i,o,a,s,u,l={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)l[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=l[u+" "+o]||l["* "+o]))for(i in l)if((s=i.split(" "))[1]===o&&(a=l[u+" "+s[0]]||l["* "+s[0]])){!0===a?a=l[i]:!0!==l[i]&&(o=s[0],c.unshift(s[1]));break}if(!0!==a)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}w.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Ct.href,type:"GET",isLocal:Pt.test(Ct.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":$t,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":w.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?zt(zt(e,w.ajaxSettings),t):zt(w.ajaxSettings,e)},ajaxPrefilter:Ft(It),ajaxTransport:Ft(Wt),ajax:function(t,n){"object"==typeof t&&(n=t,t=void 0),n=n||{};var i,o,a,s,u,l,c,f,p,d,h=w.ajaxSetup({},n),g=h.context||h,y=h.context&&(g.nodeType||g.jquery)?w(g):w.event,v=w.Deferred(),m=w.Callbacks("once memory"),x=h.statusCode||{},b={},T={},C="canceled",E={readyState:0,getResponseHeader:function(e){var t;if(c){if(!s){s={};while(t=Ot.exec(a))s[t[1].toLowerCase()]=t[2]}t=s[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return c?a:null},setRequestHeader:function(e,t){return null==c&&(e=T[e.toLowerCase()]=T[e.toLowerCase()]||e,b[e]=t),this},overrideMimeType:function(e){return null==c&&(h.mimeType=e),this},statusCode:function(e){var t;if(e)if(c)E.always(e[E.status]);else for(t in e)x[t]=[x[t],e[t]];return this},abort:function(e){var t=e||C;return i&&i.abort(t),k(0,t),this}};if(v.promise(E),h.url=((t||h.url||Ct.href)+"").replace(Rt,Ct.protocol+"//"),h.type=n.method||n.type||h.method||h.type,h.dataTypes=(h.dataType||"*").toLowerCase().match(M)||[""],null==h.crossDomain){l=r.createElement("a");try{l.href=h.url,l.href=l.href,h.crossDomain=Bt.protocol+"//"+Bt.host!=l.protocol+"//"+l.host}catch(e){h.crossDomain=!0}}if(h.data&&h.processData&&"string"!=typeof h.data&&(h.data=w.param(h.data,h.traditional)),_t(It,h,n,E),c)return E;(f=w.event&&h.global)&&0==w.active++&&w.event.trigger("ajaxStart"),h.type=h.type.toUpperCase(),h.hasContent=!Mt.test(h.type),o=h.url.replace(Lt,""),h.hasContent?h.data&&h.processData&&0===(h.contentType||"").indexOf("application/x-www-form-urlencoded")&&(h.data=h.data.replace(qt,"+")):(d=h.url.slice(o.length),h.data&&(h.processData||"string"==typeof h.data)&&(o+=(kt.test(o)?"&":"?")+h.data,delete h.data),!1===h.cache&&(o=o.replace(Ht,"$1"),d=(kt.test(o)?"&":"?")+"_="+Et+++d),h.url=o+d),h.ifModified&&(w.lastModified[o]&&E.setRequestHeader("If-Modified-Since",w.lastModified[o]),w.etag[o]&&E.setRequestHeader("If-None-Match",w.etag[o])),(h.data&&h.hasContent&&!1!==h.contentType||n.contentType)&&E.setRequestHeader("Content-Type",h.contentType),E.setRequestHeader("Accept",h.dataTypes[0]&&h.accepts[h.dataTypes[0]]?h.accepts[h.dataTypes[0]]+("*"!==h.dataTypes[0]?", "+$t+"; q=0.01":""):h.accepts["*"]);for(p in h.headers)E.setRequestHeader(p,h.headers[p]);if(h.beforeSend&&(!1===h.beforeSend.call(g,E,h)||c))return E.abort();if(C="abort",m.add(h.complete),E.done(h.success),E.fail(h.error),i=_t(Wt,h,n,E)){if(E.readyState=1,f&&y.trigger("ajaxSend",[E,h]),c)return E;h.async&&h.timeout>0&&(u=e.setTimeout(function(){E.abort("timeout")},h.timeout));try{c=!1,i.send(b,k)}catch(e){if(c)throw e;k(-1,e)}}else k(-1,"No Transport");function k(t,n,r,s){var l,p,d,b,T,C=n;c||(c=!0,u&&e.clearTimeout(u),i=void 0,a=s||"",E.readyState=t>0?4:0,l=t>=200&&t<300||304===t,r&&(b=Xt(h,E,r)),b=Ut(h,b,E,l),l?(h.ifModified&&((T=E.getResponseHeader("Last-Modified"))&&(w.lastModified[o]=T),(T=E.getResponseHeader("etag"))&&(w.etag[o]=T)),204===t||"HEAD"===h.type?C="nocontent":304===t?C="notmodified":(C=b.state,p=b.data,l=!(d=b.error))):(d=C,!t&&C||(C="error",t<0&&(t=0))),E.status=t,E.statusText=(n||C)+"",l?v.resolveWith(g,[p,C,E]):v.rejectWith(g,[E,C,d]),E.statusCode(x),x=void 0,f&&y.trigger(l?"ajaxSuccess":"ajaxError",[E,h,l?p:d]),m.fireWith(g,[E,C]),f&&(y.trigger("ajaxComplete",[E,h]),--w.active||w.event.trigger("ajaxStop")))}return E},getJSON:function(e,t,n){return w.get(e,t,n,"json")},getScript:function(e,t){return w.get(e,void 0,t,"script")}}),w.each(["get","post"],function(e,t){w[t]=function(e,n,r,i){return g(n)&&(i=i||r,r=n,n=void 0),w.ajax(w.extend({url:e,type:t,dataType:i,data:n,success:r},w.isPlainObject(e)&&e))}}),w._evalUrl=function(e){return w.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,"throws":!0})},w.fn.extend({wrapAll:function(e){var t;return this[0]&&(g(e)&&(e=e.call(this[0])),t=w(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(e){return g(e)?this.each(function(t){w(this).wrapInner(e.call(this,t))}):this.each(function(){var t=w(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=g(e);return this.each(function(n){w(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(e){return this.parent(e).not("body").each(function(){w(this).replaceWith(this.childNodes)}),this}}),w.expr.pseudos.hidden=function(e){return!w.expr.pseudos.visible(e)},w.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},w.ajaxSettings.xhr=function(){try{return new e.XMLHttpRequest}catch(e){}};var Vt={0:200,1223:204},Gt=w.ajaxSettings.xhr();h.cors=!!Gt&&"withCredentials"in Gt,h.ajax=Gt=!!Gt,w.ajaxTransport(function(t){var n,r;if(h.cors||Gt&&!t.crossDomain)return{send:function(i,o){var a,s=t.xhr();if(s.open(t.type,t.url,t.async,t.username,t.password),t.xhrFields)for(a in t.xhrFields)s[a]=t.xhrFields[a];t.mimeType&&s.overrideMimeType&&s.overrideMimeType(t.mimeType),t.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest");for(a in i)s.setRequestHeader(a,i[a]);n=function(e){return function(){n&&(n=r=s.onload=s.onerror=s.onabort=s.ontimeout=s.onreadystatechange=null,"abort"===e?s.abort():"error"===e?"number"!=typeof s.status?o(0,"error"):o(s.status,s.statusText):o(Vt[s.status]||s.status,s.statusText,"text"!==(s.responseType||"text")||"string"!=typeof s.responseText?{binary:s.response}:{text:s.responseText},s.getAllResponseHeaders()))}},s.onload=n(),r=s.onerror=s.ontimeout=n("error"),void 0!==s.onabort?s.onabort=r:s.onreadystatechange=function(){4===s.readyState&&e.setTimeout(function(){n&&r()})},n=n("abort");try{s.send(t.hasContent&&t.data||null)}catch(e){if(n)throw e}},abort:function(){n&&n()}}}),w.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),w.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return w.globalEval(e),e}}}),w.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),w.ajaxTransport("script",function(e){if(e.crossDomain){var t,n;return{send:function(i,o){t=w("<script>").prop({charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&o("error"===e.type?404:200,e.type)}),r.head.appendChild(t[0])},abort:function(){n&&n()}}}});var Yt=[],Qt=/(=)\?(?=&|$)|\?\?/;w.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Yt.pop()||w.expando+"_"+Et++;return this[e]=!0,e}}),w.ajaxPrefilter("json jsonp",function(t,n,r){var i,o,a,s=!1!==t.jsonp&&(Qt.test(t.url)?"url":"string"==typeof t.data&&0===(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&Qt.test(t.data)&&"data");if(s||"jsonp"===t.dataTypes[0])return i=t.jsonpCallback=g(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,s?t[s]=t[s].replace(Qt,"$1"+i):!1!==t.jsonp&&(t.url+=(kt.test(t.url)?"&":"?")+t.jsonp+"="+i),t.converters["script json"]=function(){return a||w.error(i+" was not called"),a[0]},t.dataTypes[0]="json",o=e[i],e[i]=function(){a=arguments},r.always(function(){void 0===o?w(e).removeProp(i):e[i]=o,t[i]&&(t.jsonpCallback=n.jsonpCallback,Yt.push(i)),a&&g(o)&&o(a[0]),a=o=void 0}),"script"}),h.createHTMLDocument=function(){var e=r.implementation.createHTMLDocument("").body;return e.innerHTML="<form></form><form></form>",2===e.childNodes.length}(),w.parseHTML=function(e,t,n){if("string"!=typeof e)return[];"boolean"==typeof t&&(n=t,t=!1);var i,o,a;return t||(h.createHTMLDocument?((i=(t=r.implementation.createHTMLDocument("")).createElement("base")).href=r.location.href,t.head.appendChild(i)):t=r),o=A.exec(e),a=!n&&[],o?[t.createElement(o[1])]:(o=xe([e],t,a),a&&a.length&&w(a).remove(),w.merge([],o.childNodes))},w.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return s>-1&&(r=vt(e.slice(s)),e=e.slice(0,s)),g(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),a.length>0&&w.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?w("<div>").append(w.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},w.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){w.fn[t]=function(e){return this.on(t,e)}}),w.expr.pseudos.animated=function(e){return w.grep(w.timers,function(t){return e===t.elem}).length},w.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,l,c=w.css(e,"position"),f=w(e),p={};"static"===c&&(e.style.position="relative"),s=f.offset(),o=w.css(e,"top"),u=w.css(e,"left"),(l=("absolute"===c||"fixed"===c)&&(o+u).indexOf("auto")>-1)?(a=(r=f.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),g(t)&&(t=t.call(e,n,w.extend({},s))),null!=t.top&&(p.top=t.top-s.top+a),null!=t.left&&(p.left=t.left-s.left+i),"using"in t?t.using.call(e,p):f.css(p)}},w.fn.extend({offset:function(e){if(arguments.length)return void 0===e?this:this.each(function(t){w.offset.setOffset(this,e,t)});var t,n,r=this[0];if(r)return r.getClientRects().length?(t=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:t.top+n.pageYOffset,left:t.left+n.pageXOffset}):{top:0,left:0}},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===w.css(r,"position"))t=r.getBoundingClientRect();else{t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;while(e&&(e===n.body||e===n.documentElement)&&"static"===w.css(e,"position"))e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=w(e).offset()).top+=w.css(e,"borderTopWidth",!0),i.left+=w.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-w.css(r,"marginTop",!0),left:t.left-i.left-w.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===w.css(e,"position"))e=e.offsetParent;return e||be})}}),w.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,t){var n="pageYOffset"===t;w.fn[e]=function(r){return z(this,function(e,r,i){var o;if(y(e)?o=e:9===e.nodeType&&(o=e.defaultView),void 0===i)return o?o[t]:e[r];o?o.scrollTo(n?o.pageXOffset:i,n?i:o.pageYOffset):e[r]=i},e,r,arguments.length)}}),w.each(["top","left"],function(e,t){w.cssHooks[t]=_e(h.pixelPosition,function(e,n){if(n)return n=Fe(e,t),We.test(n)?w(e).position()[t]+"px":n})}),w.each({Height:"height",Width:"width"},function(e,t){w.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,r){w.fn[r]=function(i,o){var a=arguments.length&&(n||"boolean"!=typeof i),s=n||(!0===i||!0===o?"margin":"border");return z(this,function(t,n,i){var o;return y(t)?0===r.indexOf("outer")?t["inner"+e]:t.document.documentElement["client"+e]:9===t.nodeType?(o=t.documentElement,Math.max(t.body["scroll"+e],o["scroll"+e],t.body["offset"+e],o["offset"+e],o["client"+e])):void 0===i?w.css(t,n,s):w.style(t,n,i,s)},t,a?i:void 0,a)}})}),w.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,t){w.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),w.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),w.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}}),w.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),g(e))return r=o.call(arguments,2),i=function(){return e.apply(t||this,r.concat(o.call(arguments)))},i.guid=e.guid=e.guid||w.guid++,i},w.holdReady=function(e){e?w.readyWait++:w.ready(!0)},w.isArray=Array.isArray,w.parseJSON=JSON.parse,w.nodeName=N,w.isFunction=g,w.isWindow=y,w.camelCase=G,w.type=x,w.now=Date.now,w.isNumeric=function(e){var t=w.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},"function"==typeof define&&define.amd&&define("jquery",[],function(){return w});var Jt=e.jQuery,Kt=e.$;return w.noConflict=function(t){return e.$===w&&(e.$=Kt),t&&e.jQuery===w&&(e.jQuery=Jt),w},t||(e.jQuery=e.$=w),w});


var hashPar = window.location.href.split('?')[1] || '';

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
};




!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.AOS=t():e.AOS=t()}(this,function(){return function(e){function t(o){if(n[o])return n[o].exports;var i=n[o]={exports:{},id:o,loaded:!1};return e[o].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="dist/",t(0)}([function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},r=n(1),a=(o(r),n(6)),u=o(a),c=n(7),s=o(c),f=n(8),d=o(f),l=n(9),p=o(l),m=n(10),b=o(m),v=n(11),y=o(v),g=n(14),h=o(g),w=[],k=!1,x={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,startEvent:"DOMContentLoaded",throttleDelay:99,debounceDelay:50,disableMutationObserver:!1},j=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(e&&(k=!0),k)return w=(0,y.default)(w,x),(0,b.default)(w,x.once),w},O=function(){w=(0,h.default)(),j()},M=function(){w.forEach(function(e,t){e.node.removeAttribute("data-aos"),e.node.removeAttribute("data-aos-easing"),e.node.removeAttribute("data-aos-duration"),e.node.removeAttribute("data-aos-delay")})},S=function(e){return e===!0||"mobile"===e&&p.default.mobile()||"phone"===e&&p.default.phone()||"tablet"===e&&p.default.tablet()||"function"==typeof e&&e()===!0},_=function(e){x=i(x,e),w=(0,h.default)();var t=document.all&&!window.atob;return S(x.disable)||t?M():(x.disableMutationObserver||d.default.isSupported()||(console.info('\n      aos: MutationObserver is not supported on this browser,\n      code mutations observing has been disabled.\n      You may have to call "refreshHard()" by yourself.\n    '),x.disableMutationObserver=!0),document.querySelector("body").setAttribute("data-aos-easing",x.easing),document.querySelector("body").setAttribute("data-aos-duration",x.duration),document.querySelector("body").setAttribute("data-aos-delay",x.delay),"DOMContentLoaded"===x.startEvent&&["complete","interactive"].indexOf(document.readyState)>-1?j(!0):"load"===x.startEvent?window.addEventListener(x.startEvent,function(){j(!0)}):document.addEventListener(x.startEvent,function(){j(!0)}),window.addEventListener("resize",(0,s.default)(j,x.debounceDelay,!0)),window.addEventListener("orientationchange",(0,s.default)(j,x.debounceDelay,!0)),window.addEventListener("scroll",(0,u.default)(function(){(0,b.default)(w,x.once)},x.throttleDelay)),x.disableMutationObserver||d.default.ready("[data-aos]",O),w)};e.exports={init:_,refresh:j,refreshHard:O}},function(e,t){},,,,,function(e,t){(function(t){"use strict";function n(e,t,n){function o(t){var n=b,o=v;return b=v=void 0,k=t,g=e.apply(o,n)}function r(e){return k=e,h=setTimeout(f,t),M?o(e):g}function a(e){var n=e-w,o=e-k,i=t-n;return S?j(i,y-o):i}function c(e){var n=e-w,o=e-k;return void 0===w||n>=t||n<0||S&&o>=y}function f(){var e=O();return c(e)?d(e):void(h=setTimeout(f,a(e)))}function d(e){return h=void 0,_&&b?o(e):(b=v=void 0,g)}function l(){void 0!==h&&clearTimeout(h),k=0,b=w=v=h=void 0}function p(){return void 0===h?g:d(O())}function m(){var e=O(),n=c(e);if(b=arguments,v=this,w=e,n){if(void 0===h)return r(w);if(S)return h=setTimeout(f,t),o(w)}return void 0===h&&(h=setTimeout(f,t)),g}var b,v,y,g,h,w,k=0,M=!1,S=!1,_=!0;if("function"!=typeof e)throw new TypeError(s);return t=u(t)||0,i(n)&&(M=!!n.leading,S="maxWait"in n,y=S?x(u(n.maxWait)||0,t):y,_="trailing"in n?!!n.trailing:_),m.cancel=l,m.flush=p,m}function o(e,t,o){var r=!0,a=!0;if("function"!=typeof e)throw new TypeError(s);return i(o)&&(r="leading"in o?!!o.leading:r,a="trailing"in o?!!o.trailing:a),n(e,t,{leading:r,maxWait:t,trailing:a})}function i(e){var t="undefined"==typeof e?"undefined":c(e);return!!e&&("object"==t||"function"==t)}function r(e){return!!e&&"object"==("undefined"==typeof e?"undefined":c(e))}function a(e){return"symbol"==("undefined"==typeof e?"undefined":c(e))||r(e)&&k.call(e)==d}function u(e){if("number"==typeof e)return e;if(a(e))return f;if(i(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=i(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(l,"");var n=m.test(e);return n||b.test(e)?v(e.slice(2),n?2:8):p.test(e)?f:+e}var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s="Expected a function",f=NaN,d="[object Symbol]",l=/^\s+|\s+$/g,p=/^[-+]0x[0-9a-f]+$/i,m=/^0b[01]+$/i,b=/^0o[0-7]+$/i,v=parseInt,y="object"==("undefined"==typeof t?"undefined":c(t))&&t&&t.Object===Object&&t,g="object"==("undefined"==typeof self?"undefined":c(self))&&self&&self.Object===Object&&self,h=y||g||Function("return this")(),w=Object.prototype,k=w.toString,x=Math.max,j=Math.min,O=function(){return h.Date.now()};e.exports=o}).call(t,function(){return this}())},function(e,t){(function(t){"use strict";function n(e,t,n){function i(t){var n=b,o=v;return b=v=void 0,O=t,g=e.apply(o,n)}function r(e){return O=e,h=setTimeout(f,t),M?i(e):g}function u(e){var n=e-w,o=e-O,i=t-n;return S?x(i,y-o):i}function s(e){var n=e-w,o=e-O;return void 0===w||n>=t||n<0||S&&o>=y}function f(){var e=j();return s(e)?d(e):void(h=setTimeout(f,u(e)))}function d(e){return h=void 0,_&&b?i(e):(b=v=void 0,g)}function l(){void 0!==h&&clearTimeout(h),O=0,b=w=v=h=void 0}function p(){return void 0===h?g:d(j())}function m(){var e=j(),n=s(e);if(b=arguments,v=this,w=e,n){if(void 0===h)return r(w);if(S)return h=setTimeout(f,t),i(w)}return void 0===h&&(h=setTimeout(f,t)),g}var b,v,y,g,h,w,O=0,M=!1,S=!1,_=!0;if("function"!=typeof e)throw new TypeError(c);return t=a(t)||0,o(n)&&(M=!!n.leading,S="maxWait"in n,y=S?k(a(n.maxWait)||0,t):y,_="trailing"in n?!!n.trailing:_),m.cancel=l,m.flush=p,m}function o(e){var t="undefined"==typeof e?"undefined":u(e);return!!e&&("object"==t||"function"==t)}function i(e){return!!e&&"object"==("undefined"==typeof e?"undefined":u(e))}function r(e){return"symbol"==("undefined"==typeof e?"undefined":u(e))||i(e)&&w.call(e)==f}function a(e){if("number"==typeof e)return e;if(r(e))return s;if(o(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=o(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(d,"");var n=p.test(e);return n||m.test(e)?b(e.slice(2),n?2:8):l.test(e)?s:+e}var u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},c="Expected a function",s=NaN,f="[object Symbol]",d=/^\s+|\s+$/g,l=/^[-+]0x[0-9a-f]+$/i,p=/^0b[01]+$/i,m=/^0o[0-7]+$/i,b=parseInt,v="object"==("undefined"==typeof t?"undefined":u(t))&&t&&t.Object===Object&&t,y="object"==("undefined"==typeof self?"undefined":u(self))&&self&&self.Object===Object&&self,g=v||y||Function("return this")(),h=Object.prototype,w=h.toString,k=Math.max,x=Math.min,j=function(){return g.Date.now()};e.exports=n}).call(t,function(){return this}())},function(e,t){"use strict";function n(e){var t=void 0,o=void 0,i=void 0;for(t=0;t<e.length;t+=1){if(o=e[t],o.dataset&&o.dataset.aos)return!0;if(i=o.children&&n(o.children))return!0}return!1}function o(){return window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver}function i(){return!!o()}function r(e,t){var n=window.document,i=o(),r=new i(a);u=t,r.observe(n.documentElement,{childList:!0,subtree:!0,removedNodes:!0})}function a(e){e&&e.forEach(function(e){var t=Array.prototype.slice.call(e.addedNodes),o=Array.prototype.slice.call(e.removedNodes),i=t.concat(o);if(n(i))return u()})}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){};t.default={isSupported:i,ready:r}},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(){return navigator.userAgent||navigator.vendor||window.opera||""}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),r=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,a=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,u=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,c=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,s=function(){function e(){n(this,e)}return i(e,[{key:"phone",value:function(){var e=o();return!(!r.test(e)&&!a.test(e.substr(0,4)))}},{key:"mobile",value:function(){var e=o();return!(!u.test(e)&&!c.test(e.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}}]),e}();t.default=new s},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e,t,n){var o=e.node.getAttribute("data-aos-once");t>e.position?e.node.classList.add("aos-animate"):"undefined"!=typeof o&&("false"===o||!n&&"true"!==o)&&e.node.classList.remove("aos-animate")},o=function(e,t){var o=window.pageYOffset,i=window.innerHeight;e.forEach(function(e,r){n(e,i+o,t)})};t.default=o},function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(12),r=o(i),a=function(e,t){return e.forEach(function(e,n){e.node.classList.add("aos-init"),e.position=(0,r.default)(e.node,t.offset)}),e};t.default=a},function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(13),r=o(i),a=function(e,t){var n=0,o=0,i=window.innerHeight,a={offset:e.getAttribute("data-aos-offset"),anchor:e.getAttribute("data-aos-anchor"),anchorPlacement:e.getAttribute("data-aos-anchor-placement")};switch(a.offset&&!isNaN(a.offset)&&(o=parseInt(a.offset)),a.anchor&&document.querySelectorAll(a.anchor)&&(e=document.querySelectorAll(a.anchor)[0]),n=(0,r.default)(e).top,a.anchorPlacement){case"top-bottom":break;case"center-bottom":n+=e.offsetHeight/2;break;case"bottom-bottom":n+=e.offsetHeight;break;case"top-center":n+=i/2;break;case"bottom-center":n+=i/2+e.offsetHeight;break;case"center-center":n+=i/2+e.offsetHeight/2;break;case"top-top":n+=i;break;case"bottom-top":n+=e.offsetHeight+i;break;case"center-top":n+=e.offsetHeight/2+i}return a.anchorPlacement||a.offset||isNaN(t)||(o=t),n+o};t.default=a},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){for(var t=0,n=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft-("BODY"!=e.tagName?e.scrollLeft:0),n+=e.offsetTop-("BODY"!=e.tagName?e.scrollTop:0),e=e.offsetParent;return{top:n,left:t}};t.default=n},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){return e=e||document.querySelectorAll("[data-aos]"),Array.prototype.map.call(e,function(e){return{node:e}})};t.default=n}])});
/**
 * @lib Beast
 * @ver 0.40.4
 * @url beastjs.org
 */

'use strict';

;(function () {

if (typeof window !== 'undefined') {

    // Polyfill for window.CustomEvent in IE
    if (typeof window.CustomEvent !== 'function') {
        window.CustomEvent = function (event, params) {
            params = params || {bubbles: false, cancelable: false, detail: undefined}
            var e = document.createEvent('CustomEvent')
            e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
            return e
        }
        window.CustomEvent.prototype = window.Event.prototype
    }

    window.Beast = {}
    document.addEventListener('DOMContentLoaded', function () {
        Beast.init()
    })

} else {
    global.Beast = {}
    module.exports = Beast
}

/*
 * Common vars
 */
var Declaration = {}                 // Declarations from Bease.decl()
var DeclarationFinished = false      // Flag turns true after the first Beast.node() call
var HttpRequestQueue = []            // Queue of required bml-files with link tag
var CssLinksToLoad = 0               // Num of <link rel="stylesheet"> in the <head>
var BeastIsReady = false             // If all styles and scripts are loaded
var OnBeastReadyCallbacks = []       // Functions to call when sources are ready
var ReStartBML = /<[a-z][^>]*\/?>/i  // matches start of BML substring
var ReDoubleQuote = /"/g             // matches "-symbols
var ReBackslash = /\\/g              // matches \-symbols
var ReLessThen = /</g                // matches <-symbols
var ReMoreThen = />/g                // matches >-symbols
var ReNL = /\n/g                     // matches \n-symbols
var ReCamelCase = /([a-z])([A-Z])/g  // matches camelCase pairs
var ReStylePairSplit = /:\s?/        // matches :-separation in style DOM-attribute

// Declaration properties that can't belong to user
var ReservedDeclarationProperies = {
    inherits:1,
    implementWith:1,
    expand:1,
    mod:1,
    mix:1,
    param:1,
    domInit:1,
    domAttr:1,
    on:1,
    onWin:1,
    onMod:1,
    onAttach:1,
    onRemove:1,
    tag:1,
    noElems:1,
    state:1,
    final:1,

    // 2 means not to inherit this field
    abstract:2,
    finalMod:2,
    __userMethods:2,
    __commonExpand:2,
    __flattenInherits:2,
    __finalMod:2,
    __elems:2,
    __isBlock:2,
}

// CSS-properties measured in px commonly
var CssPxProperty = {
    height:1,
    width:1,
    left:1,
    right:1,
    bottom:1,
    top:1,
    'line-height':1,
    'font-size':1,
}

// Single HTML-tags
var SingleTag = {
    area:1,
    base:1,
    br:1,
    col:1,
    command:1,
    embed:1,
    hr:1,
    img:1,
    input:1,
    keygen:1,
    link:1,
    meta:1,
    param:1,
    source:1,
    wbr:1,
}

// Text output helpers
function escapeDoubleQuotes (string) {
    return string.replace(ReBackslash, '\\\\').replace(ReDoubleQuote, '\\"').replace(ReNL, '\\n')
}
function escapeHtmlTags (string) {
    return string.replace(ReLessThen, '&lt;').replace(ReMoreThen, '&gt;')
}
function camelCaseToDash (string) {
    return string.replace(ReCamelCase, '$1-$2').toLowerCase()
}
function stringifyObject (ctx) {
    if (Array.isArray(ctx)) {
        var string = '['
        for (var i = 0, ii = ctx.length; i < ii; i++) {
            string += stringifyObject(ctx[i]) + ','
        }
        string = string.slice(0,-1)
        string += ']'
        return string
    }
    else if (typeof ctx === 'object') {
        var string = '{'
        for (var key in ctx) {
            if (ctx[key] !== undefined) {
                string += '"' + key + '":' + stringifyObject(ctx[key]) + ','
            }
        }
        if (string.length !== 1) {
            string = string.slice(0, -1)
        }
        string += '}'
        return string
    }
    else if (typeof ctx === 'string') {
        return '"' + escapeDoubleQuotes(ctx) + '"'
    }
    else if (typeof ctx === 'function' && ctx.beastDeclPath !== undefined) {
        return ctx.beastDeclPath
    }
    else {
        return ctx.toString()
    }
}
function objectIsEmpty (object) {
    for (var key in object) return false
    return true
}
function cloneObject (ctx) {
    if (Array.isArray(ctx)) {
        var array = []
        for (var i = 0, ii = ctx.length; i < ii; i++) {
            array.push(
                cloneObject(ctx[i])
            )
        }
        return array
    }
    else if (typeof ctx === 'object' && ctx !== null) {
        var object = {}
        for (var key in ctx) {
            object[key] = cloneObject(ctx[key])
        }
        return object
    }
    else {
        return ctx
    }
}

/**
 * Public Beast properties
 */
Beast.declaration = Declaration

/**
 * Initialize Beast
 */
Beast.init = function () {
    var links = document.getElementsByTagName('link')
    var bmlLinks = []

    for (var i = 0, ii = links.length; i < ii; i++) {
        var link = links[i]
        if (link.type === 'bml' || link.rel === 'bml') {
            RequireModule(link.href)
            bmlLinks.push(link)
        }
        if (link.rel === 'stylesheet') {
            CssLinksToLoad++
            link.onload = link.onerror = function () {
                CheckIfBeastIsReady()
            }
        }
    }

    for (var i = 0, ii = bmlLinks.length; i < ii; i++) {
        bmlLinks[i].parentNode.removeChild(bmlLinks[i])
    }

    CheckIfBeastIsReady()
}

/**
 * Require declaration script
 *
 * @url string Path to script file
 */
function RequireModule (url) {
    var xhr = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0')
    xhr.open('GET', url)
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            CheckIfBeastIsReady()
        }
    }
    HttpRequestQueue.push(xhr)
    xhr.send()
}

/**
 * Checks if all <link> are loaded
 */
function CheckIfBeastIsReady () {
    if (BeastIsReady) return

    var isReady = true

    for (var i = 0, ii = HttpRequestQueue.length; i < ii; i++) {
        var xhr = HttpRequestQueue[i]
        if (xhr.readyState !== 4 || xhr.status !== 200) {
            isReady = false
        }
    }
    if (document.styleSheets.length < CssLinksToLoad) {
        isReady = false
    }

    if (isReady) {
        for (var i = 0, ii = HttpRequestQueue.length; i < ii; i++) {
            EvalBml(
                HttpRequestQueue[i].responseText
            )
        }
        HttpRequestQueue = []
        ProcessBmlScripts()

        BeastIsReady = true
        for (var i = 0, ii = OnBeastReadyCallbacks.length; i < ii; i++) {
            OnBeastReadyCallbacks[i]()
        }
    }
}

/**
 * Converts <script type="bml"/> tag to Beast::evalBml() method
 */
function ProcessBmlScripts () {
    var scripts = document.getElementsByTagName('script')

    for (var i = 0, ii = scripts.length; i < ii; i++) {
        var script = scripts[i]

        if (script === undefined) {
            continue
        }

        var text = script.text

        if (script.type === 'bml' && text !== '') {
            EvalBml(text)
        }
    }
}

/**
 * Parses and attaches declaration to <head>-node.
 * If there's only XML inside, appends node to document.body.
 *
 * @text string Text to parse and attach
 */
function EvalBml (text) {
    var rootNode = eval(Beast.parseBML(text))
    if (/^[\s\n]*</.test(text)) {
        rootNode.render(document.body)
    }
}

/**
 * Initialize DOM: assign DOM-nodes to BemNodes
 * @domNode DOMElement Node to start with
 */
Beast.domInit = function (domNode, isInnerCall, parentBemNode, parentBlock) {
    // No more Beast.decl() after the first Beast.domInit() call
    if (!DeclarationFinished) {
        DeclarationFinished = true
        CompileDeclarations()
    }

    if (domNode === undefined) {
        return false
    }
    // ELEMENT_NODE
    else if (domNode.nodeType === 1) {
        var nodeName = domNode.getAttribute('data-node-name')
        if (nodeName !== null) {

            // BemNode
            var bemNode = isInnerCall ? Beast.node(nodeName, {__context: parentBlock}) : Beast.node(nodeName)
            var stringToEval = ''
            var implementedNodeName = ''

            // Assign attributes
            for (var i = 0, ii = domNode.attributes.length, name, value; i < ii; i++) {
                name = domNode.attributes[i].name
                value = domNode.attributes[i].value

                // Parse style to css object
                if (name === 'style') {
                    var stylePairs = value.split(';')
                    for (var j = 0, jj = stylePairs.length, stylePair; j < jj; j++) {
                        stylePair = stylePairs[j].split(ReStylePairSplit)
                        bemNode.css(stylePair[0], stylePair[1])
                    }
                }
                // Restore encoded objects
                else if (name === 'data-event-handlers') {
                    stringToEval += ';bemNode._domNodeEventHandlers = ' + decodeURIComponent(value)
                }
                else if (name === 'data-window-event-handlers') {
                    stringToEval += ';bemNode._windowEventHandlers = ' + decodeURIComponent(value)
                }
                else if (name === 'data-mod-handlers') {
                    stringToEval += ';bemNode._modHandlers = ' + decodeURIComponent(value)
                }
                else if (name === 'data-dom-init-handlers') {
                    stringToEval += ';bemNode._domInitHandlers = ' + decodeURIComponent(value)
                }
                else if (name === 'data-mod') {
                    stringToEval += ';bemNode._mod = ' + decodeURIComponent(value)
                }
                else if (name === 'data-param') {
                    stringToEval += ';bemNode._param = ' + decodeURIComponent(value)
                }
                else if (name === 'data-implemented-node-name') {
                    implementedNodeName = value
                }
                else if (name === 'data-no-elems') {
                    bemNode._noElems = true
                }
                // Else _domAttr
                else if (name !== 'class') {
                    bemNode.domAttr(name, value)
                }
            }

            if (stringToEval !== '') {
                eval(stringToEval)
            }

            for (var key in bemNode._param) {
                if (bemNode._param[key].__isStringifiedBemNode === true) {
                    bemNode._param[key] = eval(bemNode._param[key].string)
                }
            }

            if (isInnerCall !== undefined) {
                var parentDomNode = parentBemNode._domNode
                parentBemNode._domNode = undefined

                if (implementedNodeName !== '') {
                    Beast.node(implementedNodeName, {__context:parentBlock})
                        .appendTo(parentBemNode)
                        .implementWith(bemNode, true)
                } else {
                    parentBemNode.append(bemNode)
                    if (parentBemNode._noElems === true) {
                        bemNode.parentBlock(parentBlock)
                    }
                }

                parentBemNode._domNode = parentDomNode
            }

            // Assign children
            for (var i = 0, ii = domNode.childNodes.length, childNode; i < ii; i++) {
                Beast.domInit(
                    domNode.childNodes[i],
                    true,
                    bemNode,
                    bemNode._noElems === true
                        ? bemNode._parentBlock._parentNode._parentBlock
                        : bemNode._parentBlock
                )
            }

            // Assign flags
            bemNode._renderedOnce = true
            bemNode._isExpanded = true

            // Crosslink
            bemNode._domNode = domNode
            domNode.bemNode = bemNode

            // Add event handlers
            if (bemNode._domNodeEventHandlers !== undefined) {
                for (var eventName in bemNode._domNodeEventHandlers) {
                    for (var i = 0, ii = bemNode._domNodeEventHandlers[eventName].length; i < ii; i++) {
                        bemNode.on(eventName, bemNode._domNodeEventHandlers[eventName][i], true, false, true)
                    }
                }
            }
            if (bemNode._windowEventHandlers !== undefined) {
                for (var eventName in bemNode._windowEventHandlers) {
                    for (var i = 0, ii = bemNode._windowEventHandlers[eventName].length; i < ii; i++) {
                        bemNode.onWin(eventName, bemNode._windowEventHandlers[eventName][i], true, false, true)
                    }
                }
            }

            if (isInnerCall === undefined) {
                function finalWalk (bemNode) {
                    for (var i = 0, ii = bemNode._children.length; i < ii; i++) {
                        if (bemNode._children[i] instanceof BemNode) {
                            finalWalk(bemNode._children[i])
                        }
                    }
                    for (var name in bemNode._mod) {
                        bemNode._callModHandlers(name, bemNode._mod[name])
                    }
                    bemNode._domInit()
                    bemNode._onAttach(true)
                }
                finalWalk(bemNode)
            }

            domNode.removeAttribute('data-event-handlers')
            domNode.removeAttribute('data-window-event-handlers')
            domNode.removeAttribute('data-mod-handlers')
            domNode.removeAttribute('data-mod')
            domNode.removeAttribute('data-param')
            domNode.removeAttribute('data-after-dom-init-handlers')
            domNode.removeAttribute('data-node-name')
            domNode.removeAttribute('data-implemented-node-name')
            domNode.removeAttribute('data-no-elems')

            return bemNode
        }
    }
    // TEXT_NODE
    else if (domNode.nodeType === 3) {
        parentBemNode.append(domNode.nodeValue)
        return domNode.nodeValue
    }

    return false
}

/**
 * Declaration standart fields:
 * - inherits       string|array Inherited declarations by selector
 * - expand         function     Expand instructions
 * - mod            object       Default modifiers
 * - noElems        object       If block can have elements
 * - param          object       Default parameters
 * - domInit        function     DOM inititial instructions
 * - on             object       Event handlers
 * - onWin          object       Window event hadnlers
 * - onMod          object       Modifier change actions
 * - tag            string       DOM tag name
 *
 * @selector string 'block' or 'block__elem'
 * @decl     object
 */
Beast.decl = function (selector, decl) {
    if (typeof selector === 'object') {
        for (var key in selector) {
            Beast.decl(key, selector[key])
        }
        return this
    } else {
        selector = selector.toLowerCase()
    }

    if (typeof decl.final === 'string') {
        decl.final = [decl.final]
    }

    if (typeof decl.inherits === 'string') {
        decl.inherits = [decl.inherits]
    }

    if (typeof decl.mix === 'string') {
        decl.mix = [decl.mix]
    }

    if (decl.inherits !== undefined) {
        for (var i = 0, ii = decl.inherits.length; i < ii; i++) {
            decl.inherits[i] = decl.inherits[i].toLowerCase()
        }
    }

    if (Declaration[selector] !== undefined) {
        extendDecl(decl, Declaration[selector])
    }

    Declaration[selector] = decl

    // Store element declartion in block declaration (for inheritance needs)
    var blockName = ''
    var elemName = ''

    if (selector.indexOf('__') === -1) {
        decl.__isBlock = true
        blockName = selector
    } else {
        decl.__isBlock = false

        var selectorParts = selector.split('__')
        blockName = selectorParts[0]
        elemName = selectorParts[1]

        if (Declaration[blockName] === undefined) {
            Declaration[blockName] = {}
        }

        if (Declaration[blockName].__elems === undefined) {
            Declaration[blockName].__elems = []
        }

        Declaration[blockName].__elems.push(elemName)
    }

    return this
}

/**
 * Extends declaration with another
 * @decl    object extending decl
 * @extDecl object decl to extend with
 */
function extendDecl (decl, extDecl) {
    for (var key in extDecl) {
        if (decl[key] === undefined) {
            decl[key] = extDecl[key]
        }
        else if (
            typeof extDecl[key] === 'object' && !Array.isArray(extDecl[key])
        ) {
            extendDecl(decl[key], extDecl[key])
        }
    }
}

/**
 * Creates bemNode object
 *
 * @name    string         Node name
 * @attr    object         Node attributes
 * @content string|bemNode Last multiple argument
 * @return  BemNode
 */
Beast.node = function (name, attr) {
    // No more Beast.decl() after the first Beast.node() call
    if (!DeclarationFinished) {
        DeclarationFinished = true
        CompileDeclarations()
    }

    return new BemNode(
        name, attr, Array.prototype.splice.call(arguments, 2)
    )
}

/**
 * Compiles declaration fileds to methods, makes inheritances
 */
function CompileDeclarations () {
    function extend (obj, extObj) {
        for (var key in extObj) {
            if (
                ReservedDeclarationProperies[key] === 2 ||
                extObj.final !== undefined && extObj.final.indexOf(key) !== -1
            ) {
                continue
            }

            if (obj[key] === undefined) {
                obj[key] = typeof extObj[key] === 'object' && extObj[key].constructor === 'Object'
                    ? cloneObject(extObj[key])
                    : extObj[key]
            }
            else if (
                typeof extObj[key] === 'function' && obj[key]._inheritedDeclFunction === undefined
            ) {
                (function (fn, inheritedFn, inheritedDecl) {
                    fn._inheritedDeclFunction = function () {
                        // Imitate inherited decl context for inner inherited() calls
                        var temp = this._decl
                        this._decl = inheritedDecl
                        inheritedFn.apply(this, arguments)
                        this._decl = temp
                    }
                })(obj[key], extObj[key], extObj)
            }
            else if (
                typeof extObj[key] === 'object' && !Array.isArray(extObj[key])
            ) {
                extend(obj[key], extObj[key])
            }
        }
    }

    function inherit (declSelector, decl, inheritedDecls, final) {
        for (var i = inheritedDecls.length - 1; i >= 0; i--) {
            var selector = inheritedDecls[i]
            var inheritedDecl = Declaration[selector]
            var prevFinal

            decl.__flattenInherits.push(selector.toLowerCase())

            if (inheritedDecl !== undefined) {
                extend(decl, inheritedDecl)

                if (inheritedDecl.finalMod === true) {
                    prevFinal = final
                    final = {selector:{}, mod:{}}
                }

                if (final !== undefined) {
                    final.selector[selector] = true
                    if (inheritedDecl.mod !== undefined) {
                        for (var modName in inheritedDecl.mod) {
                            final.mod[modName.toLowerCase()] = true
                        }
                    }
                }

                if (inheritedDecl.inherits !== undefined) {
                    inherit(declSelector, decl, inheritedDecl.inherits, final)
                }

                setFinal(decl, final)

                if (inheritedDecl.finalMod === true) {
                    final = prevFinal
                }

                // Automatic element inheritence for block
                if (inheritedDecl.__elems && decl.__isBlock) {
                    for (var j = 0, jj = inheritedDecl.__elems.length; j < jj; j++) {
                        var elemName = inheritedDecl.__elems[j]
                        var elemSelector = declSelector + '__' + elemName
                        if (Declaration[elemSelector] === undefined) {
                            Beast.decl(
                                elemSelector, {
                                    inherits: selector + '__' + elemName
                                }
                            )
                            if (generatedDeclSelectors.indexOf(elemSelector) === -1) {
                                generatedDeclSelectors.push(elemSelector)
                            }
                        }
                    }
                }
            }
        }
    }

    function setFinal (decl, final) {
        if (final !== undefined) {
            if (decl.__finalMod === undefined) {
                decl.__finalMod = {}
            }
            if (decl.__finalMod._selector === undefined) {
                decl.__finalMod._selector = {}
            }
            for (var modName in final.mod) {
                if (decl.__finalMod[modName] === undefined) {
                    decl.__finalMod[modName] = {}
                    for (var selector in final.selector) {
                        decl.__finalMod[modName][selector] = true
                        decl.__finalMod._selector[selector] = true
                    }
                }
            }
        }
    }

    var generatedDeclSelectors = []
    var forEachSelector = function (decl, selector) {

        var final
        if (decl.finalMod === true) {
            final = {selector:{}, mod:{}}
            final.selector[selector] = true
            if (decl.mod !== undefined) {
                for (var modName in decl.mod) {
                    final.mod[modName.toLowerCase()] = true
                }
            }
        }

        // Extend decl with inherited rules
        if (decl.inherits !== undefined) {
            decl.__flattenInherits = []
            inherit(selector, decl, decl.inherits, final)
        }

        setFinal(decl, final)

        // Compile expand rules to methods array
        var expandHandlers = []
        if (decl.implementWith !== undefined) {
            expandHandlers.unshift(function () {
                this.implementWith(
                    Beast.node(decl.implementWith, undefined, this.get())
                )
            })
        }
        if (decl.expand !== undefined) {
            expandHandlers.unshift(decl.expand)
        }
        if (decl.mix !== undefined) {
            expandHandlers.unshift(function () {
                this.mix.apply(this, decl.mix)
            })
        }
        if (decl.tag !== undefined) {
            expandHandlers.unshift(function () {
                this.tag(decl.tag)
            })
        }
        if (decl.noElems === true) {
            expandHandlers.unshift(function () {
                this.noElems()
            })
        }
        if (decl.domAttr !== undefined) {
            expandHandlers.unshift(function () {
                this.domAttr(decl.domAttr)
            })
        }
        if (decl.onMod !== undefined) {
            expandHandlers.unshift(function () {
                for (var modName in decl.onMod) {
                    for (var modValue in decl.onMod[modName]) {
                        this.onMod(modName, modValue, decl.onMod[modName][modValue], true)
                    }
                }
            })
        }
        if (decl.on !== undefined) {
            expandHandlers.unshift(function () {
                for (var events in decl.on) {
                    if (events === 'preventable') {
                        for (var preventableEvents in decl.on.preventable) {
                            this.on(preventableEvents, decl.on.preventable[preventableEvents], false, decl, true)
                        }
                    } else {
                        this.on(events, decl.on[events], false, decl)
                    }
                }
            })
        }
        if (decl.onWin !== undefined) {
            expandHandlers.unshift(function () {
                for (var events in decl.onWin) {
                    if (events === 'preventable') {
                        for (var preventableEvents in decl.onWin.preventable) {
                            this.onWin(preventableEvents, decl.onWin.preventable[preventableEvents], false, decl, true)
                        }
                    } else {
                        this.onWin(events, decl.onWin[events], false, decl)
                    }
                }
            })
        }

        // Compile expand handlers
        if (expandHandlers.length > 0) {
            decl.__commonExpand = function () {
                for (var i = 0, ii = expandHandlers.length; i < ii; i++) {
                    expandHandlers[i].call(this)
                }
            }
        }

        // Extract user methods
        decl.__userMethods = {}
        for (var key in decl) {
            if (ReservedDeclarationProperies[key] !== 1) {
                decl.__userMethods[key] = decl[key]
            }
        }

    }

    for (var selector in Declaration) {
        forEachSelector(Declaration[selector], selector)
    }

    if (generatedDeclSelectors.length !== 0) {
        for (var i = 0, ii = generatedDeclSelectors.length; i < ii; i++) {
            forEachSelector(
                Declaration[generatedDeclSelectors[i]],
                generatedDeclSelectors[i]
            )
        }
    }
}

/**
 * Set callback when Beast is ready
 *
 * @callback function Function to call
 */
Beast.onReady = function (callback) {
    if (BeastIsReady) {
        callback()
    } else {
        OnBeastReadyCallbacks.push(callback)
    }
}

;(function () {

Beast.parseBML = function (string) {
    js = ''
    buffer = ''
    char = ''
    prevChar = ''
    nextChar = ''
    lastPush = ''
    nodeAttrValueQuote = ''

    openNodesNum = 0
    openBracesNum = 0

    embedStack = []

    inBml = false
    inBmlComment = false
    inNode = false
    inClosingNode = false
    inNodeName = false
    inNodeAttrName = false
    inNodeAttrValue = false
    inNodeTextContent = false
    inSingleQuoteString = false
    inDoubleQuoteString = false
    inSingleLineComment = false
    inMultiLineComment = false
    inEmbed = false

    for (var i = 0, ii = string.length; i < ii; i++) {
        prevChar = i > 0 ? string[i - 1] : ''
        nextChar = i < ii - 1 ? string[i + 1] : ''
        char = string[i]

        // Reset escape char
        if (prevChar === '\\' && char === '\\') {
            prevChar = ''
        }

        /*
         * BML context
         */
        if (inBml) {
            // Node attr value
            if (inNodeAttrValue) {
                if (char === nodeAttrValueQuote && prevChar !== '\\') {
                    pushNodeAttrValue()
                }
                else if (char === '{' && prevChar !== '\\') {
                    pushNodeAttrValue(true)
                    pushEmbed()
                }
                else {
                    if ((char === '"' || char === "'") && prevChar !== '\\') {
                        buffer += '\\'
                    }
                    buffer += char
                }
            }
            // Comment
            else if (inBmlComment) {
                if (prevChar === '-' && char === '>') {
                    inBmlComment = false
                }
            }
            // Comment start
            else if (char === '<' && nextChar === '!') {
                inBmlComment = true
            }
            // Node text content
            else if (inNodeTextContent) {
                if (char === '<' && (nextChar === '/' || isLetter(nextChar))) {
                    pushNodeTextContent()
                }
                else if (char === '{' && prevChar !== '\\') {
                    pushNodeTextContent(true)
                    pushEmbed()
                }
                else {
                    if (char === '"') {
                        buffer += '\\' + char
                    }
                    else if (char === '\n') {
                        buffer += '\\n'
                    }
                    else {
                        buffer += char
                    }
                }
            }
            // Break char: space, new line or tab
            else if (isBreak(char)) {
                if (inNodeName) {
                    pushNodeName()
                    inNodeAttrName = true
                }
                else if (inNodeAttrName) {
                    pushNodeAttrName()
                }

                if (inNode && !inNodeName && isLetter(nextChar)) {
                    inNodeAttrName = true
                }
            }
            else if ((inNodeName || inNodeAttrName) && isLetterOrDigitOrDash(char)) {
                buffer += char

                // Node attr name start
                if (!inNodeName && !inNodeAttrName) {
                    inNodeAttrName = true
                }
            }
            // Node attr name end
            else if (inNodeAttrName && prevChar === '=' && (char === '"' || char === "'")) {
                pushNodeAttrName()
                inNodeAttrValue = true
                nodeAttrValueQuote = char
            }
            // Node opening start
            else if (!inNode && prevChar === '<' && isLetter(char)) {
                buffer += char
                inNode = true
                inNodeName = true
                pushNodeOpen()
            }
            // Node closing start
            else if (!inClosingNode && prevChar === '<' && char === '/' && isLetter(nextChar)) {
                inClosingNode = true
                inNodeName = true
            }
            // Single node closed
            else if (inNode && prevChar === '/' && char === '>') {
                if (inNodeName) {
                    pushNodeName()
                }
                if (inNodeAttrName) {
                    pushNodeAttrName()
                }

                pushClosingNode()
            }
            // Node opening end
            else if (inNode && char === '>') {
                if (inNodeName) {
                    pushNodeName()
                }
                if (inNodeAttrName) {
                    pushNodeAttrName()
                }

                pushOpeningNodeClose()
                inNodeTextContent = true
            }
            // Node closing end
            else if (char === '>' && inClosingNode) {
                pushClosingNode()
            }
            // Skip char for future
            else if (
                !(inNode && !inNodeAttrValue && char === '/' && nextChar === '>') &&
                !(inNodeAttrName && char === '=' && nextChar !== '=')
            ) {
                // Unexpected char
                throw (
                    'BML syntax error: Unexpected token "' + char + '": \n' +
                    string.substring(0, i+1).split('\n').slice(-5).join('\n') + '\n' +
                    js.slice(-100)
                )
            }
        }

        /*
         * JS context
         */
        else {
            // New line
            if (char === '\n') {
                if (inSingleLineComment) {
                    inSingleLineComment = false
                }
            }
            // Single line comment
            else if (prevChar === '/' && char === '/' && !inSingleQuoteString && !inDoubleQuoteString) {
                if (!inSingleLineComment) {
                    inSingleLineComment = true
                }
            }
            // Multi line comment
            else if (prevChar === '/' && char === '*' && !inSingleQuoteString && !inDoubleQuoteString) {
                if (!inMultiLineComment) {
                    inMultiLineComment = true
                }
            }
            else if (prevChar === '*' && char === '/' && !inSingleQuoteString && !inDoubleQuoteString) {
                if (inMultiLineComment) {
                    inMultiLineComment = false
                }
            }
            // If not inside comment
            else if (!inSingleLineComment && !inMultiLineComment) {
                // Single quote string
                if (!inDoubleQuoteString && char === "'" && prevChar !== '\\') {
                    inSingleQuoteString = !inSingleQuoteString
                }
                // Double quote string
                else if (!inSingleQuoteString && char === '"' && prevChar !== '\\') {
                    inDoubleQuoteString = !inDoubleQuoteString
                }
                // If not inside string
                else if (!inSingleQuoteString && !inDoubleQuoteString) {
                    // Embedded JS
                    if (inEmbed) {
                        if (char === '{') {
                            openBracesNum++
                        }
                        else if (char === '}') {
                            openBracesNum--
                        }

                        if (openBracesNum === 0) {
                            popEmbed()
                        }
                    }

                    // BML
                    if (!inBml && char === '<' && isLetter(nextChar)) {
                        inBml = true

                        if (inEmbed) {
                            embedStack.push([openNodesNum, openBracesNum, inNode, inNodeTextContent, inNodeAttrValue, nodeAttrValueQuote])
                            openNodesNum = 0
                            openBracesNum = 0
                            inNode = false
                            inNodeTextContent = false
                            inNodeAttrValue = false
                            nodeAttrValueQuote = ''
                        }
                    }
                }
            }
        }

        if (!inBml && char !== '') {
            js += char
        }
    }

    return js
}

var js = ''
var buffer = ''
var char = ''
var prevChar = ''
var nextChar = ''
var lastPush = ''
var nodeAttrValueQuote = ''

var openNodesNum = 0
var openBracesNum = 0

var embedStack = []

var inBml = false
var inBmlComment = false
var inNode = false
var inClosingNode = false
var inNodeName = false
var inNodeAttrName = false
var inNodeAttrValue = false
var inNodeTextContent = false
var inSingleQuoteString = false
var inDoubleQuoteString = false
var inSingleLineComment = false
var inMultiLineComment = false
var inEmbed = false

function pushNodeOpen () {

    if (!inEmbed || openNodesNum > 0) {
        if (lastPush === 'closingNode') {
            js += ','
        }
        else if (lastPush === 'nodeTextContent') {
            js += ','
        }
        else if (lastPush === 'embed') {
            js += ','
        }
        else if (lastPush === 'openingNodeClose') {
            js += ','
        }
        else if (lastPush === 'nodeName') {
            js += ',undefined,'
        }
        else if (lastPush === 'nodeAttrName') {
            js += 'true},'
        }
        else if (lastPush === 'nodeAttrValue') {
            js += '},'
        }
    }

    openNodesNum++
    js += 'Beast.node('
    lastPush = 'nodeOpen'
}

function pushClosingNode () {
    if (lastPush === 'nodeAttrName') {
        js += 'true}'
    }
    else if (lastPush === 'nodeAttrValue') {
        js += '}'
    }

    openNodesNum--
    js += ')'
    buffer = ''
    inNode = false
    inClosingNode = false
    inNodeTextContent = true
    inNodeName = false
    lastPush = 'closingNode'

    if (openNodesNum === 0) {
        if (inEmbed) {
            var parserState = embedStack.pop()
            openNodesNum = parserState[0]
            openBracesNum = parserState[1]
            inNode = parserState[2]
            inNodeTextContent = parserState[3]
            inNodeAttrValue = parserState[4]
            nodeAttrValueQuote = parserState[5]
        } else {
            inNodeTextContent = false
        }

        inBml = false
        char = ''
        prevChar = ''
        nextChar = ''
        lastPush = ''
    }
}

function pushNodeName () {
    js += '"' + buffer + '"'
    buffer = ''
    inNodeName = false
    lastPush = 'nodeName'

    if (openNodesNum === 1 && !inEmbed) {
        js += ',{__context:this'
        lastPush = 'nodeAttrValue'
    }
}

function pushNodeAttrName () {
    if (lastPush === 'nodeName') {
        js += ',{'
    }
    else if (lastPush === 'nodeAttrName') {
        js += 'true,'
    }
    else if (lastPush === 'nodeAttrValue') {
        js += ','
    }

    js += '"' + buffer + '":'
    buffer = ''
    inNodeAttrName = false
    lastPush = 'nodeAttrName'
}

function pushNodeAttrValue (beforePushEmbed) {
    if (lastPush === 'embed') {
        if (buffer !== '') {
            js += '+'
        }
    }
    else if (lastPush === 'nodeAttrName' && buffer === '' && beforePushEmbed === undefined) {
        js += 'false'
    }

    if (buffer !== '') {
        if (beforePushEmbed === undefined) {
            js += isNaN(buffer) || lastPush === 'embed' ? '"' + buffer + '"' : buffer
            buffer = ''
        } else {
            js += '"' + buffer + '"'
        }
    }

    if (beforePushEmbed === undefined) {
        nodeAttrValueQuote = ''
        inNodeAttrValue = false
    }

    lastPush = 'nodeAttrValue'
}

function pushOpeningNodeClose () {
    if (lastPush === 'nodeName') {
        if (nextChar !== '<') {
            js += ',undefined'
        }
    }
    else if (lastPush === 'nodeAttrName') {
        js += 'true}'
    }
    else if (lastPush === 'nodeAttrValue') {
        js += '}'
    }

    inNode = false
    lastPush = 'openingNodeClose'
}

function pushNodeTextContent (beforePushEmbed) {
    if (buffer !== '') {
        if (lastPush === 'closingNode') {
            js += ','
        }
        else if (lastPush === 'embed') {
            js += ','
        }
        else if (lastPush === 'openingNodeClose') {
            js += ','
        }

        js += '"' + buffer + '"'
        buffer = ''
        lastPush = 'nodeTextContent'
    }

    if (beforePushEmbed === undefined) {
        inNodeTextContent = false
    }
}

function pushEmbed () {
    if (inNodeTextContent) {
        if (lastPush === 'closingNode') {
            js += ','
        }
        else if (lastPush === 'nodeTextContent') {
            js += ','
        }
        else if (lastPush === 'openingNodeClose') {
            js += ','
        }
    }
    else if (inNodeAttrValue) {
        if (buffer !== '') {
            js += '+'
            buffer = ''
        }
    }

    openBracesNum++
    inBml = false
    inEmbed = true
    char = ''
    lastPush = 'embed'
}


function popEmbed () {
    if (inNodeAttrValue) {
        if (buffer !== '') {
            js += buffer
            buffer = ''
        }
    }

    inBml = true

    if (embedStack.length === 0) {
        inEmbed = false
    }

    lastPush = 'embed'
}

function isLetter (char) {
    return char >= 'A' && char <= 'z'
}

function isLetterOrDigitOrDash (char) {
    return char >= 'A' && char <= 'z' || char >= '0' && char <= '9' || char === '-'
}

function isBreak (char) {
    return char === ' ' || char === '\n' || char === '\t'
}

})();

/**
 * Parses and evaluates BML-string
 */
Beast.evalBML = function (string) {
    return eval(Beast.parseBML(string))
}


/**
 * Finds difference between @newNode and @oldNode and patches the DOM
 * @parentDomNode DomElement Node to fix children
 * @newNode       BemNode    Node after state change
 * @oldNode       BemNode    Node before state change
 * @index         number     Nodes common index
 */
Beast.patchDom = function (parentDomNode, newNode, oldNode, newIndex, oldIndex, oldParentNode) {
    if (newNode === undefined && oldNode === undefined) {
        return
    }
    if (newIndex === undefined) {
        newIndex = 0
    }
    if (oldIndex === undefined) {
        oldIndex = 0
    }

    // If newNode linked with oldNode -
    // move nodes to the end until newNode index equals to its DOM node index,
    // then if newNode and oldNode has any differences - continue children patching
    if (newNode !== undefined && newNode._domNode !== undefined) {
        var oldNodeReplacing
        while (newNode._domNode !== parentDomNode.childNodes[newIndex]) {
            oldNodeReplacing = oldParentNode._children[oldIndex]
            oldParentNode._children.splice(oldIndex, 1)
            oldParentNode._children.push(oldNodeReplacing)
            parentDomNode.appendChild(
                typeof oldNodeReplacing === 'string'
                    ? parentDomNode.childNodes[newIndex]
                    : oldNodeReplacing._domNode
            )
        }

        oldNodeReplacing = oldParentNode._children[oldIndex]

        if (oldNodeReplacing._linkedWithHashGlobal) {
            patchDomAttributes(newNode._domNode, newNode, oldNodeReplacing)
            patchDomEventHandlers(newNode._domNode, newNode, oldNodeReplacing)
            newNode._domInit()
            return
        } else {
            oldNode = oldNodeReplacing
        }
    }

    // If there's no oldNode or oldNode linked with other newNode -
    // create newNode DOM and decrement oldIndex
    else if (oldNode === undefined || oldNode !== undefined && oldNode._linkedNewNode !== undefined) {
        if (newNode instanceof BemNode) {
            newNode.render()
        } else {
            parentDomNode.appendChild(
                document.createTextNode(newNode)
            )
        }
        return true
    }

    // If there's no newNode -
    // remove the rest oldNodes DOM
    else if (newNode === undefined) {
        var oldNodeReplacing
        while (parentDomNode.childNodes[newIndex] !== undefined) {
            oldNodeReplacing = oldParentNode._children[oldIndex]

            if (oldNodeReplacing instanceof BemNode) {
                oldNodeReplacing.remove()
            } else {
                oldParentNode._children.splice(oldIndex, 1)
                parentDomNode.removeChild(
                    parentDomNode.childNodes[newIndex]
                )
            }
        }

        return false
    }

    // If DOM nodes of newNode and oldNode are incompatible -
    // remove oldNode DOM and create newNode DOM
    else if (
        typeof newNode !== typeof oldNode ||
        typeof newNode === 'string' && newNode !== oldNode ||
        newNode._tag !== oldNode._tag
    ) {
        if (newNode instanceof BemNode) {
            newNode.render()
            if (parentDomNode.childNodes[newIndex + 1] !== undefined) {
                parentDomNode.removeChild(
                    parentDomNode.childNodes[newIndex + 1]
                )
            }
        } else {
            parentDomNode.replaceChild(
                document.createTextNode(newNode),
                parentDomNode.childNodes[newIndex]
            )
        }

        return
    }

    // If newNode and oldNode are compatible -
    // patch them and go down to children
    if (newNode instanceof BemNode) {
        newNode._domNode = oldNode._domNode
        newNode._domNode.bemNode = newNode
        newNode._renderedOnce = true

        patchDomAttributes(newNode._domNode, newNode, oldNode)
        patchDomEventHandlers(newNode._domNode, newNode, oldNode)

        var newNodeChild
        var oldNodeChild
        var newNodeChildrenNum = newNode._children.length
        var oldNodeChildrenNum = oldNode._children.length

        // Link children with key
        for (var i = 0; i < newNodeChildrenNum; i++) {
            newNodeChild = newNode._children[i]

            if (typeof newNodeChild === 'string') {
                continue
            }

            for (var j = 0; j < oldNodeChildrenNum; j++) {
                oldNodeChild = oldNode._children[j]

                if (typeof oldNodeChild === 'string' || oldNodeChild._linkedWithHashGlobal) {
                    continue
                }

                if (
                    newNodeChild._hashGlobal === oldNodeChild._hashGlobal ||

                    newNodeChild._hashLocal === oldNodeChild._hashLocal &&
                    !oldNodeChild._linkedWithHashLocal &&
                    newNodeChild._domNode === undefined
                ) {
                    if (oldNodeChild._linkedNewNode !== undefined) {
                        oldNodeChild._linkedNewNode._domNode = undefined
                        oldNodeChild._linkedNewNode._renderedOnce = false
                    }

                    newNodeChild._domNode = oldNodeChild._domNode
                    newNodeChild._domNode.bemNode = newNodeChild
                    newNodeChild._renderedOnce = true

                    oldNodeChild._linkedNewNode = newNodeChild
                    oldNodeChild._linkedWithHashGlobal = newNodeChild._hashGlobal === oldNodeChild._hashGlobal
                    oldNodeChild._linkedWithHashLocal = true

                    if (oldNodeChild._linkedWithHashGlobal) {
                        break
                    }
                }
            }
        }

        // Patch children
        for (var i = 0, oldNodeIndexDec = 0, patchResult; i < newNodeChildrenNum || i < oldNodeChildrenNum + oldNodeIndexDec; i++) {
            patchResult = Beast.patchDom(
                newNode._domNode,
                newNode._children[i],
                oldNode._children[i - oldNodeIndexDec],
                i,
                i - oldNodeIndexDec,
                oldNode
            )

            if (patchResult === false) break
            if (patchResult === true) oldNodeIndexDec++
        }

        newNode._domInit()
    }
}

/**
 * Finds difference in DOM attributes and patches it
 * @domNode DomElement DOM node to fix attributes
 * @newNode BemNode    Node after state change
 * @oldNode BemNode    Node before state change
 */
function patchDomAttributes (domNode, newNode, oldNode) {

    // Compare DOM classes
    var newDomClasses = newNode._setDomNodeClasses(true)
    var oldDomClasses = oldNode._setDomNodeClasses(true)
    if (newDomClasses !== oldDomClasses) {
        domNode.className = newDomClasses
    }

    // Compare CSS properties
    var cssPropNames = keysFromObjects(newNode._css, oldNode._css)
    for (var i = 0, ii = cssPropNames.length, name; i < ii; i++) {
        name = cssPropNames[i]
        if (newNode._css[name] === undefined) {
            domNode.style[name] = ''
        }
        else if (newNode._css[name] !== oldNode._css[name]) {
            domNode.style[name] = newNode._css[name]
        }
    }

    // Compare DOM attributes
    var domAttrNames = keysFromObjects(newNode._domAttr, oldNode._domAttr)
    for (var i = 0, ii = domAttrNames.length, name; i < ii; i++) {
        name = domAttrNames[i]
        if (newNode._domAttr[name] === undefined) {
            domNode.removeAttribute(name)
        }
        else if (newNode._domAttr[name] !== oldNode._domAttr[name]) {
            domNode.setAttribute(name, newNode._domAttr[name])
        }
    }
}

/**
 * Finds difference in event handlers and patches it
 * @domNode DomElement DOM node to fix event handlers
 * @newNode BemNode    Node after state change
 * @oldNode BemNode    Node before state change
 */
function patchDomEventHandlers (domNode, newNode, oldNode) {
    var nodesAreDifferent = newNode._selector !== oldNode._selector

    // Remove previous handlers
    if (nodesAreDifferent || oldNode._hasExpandContextEventHandlers || oldNode._hasDomInitContextEventHandlers) {
        for (var eventName in oldNode._domNodeEventHandlers) {
            for (var i = 0, ii = oldNode._domNodeEventHandlers[eventName].length, eventHandler; i < ii; i++) {
                eventHandler = oldNode._domNodeEventHandlers[eventName][i]
                if (nodesAreDifferent || eventHandler.isExpandContext || eventHandler.isDomInitContext) {
                    domNode.removeEventListener(eventName, eventHandler)
                }
            }
        }
    }
    if (nodesAreDifferent || oldNode._hasExpandContextWindowEventHandlers || oldNode._hasDomInitContextWindowEventHandlers) {
        for (var eventName in oldNode._windowEventHandlers) {
            for (var i = 0, ii = oldNode._windowEventHandlers[eventName].length, eventHandler; i < ii; i++) {
                eventHandler = oldNode._windowEventHandlers[eventName][i]
                if (nodesAreDifferent || eventHandler.isExpandContext || eventHandler.isDomInitContext) {
                    window.removeEventListener(eventName, eventHandler)
                }
            }
        }
    }

    // Add new handlers
    if (nodesAreDifferent || newNode._hasExpandContextEventHandlers) {
        for (var eventName in newNode._domNodeEventHandlers) {
            for (var i = 0, ii = newNode._domNodeEventHandlers[eventName].length, eventHandler; i < ii; i++) {
                eventHandler = newNode._domNodeEventHandlers[eventName][i]
                if (nodesAreDifferent || eventHandler.isExpandContext) {
                    newNode.on(eventName, eventHandler, true, false, true)
                }
            }
        }
    }
    if (nodesAreDifferent || newNode._hasExpandContextWindowEventHandlers) {
        for (var eventName in newNode._windowEventHandlers) {
            for (var i = 0, ii = newNode._windowEventHandlers[eventName].length, eventHandler; i < ii; i++) {
                eventHandler = newNode._windowEventHandlers[eventName][i]
                if (nodesAreDifferent || eventHandler.isExpandContext) {
                    newNode.onWin(eventName, eventHandler, true, false, true)
                }
            }
        }
    }
}


/**
 * Extracts keys from object in @arguments
 * @return Array Array of keys
 */
function keysFromObjects () {
    var keys = []
    for (var i = 0, ii = arguments.length; i < ii; i++) {
        if (arguments[i] === undefined) {
            continue
        }
        for (var key in arguments[i]) {
            if (keys.indexOf(key) === -1) {
                keys.push(key)
            }
        }
    }
    return keys
}

/**
 * TODO
 */
function stringToHash (string) {
    if (string === '') return ''

    var hash = 0
    for (var i = 0, ii = string.length; i < ii; i++) {
        hash = ((hash << 5) - hash + string.charCodeAt(i)) | 0
    }
    return hash.toString()
}

/**
 * BEM node class
 *
 * @nodeName string Starts with capital for block else for elem
 * @attr     object List of attributes
 * @children array  Child nodes
 */
var BemNode = function (nodeName, attr, children) {
    this._selector = ''                     // BEM-name: 'block' or 'block__elem'
    this._nodeName = nodeName               // BML-node name
    this._attr = attr || {}                 // BML-node attributes
    this._isBlock = false                   // flag if node is block
    this._isElem = false                    // flag if node is elem
    this._mod = {}                          // modifiers list
    this._param = {}                        // parameters list
    this._state = undefined                 // reactive states
    this._domNode = undefined               // DOM-node reference
    this._domAttr = {}                      // DOM-attributes
    this._domNodeEventHandlers = undefined  // DOM event handlers
    this._windowEventHandlers = undefined   // window event handlers
    this._modHandlers = undefined           // handlers on modifiers change
    this._domInitHandlers = []              // Handlers called after DOM-node inited
    this._domInited = false                 // Flag if DOM-node inited
    this._parentBlock = undefined           // parent block bemNode reference
    this._parentNode = undefined            // parent bemNode reference
    this._prevParentNode = undefined        // previous parent node value when parent node redefined
    this._children = []                     // list of children
    this._expandedChildren = undefined      // list of expanded children (for expand method purposes)
    this._isExpanded = false                // if Bem-node was expanded
    this._isExpandContext = false           // when flag is true append modifies expandedChildren
    this._isReplaceContext = false          // when flag is true append don't renders children's DOM
    this._isRenderStateContext = false      // when flag is true replaceWith don't call render
    this._isDomInitContext = false          // when flag is true inside domInit functions
    this._mix = []                          // list of additional CSS classes
    this._tag = 'div'                       // DOM-node name
    this._noElems = false                   // Flag if block can have children
    this._implementedNode = undefined       // Node wich this node implements
    this._css = {}                          // CSS properties
    this._cssClasses = undefined            // cached string of CSS classes
    this._decl = undefined                  // declaration for component
    this._flattenInherits = undefined       // array of flattened inherited declarations
    this._flattenInheritsForDom = undefined // array of inherited declarations to add as DOM-classes
    this._renderedOnce = false              // flag if component was rendered at least once
    this._elems = []                        // array of elements (for block only)
    this._hashGlobal = ''
    this._hashLocal = ''
    this._linkedNewNode = undefined

    // Define if block or elem
    var firstLetter = nodeName.substr(0,1)
    this._isBlock = firstLetter === firstLetter.toUpperCase()
    this._isElem = !this._isBlock

    // Define mods, params and special params
    for (var key in this._attr) {
        var firstLetter = key.substr(0,1)

        if (key === '__context') {
            if (this._parentBlock === undefined) {
                this.parentBlock(this._attr.__context)
            }
        } else if (firstLetter === firstLetter.toUpperCase()) {
            this._mod[key.toLowerCase()] = this._attr[key]
        } else {
            this._param[key.toLowerCase()] = this._attr[key]
        }
    }

    // Initial operations for block
    if (this._isBlock) {
        this._parentBlock = this
        this._defineDeclarationBySelector(nodeName.toLowerCase())
    }

    // Append children
    this.append.apply(this, children)
}

BemNode.prototype = {

    /**
     * Defines declaraion
     */
    _defineDeclarationBySelector: function (selector) {

        // Rerset old mods, params and state when declaration redefined
        if (this._decl !== undefined) {
            if (this._decl.mod !== undefined) {
                var nameLC
                for (var name in this._decl.mod) {
                    nameLC = name.toLowerCase()
                    if (this._mod[nameLC] === this._decl.mod[name]) {
                        this._mod[nameLC] = undefined
                    }
                }
            }
            if (this._decl.param !== undefined) {
                var nameLC
                for (var name in this._decl.param) {
                    nameLC = name.toLowerCase()
                    if (this._param[nameLC] === this._decl.param[name]) {
                        this._param[nameLC] = undefined
                    }
                }
            }
            if (this._decl.state !== undefined) {
                this._state = undefined
            }
        }

        this._selector = selector
        this._decl = Declaration[this._selector]
        this._flattenInherits = this._decl && this._decl.__flattenInherits // in case of temporary _decl change
        this._flattenInheritsForDom = undefined

        if (this._decl !== undefined) {

            if (this._decl.mod !== undefined) {
                this.defineMod(this._decl.mod)
            }
            if (this._decl.param !== undefined) {
                this.defineParam(this._decl.param)
            }
            if (this._decl.state !== undefined) {
                this._state = this._decl.state.call(this)
            }
        }

        if (this._flattenInherits !== undefined) {
            for (var i = 0, ii = this._flattenInherits.length, decl; i < ii; i++) {
                decl = Declaration[this._flattenInherits[i]]
                if (decl === undefined || decl.abstract === undefined) {
                    if (this._flattenInheritsForDom === undefined) {
                        this._flattenInheritsForDom = []
                    }
                    this._flattenInheritsForDom.push(this._flattenInherits[i])
                }
                else if (decl !== undefined) {
                    if (decl.mod !== undefined) {
                        this.defineMod(decl.mod)
                    }
                    if (decl.param !== undefined) {
                        this.defineParam(decl.param)
                    }
                }
            }
        }

        this._defineUserMethods()
    },

    /**
     * Defines user's methods
     */
    _defineUserMethods: function (selector) {
        var decl = selector !== undefined ? Declaration[selector] : this._decl
        if (decl) {
            for (var methodName in decl.__userMethods) {
                this[methodName] = decl.__userMethods[methodName]
            }
        }
    },

    /**
     * Clears user's methods
     */
    _clearUserMethods: function () {
        if (this._selector === '' || !Declaration[this._selector]) return
        var userMethods = Declaration[this._selector].__userMethods
        for (var methodName in userMethods) {
            this[methodName] = undefined
        }
    },

    /**
     * Runs overwritten method's code
     *
     * @caller function ECMA6 claims caller function link
     */
    inherited: function (caller) {
        if (caller && caller._inheritedDeclFunction !== undefined) {
            caller._inheritedDeclFunction.apply(
                this,
                Array.prototype.splice.call(arguments, 1)
            )
        }

        return this
    },

    /**
     * Checks if component is @selctor was inherited from @selector
     *
     * @selector string
     * @return boolean
     */
    isKindOf: function (selector) {
        selector = selector.toLowerCase()
        var isKindOfSelector = this._selector === selector

        if (!isKindOfSelector && this._flattenInherits !== undefined) {
            isKindOfSelector = this._flattenInherits.indexOf(selector) > -1
        }

        return isKindOfSelector
    },

    /**
     * If node is block
     *
     * @return boolean
     */
    isBlock: function () {
        return this._isBlock
    },

    /**
     * If node is element
     *
     * @return boolean
     */
    isElem: function () {
        return this._isElem
    },

    /**
     * Gets block or element name: 'block' or 'block__element'
     *
     * @return string
     */
    selector: function () {
        return this._selector
    },

    /**
     * Gets or sets node's tag name
     *
     * @return string
     */
    tag: function (tag) {
        if (tag === undefined) {
            return this._tag
        } else {
            if (!this._domNode) {
                this._tag = tag
            }
            return this
        }
    },

    /**
     * Sets css
     *
     * @name  string        css-property name
     * @value string|number css-property value
     */
    css: function (name, value) {
        if (typeof name === 'object') {
            for (var key in name) this.css(key, name[key])
        } else if (value === undefined) {
            if (this._domNode !== undefined && this._css[name] === undefined) {
                return window.getComputedStyle(this._domNode).getPropertyValue(name)
            } else {
                return this._css[name]
            }
        } else {
            if (typeof value === 'number' && CssPxProperty[name]) {
                value += 'px'
            }

            this._css[name] = value

            if (this._domNode) {
                this._setDomNodeCSS(name)
            }
        }

        return this
    },

    /**
     * Sets _noElems flag true
     */
    noElems: function () {
        this._noElems = true

        var parentOfParentBlock = this._parentBlock._parentNode
        while (parentOfParentBlock._noElems === true) {
            parentOfParentBlock = parentOfParentBlock._parentBlock._parentNode
        }
        this._setParentBlockForChildren(this, parentOfParentBlock)

        return this
    },

    /**
     * Only for elements. Gets or sets parent block bemNode reference.
     * Also sets bemNode name adding 'blockName__' before element name.
     * [@bemNode, [@dontAffectChildren]]
     *
     * @bemNode            object  Parent block node
     * @dontAffectChildren boolean If true, children won't get this parent block reference
     */
    parentBlock: function (bemNode, dontAffectChildren) {
        if (bemNode !== undefined) {
            if (this._isElem
                && bemNode instanceof BemNode
                && bemNode !== this._parentBlock) {

                if (bemNode._parentBlock !== undefined && bemNode._parentBlock._noElems) {
                    return this.parentBlock(bemNode._parentNode, dontAffectChildren)
                }

                this._clearUserMethods()
                this._removeFromParentBlockElems()
                this._parentBlock = bemNode._parentBlock
                this._addToParentBlockElems()
                this._defineDeclarationBySelector(
                    this._parentBlock._selector + '__' + this._nodeName.toLowerCase()
                )

                if (!dontAffectChildren) {
                    this._setParentBlockForChildren(this, bemNode)
                }

            }
            return this
        } else {
            return this._implementedNode !== undefined
                ? this._implementedNode._parentBlock
                : this._parentBlock
        }
    },

    /**
     * Recursive parent block setting
     *
     * @bemNode     object current node with children
     * @parentBlock object paren block reference
     */
    _setParentBlockForChildren: function (bemNode, parentBlock) {
        for (var i = 0, ii = bemNode._children.length; i < ii; i++) {
            var child = bemNode._children[i]
            if (child instanceof BemNode) {
                if (child._isElem) {
                    child.parentBlock(parentBlock)
                } else if (child._implementedNode !== undefined && child._implementedNode._isElem) {
                    child._implementedNode.parentBlock(parentBlock, true)
                }
            }
        }
    },

    /**
     * Gets or sets parent bemNode reference
     * [@bemNode]
     *
     * @bemNode object parent node
     */
    parentNode: function (bemNode) {
        if (bemNode !== undefined) {
            if (this._renderedOnce) {
                this.detach()
            }
            if (bemNode !== this._parentNode) {
                this._prevParentNode = this._parentNode
                this._parentNode = bemNode
            }
            return this
        } else {
            return this._parentNode
        }
    },

    /**
     * Gets DOM-node reference
     */
    domNode: function () {
        return this._domNode
    },

    /**
     * Set or get dom attr
     * @name, [@value]
     *
     * @name  string Attribute name
     * @value string Attribute value
     */
    domAttr: function (name, value, domOnly) {
        if (typeof name === 'object') {
            for (var key in name) this.domAttr(key, name[key])
        } else if (value === undefined) {
            return this._domNode === undefined ? this._domAttr[name] : this._domNode[name]
        } else {
            if (!domOnly) {
                this._domAttr[name] = value
            }
            if (this._domNode) {
                if (value === false || value === '') {
                    this._domNode.removeAttribute(name)
                } else {
                    this._domNode.setAttribute(name, value)
                }
            }
        }

        return this
    },

    /**
     * Define modifiers and its default values
     */
    defineMod: function (defaults) {
        if (this._implementedNode) {
            this._implementedNode._extendProperty('_mod', defaults)
        }
        return this._extendProperty('_mod', defaults)
    },

    /**
     * Extends object property with default object
     *
     * @propertyName string
     * @defaults     object
     */
    _extendProperty: function (propertyName, defaults, force)
    {
        var actuals = this[propertyName]
        var keyLC

        for (var key in defaults) {
            keyLC = key.toLowerCase()
            if ((force === true && defaults[key] !== undefined) || actuals[keyLC] === undefined || actuals[keyLC] === '') {
                actuals[keyLC] = defaults[key]
            }
        }

        return this
    },

    /**
     * Define parameters and its default values
     */
    defineParam: function (defaults) {
        return this._extendProperty('_param', defaults)
    },

    /**
     * Sets or gets mod
     * @name, [@value, [@data]]
     *
     * @name  string         Modifier name
     * @value string|boolean Modifier value
     * @data  anything       Additional data
     */
    mod: function (name, value, data) {
        if (name === undefined) {
            return this._mod
        } else if (typeof name === 'string') {
            name = name.toLowerCase()
        } else {
            for (var key in name) this.mod(key, name[key])
            return this
        }

        if (value === undefined) {
            return this._mod[name]
        } else if (this._mod[name] !== value) {
            this._cssClasses = undefined
            this._mod[name] = value
            if (this._implementedNode !== undefined) {
                this._implementedNode._cssClasses = undefined
                this._implementedNode._mod[name] = value
            }
            if (this._domNode !== undefined) {
                this._setDomNodeClasses()
                this._callModHandlers(name, value, data)
            }
        }

        return this
    },

    /**
     * Sets or gets state
     * @name, [@value]
     *
     * @name  string   State name
     * @value anything Modifier value
     */
    state: function (name, value, recursiveCall) {
        if (name === undefined) {
            return this._state
        } else if (typeof name === 'string') {
            name = name.toLowerCase()
        } else {
            for (var key in name) this.state(key, name[key], true)
            this.renderState()
            return this
        }

        if (value === undefined) {
            return this._state[name]
        } else if (this._state[name] !== value) {
            if (this._isExpandContext) {
                console.error('Change state in expand context is not allowed:', name, value)
            } else {
                this._state[name] = value
                if (!recursiveCall) {
                    this.renderState()
                }
            }
        }

        return this
    },

    /**
     * Adds additional CSS-classes
     */
    mix: function () {
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            this._mix.push(arguments[i])
        }

        if (this._domNode !== undefined) {
            this._setDomNodeClasses()
        }

        return this
    },

    /**
     * Toggles mods.
     *
     * @name   string         Modifier name
     * @value1 string|boolean Modifier value 1
     * @value2 string|boolean Modifier value 2
     */
    toggleMod: function (name, value1, value2, flag) {
        if (!this.mod(name)) {
            this.mod(name, value1, flag)
        } else if (this.mod(name) === value2) {
            this.mod(name, value1, flag)
        } else {
            this.mod(name, value2, flag)
        }

        return this
    },

    /**
     * Sets or gets parameter.
     * @name, [@value]
     *
     * @name  string
     * @value anything
     */
    param: function (name, value) {
        if (name === undefined) {
            return this._param
        } else if (typeof name === 'string') {
            name = name.toLowerCase()
        } else {
            for (var key in name) this.param(key, name[key])
            return this
        }

        if (value === undefined) {
            return this._param[name]
        } else {
            this._param[name] = value
        }

        return this
    },

    /**
     * Sets events handler
     *
     * @events  string   Space splitted event list: 'click' or 'click keypress'
     * @handler function
     */
    on: function (event, handler, isSingleEvent, fromDecl, dontCache, preventable) {
        if (typeof handler !== 'function') {
            return this
        }

        if (preventable === undefined) {
            preventable = false
        }

        if (handler.isBoundToNode === undefined) {
            var handlerOrigin = handler
            var handlerWrap = function (e) {
                handlerOrigin.call(this, e, e.detail)
            }
            handler = handlerWrap.bind(this)
            handler.isBoundToNode = true
            handler.unbindedHandler = handlerWrap
        }

        // Used in toHtml() method to restore function links
        if (fromDecl && handler.beastDeclPath === undefined) {
            handler.beastDeclPath = 'Beast.declaration["' + this._selector + '"].on["' + event + '"]'
        }

        if (!isSingleEvent && event.indexOf(' ') > -1) {
            var events = event.split(' ')
            for (var i = 0, ii = events.length; i < ii; i++) {
                this.on(events[i], handler, true, fromDecl)
            }
        } else {
            if (this._domNode !== undefined) {
                this._domNode.addEventListener(event, handler, {passive: !preventable})
            }

            if (dontCache === undefined) {
                if (this._domNodeEventHandlers === undefined) {
                    this._domNodeEventHandlers = {}
                }
                if (this._domNodeEventHandlers[event] === undefined) {
                    this._domNodeEventHandlers[event] = []
                }
                this._domNodeEventHandlers[event].push(handler)
            }

            if (this._isExpandContext && fromDecl === undefined) {
                handler.isExpandContext = true
                this._hasExpandContextEventHandlers = true
            }

            if (this._isDomInitContext) {
                handler.isDomInitContext = true
                this._hasDomInitContextEventHandlers = true
            }
        }

        return this
    },

    /**
     * Sets modifier change handler
     *
     * @modName  string
     * @modValue string|boolean
     * @handler  function
     */
    onWin: function (event, handler, isSingleEvent, fromDecl, dontCache, preventable) {
        if (typeof handler !== 'function') {
            return this
        }

        if (preventable === undefined) {
            preventable = false
        }

        if (handler.isBoundToNode === undefined) {
            var handlerOrigin = handler
            handler = function (e) {
                handlerOrigin.call(this, e, e.detail)
            }.bind(this)
            handler.isBoundToNode = true
        }

        // Used in toHtml() method to restore function links
        if (fromDecl && handler.beastDeclPath === undefined) {
            handler.beastDeclPath = 'Beast.declaration["' + this._selector + '"].onWin["' + event + '"]'
        }

        if (!isSingleEvent && event.indexOf(' ') > -1) {
            var events = event.split(' ')
            for (var i = 0, ii = events.length; i < ii; i++) {
                this.onWin(events[i], handler, true, fromDecl)
            }
        } else {
            if (this._domNode !== undefined) {
                window.addEventListener(event, handler, {passive: !preventable})
            }

            if (!dontCache) {
                if (this._windowEventHandlers === undefined) {
                    this._windowEventHandlers = {}
                }
                if (this._windowEventHandlers[event] === undefined) {
                    this._windowEventHandlers[event] = []
                }
                this._windowEventHandlers[event].push(handler)
            }

            if (this._isExpandContext && !fromDecl) {
                handler.isExpandContext = true
                this._hasExpandContextWindowEventHandlers = true
            }
            if (this._isDomInitContext) {
                handler.isDomInitContext = true
                this._hasDomInitContextWindowEventHandlers = true
            }
        }

        return this
    },

    /**
     * Sets modifier change handler
     *
     * @modName  string
     * @modValue string|boolean
     * @handler  function
     * @fromDecl boolean Private param for cache
     */
    onMod: function (modName, modValue, handler, fromDecl) {

        if (this._isExpandContext && !fromDecl) {
            handler.isExpandContext = true
            this._hasExpandContextModHandlers = true
        }

        // Used in toHtml() method to restore function links
        if (fromDecl) {
            handler.beastDeclPath = 'Beast.declaration["' + this._selector + '"].onMod["' + modName + '"]["' + modValue + '"]'
        }

        modName = modName.toLowerCase()

        if (this._modHandlers === undefined) {
            this._modHandlers = {}
        }
        if (this._modHandlers[modName] === undefined) {
            this._modHandlers[modName] = {}
        }
        if (this._modHandlers[modName][modValue] === undefined) {
            this._modHandlers[modName][modValue] = []
        }
        this._modHandlers[modName][modValue].push(handler)

        return this
    },

    /**
     * Triggers event
     *
     * @eventName string
     * @data      anything Additional data
     */
    trigger: function (eventName, data) {
        if (this._domNode !== undefined) {
            this._domNode.dispatchEvent(
                data !== undefined
                    ? new CustomEvent(eventName, {detail:data})
                    : new Event(eventName)
            )
        }

        return this
    },

    /**
     * Triggers window event
     *
     * @eventName string
     * @data      anything Additional data
     */
    triggerWin: function (eventName, data) {
        if (this._domNode !== undefined) {
            eventName = this.parentBlock()._nodeName + ':' + eventName
            window.dispatchEvent(
                data !== undefined
                    ? new CustomEvent(eventName, {detail:data})
                    : new Event(eventName)
            )
        }

        return this
    },

    /**
     * Gets current node index among siblings
     *
     * @return number
     */
    index: function (allowStrings) {
        var siblings = this._parentNode._children
        var dec = 0
        for (var i = 0, ii = siblings.length; i < ii; i++) {
            if (typeof siblings[i] === 'string') dec++
            if (siblings[i] === this) return allowStrings ? i : i - dec
        }
    },

    /**
     * Empties children
     */
    empty: function () {
        var children

        if (this._isExpandContext) {
            children = this._expandedChildren
            this._expandedChildren = []
        } else {
            children = this._children
            this._children = []
        }

        if (children) {
            for (var i = 0, ii = children.length; i < ii; i++) {
                if (children[i] instanceof BemNode) {
                    children[i].remove()
                }
            }
        }

        if (this._domNode) {
            // Child text nodes could be left
            while (this._domNode.firstChild) {
                this._domNode.removeChild(this._domNode.firstChild)
            }
        }

        return this
    },

    /**
     * Removes itself from parent block elems array
     */
    _removeFromParentBlockElems: function () {
        var parentBlock

        if (this._isElem) {
            parentBlock = this._parentBlock
        } else if (this._isBlock && this._implementedNode !== undefined) {
            parentBlock = this._implementedNode._parentBlock
        }

        if (parentBlock !== undefined) {
            for (var i = 0, ii = parentBlock._elems.length; i < ii; i++) {
                if (parentBlock._elems[i] === this) {
                    parentBlock._elems.splice(i, 1)
                    break
                }
            }
        }
    },

    /**
     * Adds itself to parent block elems array
     */
    _addToParentBlockElems: function () {
        var parentBlock

        if (this._isElem) {
            parentBlock = this._parentBlock
        } else if (this._isBlock && this._implementedNode !== undefined) {
            parentBlock = this._implementedNode._parentBlock
        }

        if (parentBlock !== undefined) {
            parentBlock._elems.push(this)
        }
    },

    /**
     * Removes itself
     */
    remove: function () {
        this._onRemove()

        // Proper remove children
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            if (this._children[i] instanceof BemNode) {
                this._children[i].remove()
                i--
            }
        }

        // Remove window handlers
        if (this._windowEventHandlers !== undefined) {
            for (var eventName in this._windowEventHandlers) {
                for (var i = 0, ii = this._windowEventHandlers[eventName].length; i < ii; i++) {
                    window.removeEventListener(
                        eventName, this._windowEventHandlers[eventName][i]
                    )
                }
            }
        }

        this.detach()
    },

    /**
     * Instructions before removing node
     */
    _onRemove: function () {
        if (this._decl !== undefined && this._decl.onRemove !== undefined) {
            this._decl.onRemove.call(this)
        }
    },

    /**
     * Detaches itself
     */
    detach: function () {

        // Remove DOM node
        if (this._domNode && this._domNode.parentNode) {
            this._domNode.parentNode.removeChild(this._domNode)
        }

        // Remove from parentNode's children
        if (this._parentNode) {
            this._parentNode._children.splice(
                this._parentNode._children.indexOf(this), 1
            )
            this._parentNode = undefined
        }

        this._removeFromParentBlockElems()

        return this
    },

    /**
     * Inserts new children by index. If there's no DOM yet,
     * appends to expandedChildren else appends to children
     * and renders its DOM.
     *
     * @children string|object Children to insert
     * @index    number        Index to insert
     */
    insertChild: function (children, index) {
        for (var i = 0, ii = children.length; i < ii; i++) {
            var child = children[i]

            if (child === false || child === null || child === undefined) {
                continue
            } else if (Array.isArray(child)) {
                this.insertChild(child, index)
                continue
            } else if (child instanceof BemNode) {
                child.parentNode(this)
                if (child._isElem) {
                    if (this._isBlock) {
                        child.parentBlock(this)
                    } else if (this._parentBlock !== undefined) {
                        child.parentBlock(this._parentBlock)
                    }
                }
            } else if (typeof child === 'number') {
                child = child.toString()
            }

            var childrenToChange = this._children

            if (this._isExpandContext) {
                if (this._expandedChildren === undefined) {
                    this._expandedChildren = []
                }
                childrenToChange = this._expandedChildren
            }

            if (index === 0) {
                childrenToChange.unshift(child)
            } else if (index === -1) {
                childrenToChange.push(child)
            } else {
                childrenToChange.splice(index, 0, child)
            }

            if (this._domNode && !this._isReplaceContext) {
                this._renderChildWithIndex(
                    index === -1 ? childrenToChange.length - 1 : index
                )
            }
        }

        return this
    },

    /**
     * Appends new children. If there's no DOM yet,
     * appends to expandedChildren else appends to children
     * and renders its DOM.
     *
     * @children string|object Multiple argument
     */
    append: function () {
        return this.insertChild(arguments, -1)
    },

    /**
     * Prepends new children. If there's no DOM yet,
     * appends to expandedChildren else appends to children
     * and renders its DOM.
     *
     * @children string|object Multiple argument
     */
    prepend: function () {
        return this.insertChild(arguments, 0)
    },

    /**
     * Appends node to the target. If current node belongs to another parent,
     * method removes it from the old context.
     *
     * @bemNode object Target
     */
    appendTo: function (bemNode) {
        bemNode.append(this)
        return this
    },

    /**
     * Prepends node to the target. If current node belongs to another parent,
     * method removes it from the old context.
     *
     * @bemNode object Target
     */
    prependTo: function (bemNode) {
        bemNode.prepend(this)
        return this
    },

    /**
     * Replaces current bemNode with the new
     * @bemNode   BemNode Node that replaces
     * @ignoreDom boolean Private flag - do not change DOM; used in toHtml() method
     */
    replaceWith: function (bemNode, ignoreDom) {
        this._completeExpand()

        var parentNode = this._parentNode
        var siblingsAfter

        if (parentNode !== undefined) {
            if (parentNode === bemNode) {
                parentNode = this._prevParentNode
            } else {
                siblingsAfter = parentNode._children.splice(this.index(true))
                siblingsAfter.shift()
            }
            parentNode._isReplaceContext = true
            parentNode.append(bemNode)
            parentNode._isReplaceContext = false
        }

        if (siblingsAfter !== undefined) {
            parentNode._children = parentNode._children.concat(siblingsAfter)
        }

        this._parentNode = undefined

        if (bemNode instanceof BemNode) {
            if (bemNode._isBlock) {
                bemNode._resetParentBlockForChildren()
            }

            if (this._isRenderStateContext) {
                bemNode._expandForRenderState(true)
            } else if (ignoreDom === undefined) {
                bemNode.render()
            }
        }
    },

    /**
     * Recursive setting parentBlock as this for child elements
     */
    _resetParentBlockForChildren: function () {
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            var child = this._children[i]
            if (child instanceof BemNode && child._isElem) {
                child.parentBlock(this._parentBlock)
                child._resetParentBlockForChildren(this._parentBlock)
            }
        }
    },

    /**
     * Replaces current bemNode with the new wich implemets its declaration
     * @bemNode   BemNode Node that implements
     * @ignoreDom boolean Private flag - do not change DOM; used in toHtml() method
     */
    implementWith: function (bemNode, ignoreDom) {
        this._cssClasses = undefined

        if (this._domNodeEventHandlers !== undefined) {
            bemNode._domNodeEventHandlers = this._domNodeEventHandlers

            for (var key in bemNode._domNodeEventHandlers) {
                for (var i = 0, ii = bemNode._domNodeEventHandlers[key].length, beastDeclPath; i < ii; i++) {
                    beastDeclPath = bemNode._domNodeEventHandlers[key][i].beastDeclPath
                    bemNode._domNodeEventHandlers[key][i] = bemNode._domNodeEventHandlers[key][i].unbindedHandler.bind(bemNode)
                    bemNode._domNodeEventHandlers[key][i].beastDeclPath = beastDeclPath
                }
            }
        }

        if (this._windowEventHandlers !== undefined) {
            bemNode._windowEventHandlers = this._windowEventHandlers
        }

        if (this._modHandlers !== undefined) {
            bemNode._modHandlers = this._modHandlers
        }

        bemNode._implementedNode = this
        this._implementedWith = bemNode

        bemNode._extendProperty('_mod', this._mod, true)
        bemNode._extendProperty('_param', this._param, true)
        this._extendProperty('_mod', bemNode._mod)

        bemNode._defineUserMethods(this._selector)

        if (this._parentBlock !== undefined && this._parentBlock._elems !== undefined) {
            for (var i = 0, ii = this._parentBlock._elems.length; i < ii; i++) {
                if (this._parentBlock._elems[i] === this) {
                    this._parentBlock._elems[i] = bemNode
                    break
                }
            }
        }

        this.replaceWith(bemNode, ignoreDom)
    },

    /**
     * Filters text in children
     *
     * @return string
     */
    text: function () {
        var text = ''
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            if (typeof this._children[i] === 'string') {
                text += this._children[i]
            }
        }

        return text
    },

    /**
     * Gets elements by name
     */
    elem: function () {
        if (this._isElem) {
            return this.elem.apply(this._parentBlock, arguments)
        }

        if (arguments.length === 0) {
            return this._elems
        }

        var elems = []
        for (var i = 0, ii = this._elems.length, elem; i < ii; i++) {
            elem = this._elems[i]
            for (var j = 0, jj = arguments.length, elemName; j < jj; j++) {
                elemName = arguments[j]
                if (elem._nodeName === elemName ||
                    elem._implementedNode !== undefined && elem._implementedNode._nodeName === elemName
                ) {
                    elems.push(elem)
                }
            }
        }

        return elems
    },

    /**
     * Finds bemNodes by names:
     * @nodeName string Multiple argument: path to node or attribute
     * @return   array  bemNodes collection
     */
    get: function () {
        if (arguments.length === 0) {
            return this._children
        }

        var collections = []
        for (var i = 0, ii = arguments.length, collection; i < ii; i++) {
            if (arguments[i] === '/') {
                collection = this._filterChildNodes()
            } else if (arguments[i].indexOf('/') === -1) {
                collection = this._filterChildNodes(arguments[i])
            } else {
                var pathItems = arguments[i].split('/')

                for (var j = 0, jj = pathItems.length; j < jj; j++) {
                    var pathItem = pathItems[j]

                    if (j === 0) {
                        collection = this._filterChildNodes(pathItem)
                    } else {
                        var prevCollection = collection
                        collection = []
                        for (var k = 0, kk = prevCollection.length; k < kk; k++) {
                            collection = collection.concat(
                                this._filterChildNodes.call(prevCollection[k], pathItem)
                            )
                        }
                    }

                    if (collection.length === 0) {
                        break
                    }
                }
            }

            collections = ii === 1 ? collection : collections.concat(collection)
        }
        return collections
    },

    /**
     * Collects children by node name
     *
     * @name   string Child node name
     * @return array  Filtered children
     */
    _filterChildNodes: function (name) {
        var collection = [], child, childName, implementedChildName
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            child = this._children[i]
            childName = child._nodeName
            implementedChildName = child._implementedNode !== undefined ? child._implementedNode._nodeName : ''

            if (
                child instanceof BemNode && (
                    name === undefined
                    || name === childName
                    || name === implementedChildName
                    || Array.isArray(name) && (
                        name.indexOf(childName) !== -1 || name.indexOf(implementedChildName) !== -1
                    )
                )
            ) {
                collection.push(child)
            }
        }

        return collection
    },

    /**
     * Checks if there are any children
     *
     * @path string Multiple argument: path to node or attribute
     */
    has: function () {
        return this.get.apply(this, arguments).length > 0
    },

    /**
     * Set handler to call afted DOM-node inited
     *
     * @callback function Handler to call
     */
    onDomInit: function (handler) {
        if (!this._domInited) {
            this._domInitHandlers.push(handler)
        } else {
            handler.call(this)
        }

        return this
    },

    /**
     * Clones itself
     */
    clone: function (parentNodeOfClone) {
        var clone = {}
        clone.__proto__ = this.__proto__

        for (var key in this) {
            if (key === '_children') {
                var cloneChildren = []
                for (var i = 0, ii = this._children.length; i < ii; i++) {
                    cloneChildren.push(
                        this._children[i] instanceof BemNode
                            ? this._children[i].clone(clone)
                            : this._children[i]
                    )
                }
                clone._children = cloneChildren
            } else {
                clone[key] = this[key]
            }
        }

        if (parentNodeOfClone !== undefined) {
            clone._parentNode = parentNodeOfClone
        }

        return clone
    },

    /**
     * Expands bemNode. Creates DOM-node and appends to the parent bemNode's DOM.
     * Also renders its children. Inits DOM declarations at the end.
     *
     * @parentDOMNode object Parent for the root node attaching
     */
    render: function (parentDOMNode) {

        // Call expand handler
        if (!this._isExpanded && this._decl !== undefined && this._decl.__commonExpand !== undefined) {
            this._isExpandContext = true
            this._decl.__commonExpand.call(this)
            this._completeExpand()
            this._isExpandContext = false
        }

        // Continue only if parent node is defined and document is defiend too
        if (parentDOMNode === undefined && this._parentNode === undefined || typeof document === 'undefined') {
            return this
        }

        // Create DOM element if there isn't
        if (this._domNode === undefined) {
            this._domNode = document.createElement(this._tag)
            this._domNode.bemNode = this

            this._setDomNodeClasses()
            this._setDomNodeCSS()

            for (var key in this._domAttr) {
                this.domAttr(key, this._domAttr[key], true)
            }
        }

        // Append to DOM tree
        if (parentDOMNode !== undefined) {
            parentDOMNode.appendChild(this._domNode)
        } else {
            this._parentNode._domNode.insertBefore(
                this._domNode,
                this._parentNode._domNode.childNodes[
                    this.index(true)
                ] || null
            )
        }

        var renderedOnce = this._renderedOnce

        // When first time render
        if (!this._renderedOnce) {

            // Render children
            for (var i = 0, ii = this._children.length; i < ii; i++) {
                this._renderChildWithIndex(i)
            }

            // For HTML-body remove previous body tag
            if (this._tag === 'body') {
                document.documentElement.replaceChild(this._domNode, document.body)
            }

            // Add event handlers
            if (this._domNodeEventHandlers !== undefined) {
                for (var eventName in this._domNodeEventHandlers) {
                    for (var i = 0, ii = this._domNodeEventHandlers[eventName].length; i < ii; i++) {
                        this.on(eventName, this._domNodeEventHandlers[eventName][i], true, false, true)
                    }
                }
            }
            if (this._windowEventHandlers !== undefined) {
                for (var eventName in this._windowEventHandlers) {
                    for (var i = 0, ii = this._windowEventHandlers[eventName].length; i < ii; i++) {
                        this.onWin(eventName, this._windowEventHandlers[eventName][i], true, false, true)
                    }
                }
            }

            // Call mod handlers
            for (var modName in this._mod) {
                this._callModHandlers(modName, this._mod[modName])
            }

            // Call DOM init handlers
            this._domInit()

            // Compontent rendered at least once
            this._renderedOnce = true
        }

        this._onAttach(!renderedOnce)

        return this
    },

    /**
     * Creates DOM-node for child with @index and appends to DOM tree
     *
     * @index number Child index
     */
    _renderChildWithIndex: function (index) {
        var child = this._children[index]

        if (child instanceof BemNode) {
            child.render()
        } else {
            this._domNode.insertBefore(
                document.createTextNode(child),
                this._domNode.childNodes[index] || null
            )
        }
    },

    /**
     * Change children array to expanded children array
     * after node expanding
     */
    _completeExpand: function () {
        if (this._isExpandContext && this._expandedChildren) {
            this._children = this._expandedChildren
            this._expandedChildren = undefined
        }
        this._isExpanded = true
    },

    /**
     * Calcs hash ID for Beast.patchDom algo
     */
    _updateHash: function () {
        var string = this._tag + ' class="' + this._setDomNodeClasses(true) + '"'

        // for (var attrName in this._domAttr) {
        //     string += ' ' + attrName + '="' + this._domAttr[attrName] + '"'
        // }

        // for (var propName in this._css) {
        //     string += ' ' + propName + ':' + this._css[propName]
        // }

        this._hashLocal = stringToHash(string)

        for (var i = 0, ii = this._children.length; i < ii; i++) {
            if (typeof this._children[i] === 'string') {
                string += this._children[i]
            } else {
                this._children[i]._updateHash()
                string += this._children[i]._hashGlobal
            }
        }

        this._hashGlobal = stringToHash(string)
    },

    /**
     * Initial instructions for the DOM-element
     */
    _domInit: function () {
        this._isDomInitContext = true

        var decl = this._decl

        if (decl !== undefined) {
            decl.domInit && decl.domInit.call(this)
        }

        if (this._implementedNode && (decl = this._implementedNode._decl)) {
            decl.domInit && decl.domInit.call(this)
        }

        this._isDomInitContext = false
        this._domInited = true

        if (this._domInitHandlers.length !== 0) {
            for (var i = 0, ii = this._domInitHandlers.length; i < ii; i++) {
                this._domInitHandlers[i].call(this)
            }
        }
    },

    /**
     * Instructions for the DOM-element after render in tree
     */
    _onAttach: function (firstTime) {
        if (this._decl !== undefined && this._decl.onAttach !== undefined) {
            this._decl.onAttach.call(this, firstTime)
        }
    },

    /**
     * Call modifier change handlers
     *
     * @modName  string
     * @modValue string
     * @data     object Additional data for handler
     */
    _callModHandlers: function (modName, modValue, data) {
        var handlers

        if (this._modHandlers !== undefined && this._modHandlers[modName] !== undefined) {
            if (this._modHandlers[modName][modValue] !== undefined) {
                handlers = this._modHandlers[modName][modValue]
            } else if (modValue === false && this._modHandlers[modName][''] !== undefined) {
                handlers = this._modHandlers[modName]['']
            } else if (modValue === '' && this._modHandlers[modName][false] !== undefined) {
                handlers = this._modHandlers[modName][false]
            }
            if (this._modHandlers[modName]['*'] !== undefined) {
                if (handlers !== undefined) {
                    handlers = handlers.concat(this._modHandlers[modName]['*'])
                } else {
                    handlers = this._modHandlers[modName]['*']
                }
            }
        }

        if (handlers !== undefined) {
            for (var i = 0, ii = handlers.length; i < ii; i++) {
                handlers[i].call(this, data)
            }
        }
    },

    /**
     * Sets DOM classes
     */
    _setDomNodeClasses: function (returnClassNameOnly, finalMod) {
        if (this._cssClasses === undefined) {
            var className = this._selector
            var value
            var tail

            if (finalMod === undefined && this._decl !== undefined) {
                finalMod = this._decl.__finalMod
            }

            if (this._flattenInheritsForDom !== undefined) {
                for (var i = 0, ii = this._flattenInheritsForDom.length; i < ii; i++) {
                    className += ' ' + this._flattenInheritsForDom[i]
                }
            }

            if (this._mix.length !== 0) {
                for (var i = 0, ii = this._mix.length; i < ii; i++) {
                    className += ' ' + this._mix[i]
                }
            }

            for (var key in this._mod) {
                value = this._mod[key]

                if (value === '' || value === false || value === undefined) {
                    continue
                }

                tail = value === true
                    ? '_' + key
                    : '_' + key + '_' + value

                if (
                    finalMod === undefined ||
                    finalMod[key] === undefined && finalMod._selector[this._selector] === undefined ||
                    finalMod[key] !== undefined && finalMod[key][this._selector] === true
                ) {
                    className += ' ' + this._selector + tail
                }

                if (this._flattenInheritsForDom) {
                    for (var i = 0, ii = this._flattenInheritsForDom.length, selector; i < ii; i++) {
                        selector = this._flattenInheritsForDom[i]
                        if (
                            finalMod === undefined ||
                            finalMod[key] === undefined && finalMod._selector[selector] === undefined ||
                            finalMod[key] !== undefined && finalMod[key][selector] === true
                        ) {
                            className += ' ' + selector + tail
                        }
                    }
                }
            }

            if (this._implementedNode !== undefined) {
                className += ' ' + this._implementedNode._setDomNodeClasses(true, finalMod)
            }

            this._cssClasses = className
        }

        if (returnClassNameOnly) {
            return this._cssClasses
        } else {
            if (this._domNode) {
                this._assignDomClasses.call(this)
            }
        }
    },

    _assignDomClasses: function () {
        this._domNode.className = this._cssClasses
    },

    /**
     * Sets DOM CSS
     */
    _setDomNodeCSS: function (propertyToChange, isAnimationFrame) {
        if (isAnimationFrame) {
            for (var name in this._css) {
                if (propertyToChange !== undefined && propertyToChange !== name) {
                    continue
                }
                if (this._css[name] || this._css[name] === 0 || this._css[name] === '') {
                    this._domNode.style[name] = this._css[name]
                }
            }
        } else {
            this._setDomNodeCSS.call(this, propertyToChange, true)
        }
    },

    /**
     * Converts BemNode with its children to string of Beast.node() functions
     * @return string
     */
    toStringOfFunctions: function () {
        var attr = '{'
        for (var key in this._mod) {
            attr += '"' + (key.substr(0,1).toUpperCase() + key.slice(1)) + '":'

            if (typeof this._mod[key] === 'string') {
                attr += '"' + this._mod[key] + '",'
            } else {
                attr += this._mod[key] + ','
            }
        }
        for (var key in this._param) {
            if (typeof this._param[key] === 'string' || typeof this._param[key] === 'number') {
                attr += '"'+ key +'":"'+ this._param[key] +'",'
            }
        }
        attr += '}'

        var children = ''
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            if (this._children[i] instanceof BemNode) {
                children += this._children[i].toStringOfFunctions()
            } else {
                children += '"'+ escapeDoubleQuotes(this._children[i].toString()) +'"'
            }

            if (i < ii - 1) {
                children += ','
            }
        }

        return 'Beast.node(' +
            '"'+ this._nodeName + '",' +
            (attr === '{}' ? 'undefined' : attr) +
            (children ? ',' + children + ')' : ')')
    },

    /**
     * Converts BemNode to HTML
     * @return string HTML
     */
    toHtml: function () {
        var node = this

        // Call expand handler
        if (!node._isExpanded && node._decl !== undefined && node._decl.__commonExpand !== undefined) {
            node._isExpandContext = true
            node._decl.__commonExpand.call(node)
            node._completeExpand()
            node._isExpandContext = false

            for (var key in this._param) {
                if (this._param[key] instanceof BemNode) {
                    this._param[key] = {
                        string: this._param[key].toStringOfFunctions(),
                        __isStringifiedBemNode: true
                    }
                }
            }
        }

        if (node._implementedWith !== undefined) {
            node = node._implementedWith
        }

        // HTML attrs
        var attrs = ' data-node-name="' + node._nodeName + '"'

        for (var key in node._domAttr)  {
            attrs += ' ' + key + '="' + escapeDoubleQuotes(node._domAttr[key].toString()) + '"'
        }

        // Class attr
        attrs += ' class="' + node._setDomNodeClasses(true) + '"'

        // Style attr
        var style = ''
        for (var key in node._css) {
            if (node._css[key] || node._css[key] === 0) {
                style += camelCaseToDash(key) + ':' + escapeDoubleQuotes(node._css[key]) + ';'
            }
        }

        if (style !== '') {
            attrs += ' style="' + style + '"'
        }

        // Stringify _domNodeEventHandlers
        if (node._domNodeEventHandlers !== undefined) {
            attrs += ' data-event-handlers="' + encodeURIComponent(stringifyObject(node._domNodeEventHandlers)) + '"'
        }

        // Stringify _windowEventHandlers
        if (node._windowEventHandlers !== undefined) {
            attrs += ' data-window-event-handlers="' + encodeURIComponent(stringifyObject(node._windowEventHandlers)) + '"'
        }

        // Stringify _modHandlers
        if (node._modHandlers !== undefined) {
            attrs += ' data-mod-handlers="' + encodeURIComponent(stringifyObject(node._modHandlers)) + '"'
        }

        // Stringify properties
        if (!objectIsEmpty(node._mod)) {
            attrs += ' data-mod="' + encodeURIComponent(stringifyObject(node._mod)) + '"'
        }
        if (!objectIsEmpty(node._param)) {
            attrs += ' data-param="' + encodeURIComponent(stringifyObject(node._param)) + '"'
        }
        if (node._domInitHandlers.length !== 0) {
            attrs += ' data-dom-init-handlers="' + encodeURIComponent(stringifyObject(node._domInitHandlers)) + '"'
        }
        if (node._implementedNode !== undefined) {
            attrs += ' data-implemented-node-name="' + node._implementedNode._nodeName + '"'
        }
        if (node._noElems) {
            attrs += ' data-no-elems="1"'
        }

        // HTML tag
        if (SingleTag[node._tag] === 1) {
            return '<' + node._tag + attrs + '/>'
        } else {
            var content = ''
            for (var i = 0, ii = node._children.length; i < ii; i++) {
                if (node._children[i] instanceof BemNode) {
                    content += node._children[i].toHtml()
                } else {
                    content += escapeHtmlTags(node._children[i].toString())
                }
            }
            return '<' + node._tag + attrs + '>' + content + '</' + node._tag + '>'
        }
    },

    /**
     * Calls expand declaration in runtime
     */
    expand: function () {
        // Replace old children
        this.empty()

        // When call for unexpanded node
        if (this._isExpanded === false) {
            this.append.apply(this, arguments)
            return this
        }

        // Append new children without DOM-node creating (_isReplaceContext flag)
        this._isReplaceContext = true
        this.append.apply(this, arguments)

        // Call expand function
        if (this._decl && this._decl.expand !== undefined) {
            this._isExpandContext = true
            this._decl.expand.call(this)
            this._completeExpand()
            this._isExpandContext = false
        }

        this._isReplaceContext = false

        // Render children
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            this._renderChildWithIndex(i)
        }

        // Call domInit function
        if (this._decl && this._decl.domInit !== undefined) {
            this._decl.domInit.call(this)
        }

        // Call implemented domInit function
        if (this._implementedNode !== undefined &&
            this._implementedNode._decl !== undefined &&
            this._implementedNode._decl.domInit !== undefined) {
            this._implementedNode._decl.domInit.call(this)
        }

        return this
    },

    /**
     * Rerenders BemNode after state change
     */
    renderState: function () {
        // Clone itself
        var clone = {}
        clone.__proto__ = this.__proto__
        for (var i in this) {
            if (
                i === '_css' || i === '_domAttr' || i === '_mod' ||
                i === '_modHandlers' || i === '_domNodeEventHandlers' || i === '_windowEventHandlers'
            ) {
                clone[i] = cloneObject(this[i])
            }
            else {
                clone[i] = this[i]
            }
        }
        for (var i = 0, ii = clone._children.length; i < ii; i++) {
            if (clone._children[i] instanceof BemNode) {
                clone._children[i]._parentNode = clone
            }
        }

        // Remove handlers added in expand context
        if (this._modHandlers !== undefined) {
            for (var name in this._modHandlers) {
                for (var value in this._modHandlers[name]) {
                    for (var i = 0, ii = this._modHandlers[name][value].length; i < ii; i++) {
                        if (this._modHandlers[name][value][i].isExpandContext) {
                            this._modHandlers[name][value].splice(i,1)
                            i--
                            ii--
                        }
                    }
                }
            }
        }
        if (this._domNodeEventHandlers !== undefined) {
            for (var eventName in this._domNodeEventHandlers) {
                for (var i = 0, ii = this._domNodeEventHandlers[eventName].length; i < ii; i++) {
                    if (this._domNodeEventHandlers[eventName][i].isExpandContext) {
                        if (this._domNode !== undefined) {
                            this._domNode.removeEventListener(eventName, this._domNodeEventHandlers[eventName][i])
                        }
                        this._domNodeEventHandlers[eventName].splice(i,1)
                        i--
                        ii--
                    }
                }
            }
        }
        if (this._windowEventHandlers !== undefined) {
            for (var eventName in this._windowEventHandlers) {
                for (var i = 0, ii = this._windowEventHandlers[eventName].length; i < ii; i++) {
                    if (this._windowEventHandlers[eventName][i].isExpandContext) {
                        window.removeEventListener(
                            eventName, this._windowEventHandlers[eventName][i]
                        )
                        this._windowEventHandlers[eventName].splice(i,1)
                        i--
                        ii--
                    }
                }
            }
        }

        // Detach DOM node and children
        this._domNode = undefined
        this._children = []
        this._elems = []
        this._implementedNode = undefined
        this._isExpanded = false
        this._hasExpandContextEventHandlers = false
        this._hasExpandContextWindowEventHandlers = false
        this._hasExpandContextModHandlers = false
        this._hasDomInitContextWindowEventHandlers = false
        this._renderedOnce = false

        // Expand
        this._expandForRenderState()

        // Update nodes hashes
        this._updateHash()
        clone._updateHash()

        // Patch DOM
        Beast.patchDom(clone._domNode.parentNode, this, clone)
        this._domInit(true)

        // Event
        this.trigger('DidRenderState')
    },

    /**
     * Recursive expanding BemNodes
     * isNewNode boolean If node is new call compilated expand else call expand from decl
     */
    _expandForRenderState: function (isNewNode) {
        this._isRenderStateContext = true

        // Expand itself
        if (this._decl && (this._decl.expand || this._decl.__commonExpand)) {
            this._isExpandContext = true
            if (isNewNode) {
                this._decl.__commonExpand.call(this)
            } else {
                this._decl.expand.call(this)
            }
            this._completeExpand()
            this._isExpandContext = false
        }

        // Could be detached from parent when implemented with other node
        if (this._parentNode !== undefined) {
            // Expand children
            for (var i = 0, ii = this._children.length; i < ii; i++) {
                if (this._children[i] instanceof BemNode) {
                    this._children[i]._expandForRenderState(true)
                }
            }
        }

        this._isRenderStateContext = false
    }
}

})();
/**
 * @block Grid Динамическая сетка
 * @tag base
 */
Beast.decl({
    Grid: {
        // finalMod: true,
        mod: {
            Col: '',                // @mod Col {number} Ширина в колонках
            Wrap: false,            // @mod Wrap {boolean} Основной контейнер сетки
            Margin: false,          // @mod Margin {boolean} Поля
            MarginX: false,         // @mod MarginX {boolean} Горизонтальные поля
            MarginY: false,         // @mod MarginY {boolean} Вертикальные поля
            Unmargin: false,        // @mod Unmargin {boolean} Отрицательные поля
            UnmarginX: false,       // @mod UnmarginX {boolean} Отрицательные горизоантальные поля
            UnmarginY: false,       // @mod UnmarginY {boolean} Отрацательные вертикальные поля
            MarginRightGap: false,  // @mod MarginRightGap {boolean} Правый отступ равен — горизоантальное поле
            MarginLeftGap: false,   // @mod MarginLeftGap {boolean} Левый отступ равен — горизоантальное поле
            Cell: false,            // @mod Cell {boolean} Горизонтальный отступ между соседями — межколонник
            Row: false,             // @mod Row {boolean} Вертикальынй отступ между соседями — межколонник
            Rows: false,            // @mod Rows {boolean} Дочерние компоненты отступают на горизонтальное поле
            Tile: false,            // @mod Tile {boolean} Модификатор дочернего компонента (для модификатора Tiles)
            Tiles: false,           // @mod Tiles {boolean} Дочерние компоненты плиткой с отступами в поле
            Center: false,          // @mod Center {boolean} Выравнивание по центру
            Hidden: false,          // @mod Hidden {boolean} Спрятать компонент
            ColCheck: false,        // @mod ColCheck {boolean} Считать ширину в колонках
            Ratio: '',              // @mod Ratio {1x1 1x2 3x4 ...} Пропорция
        },
        param: {
            isMaxCol: false,
        },
        onMod: {
            Col: {
                '*': function (fromParentGrid) {
                    if (fromParentGrid === undefined) {
                        this.param('isMaxCol', this.mod('col') === 'max')
                    }
                }
            }
        },
        onCol: undefined,
        domInit: function () {
            this.param('isMaxCol', this.mod('col') === 'max')

            if (this.mod('ColCheck')) {
                this.onWin('resize', this.checkColWidth)
                requestAnimationFrame(function () {
                    this.checkColWidth()
                }.bind(this))
            }
        },
        onAttach: function (firstTime) {
            this.setParentGrid(!firstTime)
        },
        checkColWidth: function () {
            var prop = this.css('content').slice(1,-1).split(' ')
            var col = parseInt(prop[0])
            var gap = parseInt(prop[1])
            var maxCol = parseInt(prop[2])
            var marginX = parseInt(prop[3])
            var marginY = parseFloat(prop[4])

            if (isNaN(col)) {
                return
            }

            var width = this.domNode().offsetWidth
            var colNum = Math.floor((width + gap) / (col + gap))

            if (colNum > maxCol) {
                colNum = maxCol
            }

            this.trigger('Col', {
                num: colNum,
                edge: window.innerWidth === (colNum * col + (colNum-1) * gap + marginX * 2),
                col: col,
                gap: gap,
                marginX: marginX,
                marginY: marginY,
            })
        },
        setParentGrid: function (recursive, parentGrid) {
            if (this.onCol !== undefined || this.onEdge !== undefined || this.param('isMaxCol')) {
                var that = this

                if (parentGrid === undefined) {
                    parentGrid = this._parentNode
                    while (parentGrid !== undefined && !(parentGrid.isKindOf('Grid') && parentGrid.mod('ColCheck'))) {
                        parentGrid = parentGrid._parentNode
                    }
                }

                if (parentGrid !== undefined) {
                    if (this.onCol || this.param('isMaxCol')) {
                        parentGrid.on('Col', function (e, data) {
                            that.onCol && that.onCol(data.num, data.edge, data)
                            that.param('isMaxCol') && that.mod('Col', data.num, true)
                        })
                    }
                }
            }

            if (recursive !== undefined) {
                var children = this.get('/')
                for (var i = 0, ii = children.length; i < ii; i++) {
                    if (children[i].isKindOf('grid') && !children[i].mod('ColCheck')) {
                        children[i].setParentGrid(recursive, parentGrid)
                    }
                }
            }
        }
    }
})

function grid (num, col, gap, margin) {
    var gridWidth = col * num + gap * (num - 1) + margin * 2
    return gridWidth
}
/**
 * @block Typo Типографика
 * @tag base
 */

Beast.decl({
    Typo: {
        // finalMod: true,
        mod: {
            text: '',       // @mod Text    {S M L XL}  Размер текста
            line: '',       // @mod Line    {S M L}     Высота строки
            caps: false,    // @mod Caps    {boolean}   Капслок
            light: false,   // @mod Light   {boolean}   Light-начертание
            medium: false,  // @mod Medium  {boolean}   Medium-начертание
            bold: false,    // @mod Bold    {boolean}   Bold-начертание
        }
    }
})
/**
 * @block App Корневой компонент всех страниц
 * @dep UINavigation DocInspector DocConsole
 * @tag base
 * @ext UIStackNavigation
 */
Beast.decl({
    App: {
        inherits: ['Grid', 'UIStackNavigation'],
        tag:'body',
        mod: {
            platform: '',
            device: '',
            ColCheck:true,
        },
        // onWin: {
        //     'Head:active': function (e, source) {
        //         console.log(source)      
        //     },
        //     'Lobby:active': function (e, source) {
                
        //     }
        // },
        expand: function fn () {
            this.inherited(fn)

            if (this.param('color')) {
                this.css('background', this.param('color'))

                let root = document.documentElement;
                root.style.setProperty('--text', this.param('text'));
                root.style.setProperty('--ground', this.param('color'));
            }

            if (this.param('text')) {
                this.css('color', this.param('text'))
            }

            // this.append(
            //     <DocInspector/>
            // )

            if (MissEvent.mobile) {
                this.mix('mobile')
            }

            if (MissEvent.android) {
                this.mix('android')
            }

            if (MissEvent.ios) {
                this.mix('ios')
            }

            if (MissEvent.qs('exp')) {
                MissEvent.qs('exp').split(',').forEach(function (expName) {
                    this.mix('exp_' + expName)
                }.bind(this))
            }
        },
        domInit: function fn () {
            this.inherited(fn)
            // history.pushState({}, '', '')
            
        }
    },
})


Beast.decl({
    Screen: {
        
        expand: function fn () {
            

            if (this.param('color')) {
                this.css('background', this.param('color'))

                let root = document.documentElement;
                root.style.setProperty('--text', this.param('text'));
                root.style.setProperty('--ground', this.param('color'));
            }

            if (this.param('text')) {
                this.css('color', this.param('text'))
            }

            
        },
        
    },
})


Beast.decl({
    DocScreen: {
        expand: function fn () {
            this.append(

                Beast.node("Screen",{__context:this,"color":"#275C83","text":"#B2B2B2"},"\n\n                    ",Beast.node("Head",undefined,"\n                        ",Beast.node("logo",undefined,"/assets/logo.svg"),"\n                        ",Beast.node("menu-item",undefined,"Команда"),"\n                        ",Beast.node("menu-item",undefined,"Студия"),"\n                        ",Beast.node("menu-item",undefined,"Связь"),"\n                    "),"\n\n                    ",Beast.node("Title",undefined,"Документы"),"\n\n                    ",Beast.node("Text",{"Size":"M"},"\n                        Превратим обычный документ в безупречный. От редакторской вычитки до инфографики и индивидуального дизайна.\n                    "),"\n\n                    ",Beast.node("Cards",undefined,"\n                        ",Beast.node("item",{"href":"silver.html","color":"#D2D2D2","text":"#6F6F6F"},"\n                            ",Beast.node("hint",undefined,"Silver"),"\n                            ",Beast.node("elem",undefined,"Ag"),"\n                            ",Beast.node("title",undefined,"Редакторская вычитка"),"\n                            ",Beast.node("price",undefined,"от 500₽"),"\n                        "),"\n                        ",Beast.node("item",{"href":"gold.html","color":"#C49B72","text":"#D8D8D8"},"\n                            ",Beast.node("hint",undefined,"Gold"),"\n                            ",Beast.node("elem",undefined,"Au"),"\n                            ",Beast.node("title",undefined,"Юридический дизайн документа"),"\n                            ",Beast.node("price",undefined,"от 3750₽"),"\n                        "),"\n                        ",Beast.node("item",{"href":"tailored.html","color":"#C24035","text":"#B2B2B2"},"\n                            ",Beast.node("hint",undefined,"Tailored"),"\n                            ",Beast.node("elem",undefined,"Xx"),"\n                            ",Beast.node("title",undefined,"Индивидуальный заказна дизайн"),"\n                            ",Beast.node("price",undefined,"₽₽₽"),"\n                        "),"\n                    "),"\n\n                ")
            )
        },
        domInit: function fn () {
            
        }
    },
})


Beast.decl({
    WebScreen: {
        expand: function fn () {
            this.append(

                Beast.node("Screen",{__context:this,"color":"#005537","text":"#D8D8D8"},"\n\n                    ",Beast.node("Head",undefined,"\n                        ",Beast.node("logo",undefined,"/assets/logo.svg"),"\n                        ",Beast.node("menu-item",undefined,"Команда"),"\n                        ",Beast.node("menu-item",undefined,"Студия"),"\n                        ",Beast.node("menu-item",undefined,"Связь"),"\n                    "),"\n\n                    ",Beast.node("Title",undefined,"Cайты и фирстиль"),"\n\n                    ",Beast.node("Text",{"Size":"M"},"\n                        Внедрение в документ графических и интерактивных элементов с использованием графического и веб-дизайна.\n                    "),"\n\n                    ",Beast.node("Example"),"\n\n                    \n                    ",Beast.node("Inquire"),"\n\n                ")
            )
        },
        domInit: function fn () {
            
        }
    },
})


Beast.decl({
    PresentationScreen: {
        expand: function fn () {
            this.append(

                Beast.node("Screen",{__context:this,"color":"#866140","text":"#DBDBDB"},"\n\n                    ",Beast.node("Head",undefined,"\n                        ",Beast.node("logo",undefined,"/assets/logo.svg"),"\n                        ",Beast.node("menu-item",undefined,"Команда"),"\n                        ",Beast.node("menu-item",undefined,"Студия"),"\n                        ",Beast.node("menu-item",undefined,"Связь"),"\n                    "),"\n\n                    ",Beast.node("Title",undefined,"Презентации"),"\n\n                    ",Beast.node("Text",{"Size":"M"},"\n                        Внедрение в документ графических и интерактивных элементов с использованием графического и веб-дизайна.\n                    "),"\n\n                    ",Beast.node("Example"),"\n\n                    ",Beast.node("Inquire"),"\n\n                ")
            )
        },
        domInit: function fn () {
            
        }
    },
})

Beast.decl({
    Text: {
        inherits: 'Typo',
        mod: {
            Line: 'L'
        },
        expand: function () {
            this.mod('Text', this.mod('Size'))
        }
    },
})

Beast.decl({
    Title: {
        inherits: 'Typo',
        mod: {
            Text: 'XXL',
            Line: 'L'
        }
    },
})

Beast.decl({
    
    List: {
        expand: function () {
            
        }
    },
    
    List__item: {
        tag: 'a',
        expand: function () {
            this.domAttr('href', this.param('href'))
        }
    },

    List__title: {
        inherits: 'Typo',
        mod: {
            Text: 'L',
            Line: 'L'
        }
    },

    List__hint: {
        inherits: 'Typo',
        mod: {
            Text: 'M',
            Line: 'L'
        }
    },
})

Beast.decl({
    Cards: {

        expand: function () {
            
            this.append(
                Beast.node("items",{__context:this},"\n                    ",this.get('item'),"\n                ")

                
            )

        }
    },
    
    Cards__item: {
        tag: 'a',
        expand: function () {
            this.css('background', this.param('color'))
            this.css('color', this.param('text'))
            this.domAttr('href', this.param('href'))
            
            this.append(
                Beast.node("head",{__context:this},"\n                    ",this.get('hint', 'elem'),"\n                "),
                this.get('title'),
                Beast.node("cross",{__context:this},"+"),
                this.get('price')
                
            )

        }
    },

    Shelf__dot: {

        expand: function () {

            this.css('background', this.param('color'))
            
            

        }
    },
    

})





Beast.decl({
    FormLight: {

        expand: function () {

            this.append(
                Beast.node("form",{__context:this},"\n                    ",this.get('head', 'item'),"\n                ")
                
            )

        },

        domInit: function () {
            let requestForm = document.querySelector(".formLight__action");

            requestForm.onclick = function(event) {
              
              event.preventDefault();

              // if all validation goes well
              if (validateForm()) {
                this.value = 'Отправляю...';
                this.disabled = true;
                this.classList.add("button-loading");  
                 
                sendEmail();
                
              } else return false;
            }

            function sendRquestEmail(name, email, phone) {

              emailjs.send(emailJsService, emailJsTemplate, {
                name: name,
                email: email,
                phone: phone,
                type: 'Пакет TAILORED',
                link: '— ',
                price: '—'
              })
              .then(function() {
                  //alert('Ваша заявка успешно оправлена');
                  //location.reload();
              }, function(error) {
                  console.log('Failed sendig email', error);
              });
            }

            function sendEmail() {
              //if all files were uploaded
              if (uploadedFilesProgress == uploadedFiles.length) {
                sendRquestEmail(
                  document.querySelector("#name").value,
                  document.querySelector("#email").value,
                  document.querySelector("#phone").value
                );
                uploadedFilesProgress = 0;
                
                let btnSend = document.querySelector(".formLight__action");
                btnSend.value = 'Отправлено успешно';
                btnSend.className = "formLight__action";

              } else {
                setTimeout(function(){ sendEmail() }, 500);
              }
            }

            //validation of all input fields
            function validateForm() {

              let nameField = document.querySelector("#name");
              if (nameField.value.trim() == "") {
                alert('Пожалуйста, укажите ваше имя, чтобы мы знали как к вам обращаться');
                return false;
              }

              let emailField = document.querySelector("#email");
              if (emailField.value.trim() == "") {
                alert('Укажите адрес электронной почты, чтобы мы знали, как с вами связаться');
                return false;
              }

              let phoneField = document.querySelector("#phone");
              if (phoneField.value.trim() == "") {
                alert('Укажите номер телефона, чтобы мы знали, как с вами связаться');
                return false;
              }

              return true;
            }

            
            

        }
    },

    FormLight__form: {
        tag: 'div',
        expand: function () {

            this.domAttr('action', this.parentBlock().param('action'))
            this.domAttr('id', this.parentBlock().param('id'))

        }
    },

    FormLight__item: {
        expand: function () {
            this.domAttr('param', this.param('param'))
        }
    },

    FormLight__title: {
        inherits: 'Typo',
        mod: {
            Text: 'L',
            Line: 'L'
        },
        
    },

    FormLight__hint: {
        inherits: 'Typo',
        mod: {
            Text: 'L',
            Line: 'L'
        },
        
    },

    FormLight__button: {
        expand: function () {
            this.domAttr('data-param', this.param('data-param'))
            this.css('background', this.parentBlock().param('color'))
            this.css('color', this.parentBlock().param('text'))
        }
    },

    FormLight__action: {
        tag: 'input',
        expand: function () {
            this.domAttr('type', 'submit')
            this.domAttr('value', this.text())
            this.css('background', this.parentBlock().param('action'))
            this.css('color', this.parentBlock().param('actionText'))
        }
    },

    FormLight__input: {
        tag: 'input',
        expand: function () {
            this.domAttr('type', this.param('type'))
            this.domAttr('id', this.param('id'))
            this.domAttr('placeholder', this.param('placeholder'))
            this.domAttr('required', true)
            this.css('background', this.parentBlock().param('color'))
            this.css('color', this.parentBlock().param('text'))

            let root = document.documentElement;
            root.style.setProperty('--formHighlight', this.parentBlock().param('highlight'));
            root.style.setProperty('--formPlaceholder', this.parentBlock().param('text'));
            
        }
    },

    
})


// global variables for calculations
let price;
let characterNumber = 2500;
let currrentType = "silver";
let uploadedDocument = false;
let linksToTheDocuments = [];
let calculatedPrice;
let uploadedFiles = [];
let uploadedFilesProgress = 0; 

const emailJsService = "service_5zbkh3r";
const emailJsTemplate = "template_mjdi55g";

const sanityTokenWithWriteAccess = 'skmAQVJjHdsVFKS4TCsoiVvZIeEUN9qFw545I0JD4YSoBrD80kryUFXitu2g1peNqfrVZA1Mwcq48Sk0KOXCt8b8KnLIRAtNuDbwrAq6YoxsJFw2KtFhVYbQDGFEQNzLDCJTJaBYa4HfdL7wmz7H5FgAGtax1MlUdusEBfkeQsNvegVVlwPw';
const sanityFetchUrl = 'https://spfa8rwc.api.sanity.io/v1/assets/files/production';

const pageCharacterNumber = 2500;

const prices = {
  silver: {
    russian: {
      regular: 500,
      urgent: 750
    },
    english: {
      regular: 2000,
      urgent: 3000
    }
  },
  gold: {
    russian: {
      regular: 2500,
      urgent: 3750
    },
    english: {
      regular: 5000,
      urgent: 7500
    }
  }
}

// variable holding current selection
let pricingParams = {
  "type": "silver",
  "language" : null,
  "time": null
}

var dropzoneComponent;

Beast.decl({
    Form: {

        //set one of the params
        setPricingParam: function (key, value) {
            pricingParams[key] = value;
            this.calculateFinalPrice();

        },

        //calculate final price
        calculateFinalPrice: function () {

            // Gold or Silver type
            let type = this.param('type')
            if (type)
              pricingParams["type"] = type;
            
              if (pricingParams["language"] && pricingParams["time"]) {
                price = prices[pricingParams["type"]][pricingParams["language"]][pricingParams["time"]];

                let tmpPageCounterFloat = characterNumber/pageCharacterNumber;
                let pageCount;
                if (Number.isInteger(tmpPageCounterFloat)) {
                  pageCount = Math.floor(characterNumber/pageCharacterNumber);
                } else {
                  pageCount = Math.floor(1 + characterNumber/pageCharacterNumber);
                }

                document.querySelector(".form__action").value = price*pageCount + "₽ — отправить заявку";

                calculatedPrice = price*pageCount;

            }
        },

        calculateCharNumber: function(dropfiles) {
            
            // input for files
            var docs = document.querySelector("#file-upload");
            
            //another way to get files from dropzone
            //var dropzoneFiles = dropzoneComponent.getAcceptedFiles();

            //recalculate character number
            characterNumber = 0;
            let documentNameContainer = document.querySelector(".form__upload-doc-name");
            documentNameContainer.innerHTML = "";

            
            // if files are not selected stop
            if (docs.files.length === 0 && dropfiles.length === 0) {
                return;
            }            
            
            if (docs.files.length > 0)
              this.mergeFiles(docs.files);

            if (dropfiles && dropfiles.length > 0)
              this.mergeFiles(dropfiles);
            

            for (var i = 0; i < uploadedFiles.length; i++) {
              this.parseFile(uploadedFiles[i], i);
            }
            
          
        },

        mergeFiles: function(files){
          var fileUploadedAlready = false;
          for (var i = 0; i < files.length; i++){
            for (var k = 0; k < uploadedFiles.length; k++){
              if (uploadedFiles[k].name == files[i].name && uploadedFiles[k].size == files[i].size) {
                fileUploadedAlready = true;
                break
              }
            }
            if (!fileUploadedAlready) {
              uploadedFiles.push(files[i])
            } else {
              fileUploadedAlready = false;
            }
          }
        },

        parseFile: function(file, index) {
          var self = this

          // define reader
          var reader = new FileReader();
            
          //check extension
          let documentName = file.name;
          let ext = documentName.split('.').pop().toLowerCase();

          try {
            gtag('event', 'document_upload', {
              'event_category' : 'extension',
              'event_label' : ext
            });
          } catch(err) {
             console.log(err);
          }          

          // supported extensions
          if (ext == "docx" || ext == "txt") {
              let documentNameContainer = document.querySelector(".form__upload-doc-name");
              documentNameContainer.innerHTML += "<div class='form__upload-filename'>" + documentName + "</div>";

              let documentUploadLabel = document.querySelector(".form__upload-label");
              documentUploadLabel.innerHTML = "Загрузить еще";
          }

          // if it's DOCX
          if (ext == "docx") {

              reader.readAsBinaryString(file);

              // on error
              reader.onerror = function (evt) {
                  console.log("error reading file", evt);
                  alert("Не удалось прочитать документ. Укажите количество символов вручную")
              }

              // on success
              reader.onload = function (evt) {
                  const content = evt.target.result;
                  var zip = new PizZip(content);
                  var doc = new Docxtemplater().loadZip(zip);

                  self.setCharactedNum(doc.getFullText());
              }
          } else if (ext == "txt") { 

              reader.onload = function(evt) {
                  self.setCharactedNum(evt.target.result)
              };
              
              reader.readAsText(file, "UTF-8");
              
          } else {
            uploadedFiles.splice(index, 1);
              alert('Пожалуйста, загрузите DOCX или TXT файл.')
          }
        },

        setCharactedNum: function (text) {
            // element to display char number
            var charNumber = document.querySelector(".form__hint");

            if (text && text.length > 0) {
                //set variable for char number 
                characterNumber = characterNumber + text.length;
                
                // show character number
                charNumber.innerHTML = characterNumber + " знаков";

                //calculate the price
                this.calculateFinalPrice();

                uploadedDocument = true;
            }
        },

        //upload documnent to Sanity
        updloadDocumentToSanity: function (file){

            // create reference to the file
            var src = URL.createObjectURL(file);

            //fetching
            fetch(sanityFetchUrl, {
                method: 'post',
                headers: {
                    'Content-type': file.type,
                    Authorization: 'Bearer ' + sanityTokenWithWriteAccess
                },
                body: file
              })
              .then(response => response.json())
              .then(function(data) {      
                    //set public URL link to the document in the following variable
                    if (data && data.document) {
                        linksToTheDocuments.push(data.document.url);
                        uploadedFilesProgress++;
                    }
                });
        },

        expand: function () {

            this.append(
                Beast.node("form",{__context:this},"\n                    ",this.get('head', 'item'),"\n                ")
                
            )

        },

        domInit: function () {

            let selectors = document.querySelectorAll(".form__button_select");
            var self = this

            if (selectors) {
              for (var i = 0; i < selectors.length; i++) {

                //when click on selector
                selectors[i].onclick = function(evt) {
                  //manupulations for visual selection
                  let selectorButtons = evt.target.parentNode.querySelectorAll(".form__button_select");
                  for (var j = 0; j < selectorButtons.length; j++) {
                    selectorButtons[j].setAttribute("active", false);
                  }
                  evt.target.setAttribute("active", true);
                  
                  // set price depending on selection
                  self.setPricingParam(evt.target.parentNode.getAttribute("param"), evt.target.getAttribute("data-param"));
                }
              }
            }

            let requestForm = document.querySelector(".form__action");

            requestForm.onclick = function(event) {
              
              event.preventDefault();
              // if all validation goes well
              if (validateForm()) {
                
                for (var i = 0; i < uploadedFiles.length; i++) {
                  self.updloadDocumentToSanity(uploadedFiles[i]); 
                } 
                this.value = 'Отправляю...';
                this.disabled = true;
                this.classList.add("button-loading");
                sendEmail();
                
              } else return false;
            }

            function sendRquestEmail(name, email, phone) {

              let type = pricingParams["type"] == "silver" ? "Пакет Silver | " : "Пакет Gold | ";
              let language = pricingParams["language"] == "english" ? "Документ на английском |" : "Документ на русском |";
              let time = pricingParams["time"] == "urgent" ? " 24 часа" : " 2 дня";
              let docsView = "";
              for (var i = 0; i < linksToTheDocuments.length; i++){
                docsView +=  "<p><a style='font-size: 24px;' href='" + linksToTheDocuments[i] + "'>Документ " + (i+1) + "</a></p>";
              }

              emailjs.send(emailJsService, emailJsTemplate, {
                name: name,
                email: email,
                phone: phone,
                type: type + language + time,
                link: docsView,
                price: calculatedPrice
              })
              .then(function() {
                  //alert('Ваша заявка успешно оправлена');
                  //location.reload();
              }, function(error) {
                  console.log('Failed sendig email', error);
              });
            }

            function sendEmail() {
              //if all files were uploaded
              if (uploadedFilesProgress == uploadedFiles.length) {
                sendRquestEmail(
                  document.querySelector("#name").value,
                  document.querySelector("#email").value,
                  document.querySelector("#phone").value
                );
                uploadedFilesProgress = 0;
                
                let btnSend = document.querySelector(".form__action");
                btnSend.value = 'Отправлено успешно';
                btnSend.className = "form__action";

              } else {
                setTimeout(function(){ sendEmail() }, 500);
              }
            }

            //validation of all input fields
            function validateForm() {
              if (!pricingParams["language"] || !pricingParams["time"]) {
                alert('Для отправки заявки необходимо указать язык документа и срок')
                return false;
              }
              if (!uploadedDocument) {
                alert('Для отправки заявки нужно загрузить документ, с которым будет необходимо работать')
                return false;
              }
              let nameField = document.querySelector("#name");
              if (nameField.value.trim() == "") {
                alert('Пожалуйста, укажите ваше имя, чтобы мы знали как к вам обращаться');
                return false;
              }

              let emailField = document.querySelector("#email");
              if (emailField.value.trim() == "") {
                alert('Укажите адрес электронной почты, чтобы мы знали, как с вами связаться');
                return false;
              }

              let phoneField = document.querySelector("#phone");
              if (phoneField.value.trim() == "") {
                alert('Укажите номер телефона, чтобы мы знали, как с вами связаться');
                return false;
              }

              return true;
            }

            var parentBlockRef = this.parentBlock();
            dropzoneComponent = new Dropzone("#dropzone-component", {
                url: "#",
                paramName: 'file',
                previewsContainer: '.form__upload-doc-name',
                autoQueue: false,
                autoProcessQueue: false,
                addRemoveLinks: false,
                clickable: false,
                thumbnailWidth: 80,
                thumbnailHeight: 100,
                maxFiles: 10,
                acceptedFiles: '.docx, .doc, .txt',
                parallelUploads: 1,
                uploadMultiple: true,
                dictDefaultMessage: 'Или перетащите файлы сюда',
                init: function() {
                  this.on("addedfiles", function() {
                      parentBlockRef.calculateCharNumber(this.files);
                  });
                }
              },
            );

            $('#dropzone-component').on('dragenter', function() {
                $(this).css({'outline' : '2px dashed green'})
            });

            $('#dropzone-component').on('dragleave', function() {
              $(this).css({'outline' : 'none'})
            });
            

        }
    },

    Form__form: {
        tag: 'div',
        expand: function () {

            this.domAttr('action', this.parentBlock().param('action'))
            this.domAttr('id', this.parentBlock().param('id'))

        }
    },

    Form__item: {
        expand: function () {
            this.domAttr('param', this.param('param'))
        }
    },

    Form__title: {
        inherits: 'Typo',
        mod: {
            Text: 'L',
            Line: 'L'
        },
        
    },

    Form__hint: {
        inherits: 'Typo',
        mod: {
            Text: 'L',
            Line: 'L'
        },
        
    },

    Form__button: {
        expand: function () {
            this.domAttr('data-param', this.param('data-param'))
            this.css('background', this.parentBlock().param('color'))
            this.css('color', this.parentBlock().param('text'))
        }
    },

    Form__action: {
        tag: 'input',
        expand: function () {
            this.domAttr('type', 'submit')
            this.domAttr('value', this.text())
            this.css('background', this.parentBlock().param('action'))
            this.css('color', this.parentBlock().param('actionText'))
        }
    },

    Form__input: {
        tag: 'input',
        expand: function () {
            this.domAttr('type', this.param('type'))
            this.domAttr('id', this.param('id'))
            this.domAttr('placeholder', this.param('placeholder'))
            this.domAttr('required', true)
            this.css('background', this.parentBlock().param('color'))
            this.css('color', this.parentBlock().param('text'))

            let root = document.documentElement;
            root.style.setProperty('--formHighlight', this.parentBlock().param('highlight'));
            root.style.setProperty('--formPlaceholder', this.parentBlock().param('text'));
            
        }
    },

    Form__upload: {
        expand: function () {
            this.append(
                Beast.node("upload-label",{__context:this,"for":"file-upload"},"Загрузить документы"),
                Beast.node("upload-doc-name",{__context:this}),
                Beast.node("upload-input",{__context:this,"id":"file-upload","type":"file"})
            )
            this.domAttr('id', 'dropzone-component');
        }
    },

    'Form__upload-label': {
        tag: 'label',
        expand: function () {
            this.domAttr('for', this.param('for'))
            this.css('background', this.parentBlock().param('color'))
            this.css('color', this.parentBlock().param('text'))
        }
    },

    'Form__upload-doc-name': {
        tag: 'div',
        expand: function () {
            this.css('background', this.parentBlock().param('color'))
            this.css('color', this.parentBlock().param('text'))
        }
    },
    
    'Form__upload-input': {
        tag: 'input',
        on: {
            // Listen to change event on file input
            change: function () {
                // add and remove modificator for every change
                this.parentBlock().calculateCharNumber()

            }
        },

        expand: function () {
            this.domAttr('id', this.param('id'))
            this.domAttr('multiple', true)
            this.domAttr('type', this.param('type'))
            // this.domAttr('onchnage', 'calculateCharNumber()')
        }
    },
})






Beast.decl({
    Head: {
        expand: function () {
            this.append(
                Beast.node("link",{__context:this},"\n                    ",this.get('logo'),"\n                "),
                Beast.node("menu",{__context:this},"\n                    ",this.get('menu-item'),"\n                ")
            )

        }
    },

    Head__link: {
        tag: 'a',
        expand: function () {
            this.domAttr('href', 'main.html')


        }
    },

    Head__logo: {
        expand: function () {
            this.empty()
            

        }
    },
    

})
/**
 * @block Overlay Интерфейс модальных окон
 * @dep UINavigation grid Typo Control
 * @tag base
 * @ext UINavigation grid
 */
Beast.decl({
    Overlay: {
        inherits: ['UINavigation'],
        mod: {
            Type: 'side', // modal, partsideleft, bottom, top, expand, custom
        },
        onMod: {
            State: {
                active: function (callback) {
                    if (this.mod('Type') === 'expand') {
                        this.moveContextInside()
                    }

                    this.param('activeCallback', callback)
                },
                release: function (callback) {
                    if (this.mod('Type') === 'expand') {
                        this.moveContextOutside()
                    }

                    this.param('releaseCallback', callback)
                },
            }
        },
        param: {
            activeCallback: function () {},
            releaseCallback: function () {},
            title: '',
            subtitle: '',
            topBar: true,
            background: true,
        },
        expand: function () {
            if (this.param('topBar')) {
                this.append(Beast.node("topBar",{__context:this}))
                    .mod('HasTopBar', true)
            }

            if (this.param('bottomBar')) {
                var price = this.parentBlock().param('price')
                this.append(
                    Beast.node("bottomBar",{__context:this})   
                )
                    .mod('HasTopBar', true)
            }

            if (this.param('background')) {
                this.append(Beast.node("background",{__context:this}))
            }

            if (this.mod('Type') === 'partsideleft') {
                this.mod('Col', '1LeftMargins')
            }

            this.css('color', this.param('colorText'))
            this.css('background-color', this.param('colorMain'))

            this.append(
                Beast.node("content",{__context:this},this.get())
            )
        },
        on: {
            animationstart: function () {
                if (this.mod('Type') === 'modal') {
                    var overlayHeight = this.domNode().offsetHeight
                    var parentHeight = this.parentNode().domNode().offsetHeight
                    var marginTop = overlayHeight < (parentHeight - 200)
                        ? this.domNode().offsetHeight / -2
                        : undefined

                    this.css({
                        marginLeft: this.domNode().offsetWidth / -2,
                        marginTop: marginTop,
                        marginBottom: 0,
                        top: '0%',
                    })

                    if (marginTop !== undefined) {
                        this.css({
                            marginTop: marginTop,
                            marginBottom: 0,
                            top: '50%',
                        })
                    }
                }
            },
            animationend: function () {
                // if (this.mod('Type') === 'expand' && this.param('scrollContent')) {
                //     requestAnimationFrame(function () {
                //         if (this.elem('content')[0].domNode().scrollTop === 0) {
                //             this.param('options').context.css('transform', 'translate3d(0px,0px,0px)')
                //             this.elem('content')[0].domNode().scrollTop = -this.param('scrollContent')
                //             this.param('scrollContent', false)
                //         }
                //     }.bind(this))
                // }

                

                if (this.mod('State') === 'release') {
                    this.param('releaseCallback')()
                } else {
                    this.param('activeCallback')()
                }
            }
        },
        moveContextInside: function () {
            var context = this.param('options').context

            // Calculate Global Offset
            var offsetParent = context.domNode()
            var offsetTop = offsetParent.offsetTop
            while (offsetParent = offsetParent.offsetParent) {
                offsetTop += offsetParent.offsetTop
            }

            // Placeholder
            var placeholder = Beast.node("OverlayPlaceholder",{__context:this})
            this.param('placeholder', placeholder)
            context.parentNode().insertChild([placeholder], context.index(true))
            placeholder
                .css('height', context.domNode().offsetHeight)
                .domNode().className = context.domNode().className

            context.appendTo(
                this.elem('content')[0]
            )

            offsetTop -= 44
            context.css({
                transform: 'translate3d(0px,' + offsetTop + 'px, 0px)'
            })

            // Context is under of the screen top
            if (offsetTop > 0) {
                requestAnimationFrame(function () {
                    context.css({
                        transition: 'transform 300ms',
                        transform: 'translate3d(0px,0px,0px)',
                    })
                })
            }
            // Context is above of the screen top
            else {
                this.param({
                    scrollContent: offsetTop
                })
            }
        },
        moveContextOutside: function () {
            this.param('placeholder').parentNode().insertChild(
                [this.param('options').context], this.param('placeholder').index(true)
            )
            this.param('placeholder').remove()

            this.param('options').context.css({
                transition: ''
            })
        },
    },
    Overlay__topBar: {
        expand: function () {
            var layerIndex = this.parentBlock().parentNode().index()

            // this.append(
            //     <topBarActionBack/>,
            //     layerIndex > 1 && <topBarActionClose/>
            // )

            this.append(
                // <topBarActionNav/>,
                Beast.node("topBarActionClose",{__context:this})
            )

            var title = this.parentBlock().param('title')
            var subtitle = this.parentBlock().param('subtitle')

            if (title) {
                var titles = Beast.node("topBarTitles",{__context:this}).append(
                    Beast.node("topBarTitle",{__context:this},title)
                )

                if (subtitle) {
                    titles.append(
                        Beast.node("topBarSubtitle",{__context:this},subtitle)
                    )
                }

                this.append(titles)
            }
        }
    },

    Overlay__bottomBar: {
        expand: function () {

            var layerIndex = this.parentBlock().parentNode().index()
            var price = this.parentBlock().param('price')

            this.append(
                Beast.node("Reserve",{__context:this},"\n                    ",Beast.node("price",undefined,price),"   \n                ")
            )

            
        }
    },

    Overlay__topBarTitle: {
        inherits: 'Typo',
        mod: {
            Text: 'M',
            Line: 'M',
        },
    },
    Overlay__topBarSubtitle: {
        inherits: 'Typo',
        mod: {
            Text: 'S',
        },
    },
    Overlay__topBarAction: {
        inherits: ['Control', 'Typo'],
        mod: {
            Text: 'M',
            Medium: true,
        },
    },
    Overlay__topBarActionBack: {
        inherits: 'Overlay__topBarAction',
        expand: function fn () {
            this.inherited(fn)

            this.append(
                Beast.node("Icon",{__context:this,"Name":"CornerArrowLeft"}),
                Beast.node("topBarActionLabel",{__context:this},"Back")
            )
        },
        on: {
            Release: function () {
                this.parentBlock().popFromStackNavigation()
            }
        }
    },
    Overlay__topBarActionNav: {
        inherits: 'Overlay__topBarAction',
        expand: function fn () {
            this.inherited(fn)

            this.append(
                Beast.node("topBarActionLabel",{__context:this},"Index"),
                Beast.node("Work",{__context:this},Beast.node("title",undefined,"Test"))
            )
        },
        on: {
            Release: function () {
                //this.parentBlock().popFromStackNavigation()
            }
        }
    },
    Overlay__topBarActionClose: {
        inherits: 'Overlay__topBarAction',
        expand: function fn () {
            //this.css('background', this.parentBlock().param('colorText'))
            this.inherited(fn)
                .append(
                    Beast.node("topBarActionLabel",{__context:this},"Close")
                )
        },
        on: {
            click: function () {
                window.history.back();
                this.parentBlock().popAllFromStackNavigation()
            }
        }
    },

    
})

Beast.decl({
    Shelf: {

        expand: function () {

            this.append(
                this.get('item', 'cols')
                
            )

        }
    },
    
    Shelf__item: {
        tag: 'a',
        expand: function () {

            this.css('background', this.param('color'))
            this.css('color', this.param('text'))
            var dot = this.param('dot')
            this.append(
                Beast.node("dot",{__context:this,"color":dot}),
                this.get('num', 'title', 'subtitle')
            )    
            this.domAttr('href', this.param('href'))

            // if (this.param('name') === 'closed') {
                
            // } else {



            // this.on('click', function () {

            //     var g = this.param('name')
            //     console.log(g)

            //     if (this.param('name') === 'docs') {
            //         var chatPage = (
            //             <DocScreen />
            //         )
            //     }

            //     if (this.param('name') === 'web') {
            //         var chatPage = (
            //             <WebScreen />
            //         )
            //     }

            //     if (this.param('name') === 'presenation') {
            //         var chatPage = (
            //             <PresentationScreen />
            //         )
            //     }

            //     if (history.pushState) {
            //         history.pushState(null, null, this.param('href'));
            //     }

            //     <Overlay Type="side">
            //         {chatPage}
            //     </Overlay>
            //         .param({
            //             topBar: true,
            //             scrollContent: true
            //         })
            //         .pushToStackNavigation({
            //             context: this,
            //             onDidPop: function () {
            //                 chatPage.detach()
            //             }
            //         })
            // })

            // }

        }
    },

    Shelf__dot: {

        expand: function () {

            this.css('background', this.param('color'))
            
            

        }
    },

    Shelf__title: {
        inherits: 'Typo',
        mod: {
            Text: 'XL',
            Line: 'L'
        },
        expand: function () {

            this.css('background', this.param('color'))
            
            

        }
    },
    

})





Beast.decl({
    Steps: {

        expand: function () {

            this.append(
                Beast.node("items",{__context:this},"\n                    ",this.get('step'),"\n                ")
                
            )

        }
    },
    
    Steps__step: {

        expand: function () {
            
            this.append(
                Beast.node("num",{__context:this},this.get('num')),
                this.get('text')

                
            )

        }
    },

    Steps__num: {

        expand: function () {

            this.css('background', this.parentBlock().param('color'))
            this.css('color', this.parentBlock().param('text'))
            

        }
    }
})





Beast.decl({
    Showcase: {

        expand: function () {
            this.append(
                
                    this.get('items')
                
            )

        }
    },
    
    Showcase__item: {

        expand: function () {
            this.css('background', this.parentBlock().param('color'))
            
            this.append(
                
                Beast.node("Thumb",{__context:this,"Ratio":this.parentBlock().mod('Ratio')},this.text())
                
            )

        }
    },

    

    
})





Beast.decl({
    Gallery: {
        inherits: 'Typo',
        mod: {
            Text: 'S',
            Line: 'L'
        },
        expand: function () {
            this.append(
                Beast.node("items",{__context:this},"\n                    ",this.get('item'),"\n                ")
                
            )

        }
    },
    
    Gallery__image: {

        expand: function () {
            
            
            this.append(
                
                Beast.node("Thumb",{__context:this,"Ratio":"1x1"},this.text())
                
            )

        }
    },

    Gallery__item: {
        tag: 'a',
        expand: function () {
            var href = this.param('href')
            this.domAttr('href', href)

        }
    },



    

    
})





Beast.decl({
    Link: {
        tag: 'a',
        
        expand: function () {
            this.domAttr('href', this.param('href'))

        }
    },
    
    



    

    
})





/**
 * @block Thumb Тумбнеил
 * @dep grid link
 * @tag thumb video oo snippet
 * @ext link grid
 */
Beast.decl({
    Thumb: {
        inherits: ['Grid'],
        mod: {
            Ratio:'',               // @mod Ratio {1x1 1x2 2x1 2x3 3x2 3x4 4x3 16x10} Пропорция
            Fit:'cover',            // @mod Fit {cover! contain} Растягивание картинки по контейнеру
            Theme:'',               // @mod Theme {app userpic video} Предустановки для разного типа картинок
            Shade: false,           // @mod Shade {boolean} Затенить (для белых границ)
            Grid: false,            // @mod Grid {boolean} Покрыть мелкой сеткой (для картинок плохого качества)
            Parallax: false,        // @mod Parallax {boolean} Параллакс при скролле
            Visibility: 'visible',
            ColorWiz: false,        // @mod ColorWiz {boolean} Отправлять гамму картинки с событием ColorWizMagic
            Shadow: false,          // @mod Shadow {boolean} Тень
            Rounded: false,         // @mod Rounded {boolean} Скругленные углы
        },
        param: {
            src:'',     // @param src {string} Адрес изображения
            width:'',   // @param width {number} Ширина в px
            height:'',  // @param height {number} Высота в px
            title: '',  // @param title {string} Надпись поверх картинки
            ColorWiz: {
                background: '',
                title: '',
                text: '',
                button: '',
            },
        },
        expand: function () {
            var width = this.param('width')
            var height = this.param('height')
            var images = this.elem('image')

            if (this.text()) {
                this.param('src', this.text())
            }

            this.empty()

            if (this.mod('theme') === 'app') {
                this.mod({
                    Ratio:'1x1',
                    Fit:'cover',
                })
            }

            if (this.mod('theme') === 'userpic') {
                this.mod({
                    Ratio:'1x1',
                    Fit:'cover',
                })
            }

            if (this.mod('theme') === 'video') {
                this.mod({
                    Ratio:'16x10',
                    Fit:'cover',
                })
            }

            if (this.mod('Ratio') || (this.param('width') && this.param('height')) || this.mod('Parallax') || this.has('image')) {
                if (this.has('image')) {
                    this.append(
                        Beast.node("images",{__context:this},this.get('image'))
                    )
                } else {
                    if (this.mod('Parallax')) {
                        this.append(
                            Beast.node("image",{__context:this},this.param('src'))
                        )
                    } else {
                        this.css({
                            backgroundImage: 'url('+ this.param('src') +')',
                            width: this.param('width'),
                            height: this.param('height'),
                        })
                    }
                }

                if (this.param('title')) {
                    this.append(
                        Beast.node("title",{__context:this},this.param('title'))
                    )
                }
            } else {
                this.tag('img')
                    .domAttr('src', this.param('src'))

                if (this.param('width')) {
                    this.css('width', width)
                }
                if (this.param('height')) {
                    this.css('height', height)
                }
            }
        },
        domInit: function fn () {
            this.inherited(fn)

            var that = this

            // var width = this.domNode().offsetWidth
            // var height = this.domNode().offsetHeight
            // var img = document.createElement('img')

            // img.setAttribute('src', this.param('src'))
            // img.onload = function () {
            //     if (width && width * window.devicePixelRatio > this.width  ||
            //         height && height * window.devicePixelRatio > this.height ) {
            //         that.mod('Grid', true)
            //     }
            //     img = null
            // }

            if (this.mod('Parallax') || this.mod('Slideshow')) {
                this.checkVisibility()

                if (this.mod('Parallax')) {
                    this.param(
                        'image', this.elem('images')[0] || this.elem('image')[0]
                    )
                }

                var calcOffsetOnScroll = false

                this.onWin('scroll', function () {
                    this.checkVisibility()

                    // Browser gets wrong offset values before window scroll
                    if (!calcOffsetOnScroll) {
                        this.calcOffset(true)
                        calcOffsetOnScroll = true
                    }

                    if (this.mod('Parallax')) {
                        requestAnimationFrame(this.parallaxTranslate.bind(this))
                    }
                }.bind(this))
            }

            if (this.mod('ColorWiz')) {
                requestAnimationFrame(function () {
                    ColorWiz.magic(this.param('src'), function (color) {
                        this.trigger('ColorWizMagic', color)
                    }.bind(this))
                }.bind(this))
            }

            if (this.mod('Theme') === 'app') {
                ColorWiz.isFilled(this.param('src'), function (isFilled) {
                    if (!isFilled) {
                        this.mod('Border', true)
                    }
                }.bind(this))
            }
        },
        calcOffset: function (force) {
            // domNode.offsetParent is null when domNode is not displayed in DOM
            if (this.domNode().offsetParent === null) {
                this.param('display', false)
            }
            else if (!this.param('display') || force) {
                var offset = MissEvent.offset(this.domNode())
                var windowHeight = window.innerHeight
                var offsetHeight = this.domNode().offsetHeight
                var halfOffsetHeight = Math.round(offsetHeight / 2)

                this.param({
                    display: true,
                    offsetleft: offset.left,
                    offsetTop: offset.top,
                    offsetHeight: offsetHeight,
                    halfOffsetHeight: halfOffsetHeight,
                    offsetTopMiddle: offset.top + halfOffsetHeight,
                    offsetBottom: offset.top + offsetHeight,
                    windowHeight: windowHeight,
                    windowHalfHeight: Math.round(windowHeight / 2),
                })
            }
        },
        checkVisibility: function () {
            this.calcOffset()

            if (!this.param('display')) {
                this.mod('Visibility', 'hidden')
                return
            }

            var scrollTop = document.body.scrollTop
            var scrollBottom = scrollTop + this.param('windowHeight')

            if (scrollBottom > this.param('offsetTop') && scrollTop < this.param('offsetBottom')) {
                this.mod('Visibility', 'visible')
            } else {
                this.mod('Visibility', 'hidden')
            }
        },
        parallaxTranslate: function () {
            var middleHeightPoint = window.pageYOffset + this.param('windowHalfHeight')
            var diff = (
                (middleHeightPoint - this.param('offsetTopMiddle')) /
                (this.param('windowHalfHeight') + this.param('halfOffsetHeight')) *
                10
            )

            if (diff > 10) diff = 10
            if (diff < -10) diff = -10

            if (this.param('prevDiff') !== diff) {
                this.param('image').css('transform', 'translateY('+ diff +'px)')
                this.param('prevDiff', diff)
            }
        }
    },

    Thumb__image: {
        mod: {
            State: 'release'
        },
        expand: function () {
            this.empty()
                .css({
                    backgroundImage: 'url('+ this.text() +')',
                    width: this.parentBlock().param('width'),
                    height: this.parentBlock().param('height'),
                })
        }
    },

    Thumb__images: {
        param: {
            timeoutTimer: undefined,
            intervalTimer: undefined,
            timeout: 5000,
        },
        expand: function () {
            this.get('image')[0].mod('State', 'active')
        },
        domInit: function () {
            if (this.parentBlock().mod('Slideshow')) {
                this.parentBlock().onMod('Visibility', 'visible', this.startAnimation.bind(this))
                this.parentBlock().onMod('Visibility', 'hidden', this.stopAnimation.bind(this))
            }
        },
        startAnimation: function () {
            var images = this.get('image')
            var activeIndex
            var activeImage

            this.param(
                'timeoutTimer',
                setTimeout(function () {
                    this.param(
                        'intervalTimer',
                        setInterval(
                            function () {
                                for (var i = 0, ii = images.length; i < ii; i++) {
                                    if (images[i].mod('State') === 'active') {
                                        activeImage = images[i]
                                        activeIndex = i
                                        break
                                    }
                                }

                                if (activeIndex === images.length - 1) {
                                    activeIndex = 0
                                } else {
                                    activeIndex++
                                }

                                activeImage.mod('State', 'release')
                                images[activeIndex].mod('State', 'active')
                            }.bind(this),
                            this.param('timeout')
                        )
                    )
                }.bind(this), 1000 * Math.random())
            )
        },
        stopAnimation: function () {
            if (this.param('timeoutTimer')) {
                clearTimeout(this.param('timeoutTimer'))
            }
            if (this.param('intervalTimer')) {
                clearTimeout(this.param('intervalTimer'))
            }
        },
    },

    Thumb__title: {
        inherits: 'Typo',
        mod: {
            Text: 'S',
            Medium: true,
        }
    },
})

// @example <Thumb Ratio="1x1" Col="3" src="https://jing.yandex-team.ru/files/kovchiy/2017-03-23_02-14-26.png"/>
// @example <Thumb Ratio="1x1" Col="3" Shadow src="https://jing.yandex-team.ru/files/kovchiy/2017-03-23_02-14-26.png"/>
// @example <Thumb Ratio="1x1" Col="3" Grid src="https://jing.yandex-team.ru/files/kovchiy/2017-03-23_02-14-26.png"/>
// @example <Thumb Ratio="1x1" Col="3" Rounded src="https://jing.yandex-team.ru/files/kovchiy/2017-03-23_02-14-26.png"/>
Beast.decl({

    /**
     * @block UINavigation Компонент паттерна навигации
     * @tag base
     */
    UINavigation: {
        mod: {
            State: '', // active, release
        },
        onMod: {
            State: {
                active: function (callback) {
                    callback && callback()
                },
                release: function (callback) {
                    callback && callback()
                }
            }
        },
        activate: function(callback) {
            this.mod('state', 'active', callback)
        },
        release: function(callback) {
            this.mod('state', 'release', callback)
        },

        /**
         * Pushes itself to StackNavigation
         * @options {context:BemNode, onDidPush:function, onDidPop:function, onWillPush:function, onWillPop:function, fog:boolean}
         */
        pushToStackNavigation: function(options) {
            if (options.fog === undefined) {
                options.fog = true
            }

            this.param('options', options)
            this._parentContextOfKind('UIStackNavigation', options.context).push(this)
            return this
        },

        /**
         * Pops itself from StackNavigation
         */
        popFromStackNavigation: function() {
            this._parentContextOfKind('UIStackNavigation', this).pop()
            return this
        },

        /**
         * Pops all NavigationItems from StackNavigation
         */
        popAllFromStackNavigation: function() {
            this._parentContextOfKind('UIStackNavigation', this).popAll()
            return this
        },

        /**
         * Gets parent node for @context of @kind
         */
        _parentContextOfKind: function(kind, context) {
            var node = context._parentNode
            while (!node.isKindOf(kind)) node = node._parentNode
            return node
        },
    },

    /**
     * @block UIStackNavigation Паттерн стэковой навигации
     * @tag base
     */
    UIStackNavigation: {
        inherits: 'UINavigation',
        param: {
            storedScrollPosition: 0,
        },
        expand: function fn () {
            this.inherited(fn)
            this.append(Beast.node("layer",{__context:this},this.get('/')))
            this.topLayer().mod('Root', true)
        },
        onMod: {
            Pushing: {
                true: function () {
                    this.mod('HasFog', this.topNavigationItem().param('options').fog)
                }
            },
            Popping: {
                false: function () {
                    var topItemOptions = this.topNavigationItem().param('options')
                    if (topItemOptions) {
                        this.mod('HasFog', topItemOptions.fog)
                    }
                }
            }
        },
        onWin: {
            popstate: function (e) {
                var item = this.topNavigationItem()
                item && item.popFromStackNavigation && item.popFromStackNavigation()
            }
        },

        /**
         * Pushes @navigationItem to stack
         */
        push: function(navigationItem) {
            this.storeRootScrollPosition()

            this.append(Beast.node("layer",{__context:this},navigationItem))

            this.mod('Pushed', !this.topLayer().mod('Root'))
                .mod('Pushing', true)

            var onDidPush = this.topNavigationItem().param('options').onDidPush
            var onWillPush = this.topNavigationItem().param('options').onWillPush

            this.topNavigationItem().activate(function() {
                this.mod('Pushing', false)
                onDidPush && onDidPush()
            }.bind(this))

            // history.pushState({UIStackNavigation: true}, '', '#')
            this.updateFogSize(navigationItem)

            onWillPush && onWillPush()
        },

        /**
         * Pops @navigationItem from stack
         */
        pop: function(index) {
            this.mod('Popping', true)

            var navigationItem = index === undefined
                ? this.topNavigationItem()
                : this.navigationItemByIndex(index)

            var onWillPop = navigationItem.param('options').onWillPop
            var onDidPop = navigationItem.param('options').onDidPop

            var onRelease = function() {
                onDidPop && onDidPop()
                this.topLayer().remove()
                this.mod('Pushed', !this.topLayer().mod('Root'))
                this.restoreRootScrollPosition()
                this.mod('Popping', false)
            }.bind(this)

            navigationItem.release(onRelease)

            onWillPop && onWillPop()
        },

        /**
         * Pops all @navigationItem's from stack
         */
        popAll: function () {
            this.elem('layer').forEach(function(layer, index) {
                if (index !== 0) {
                    layer.parentBlock().pop(index)
                }
            })
        },

        /**
         * Gets top layer from stack
         */
        topLayer: function() {
            return this.elem('layer').pop()
        },

        /**
         * Gets NavigationItem of top layer
         */
        topNavigationItem: function() {
            return this.topLayer().get('/')[0]
        },

        /**
         * Gets NavigationItem by layer index
         */
        navigationItemByIndex: function (index) {
            return this.elem('layer')[index].get('/')[0]
        },

        /**
         * Stores scroll position
         */
        storeRootScrollPosition: function() {
            if (this.topLayer().mod('Root')) {
                this.param('scrollPosition', window.pageYOffset || document.documentElement.scrollTop)
                this.topLayer().css('margin-top', -this.param('scrollPosition'))
            }
        },

        /**
         * Resores scroll position
         */
        restoreRootScrollPosition: function() {
            if (this.topLayer().mod('Root')) {
                this.topLayer().css('margin-top', '')
                window.scrollTo(0, this.param('scrollPosition'))
            }
        },

        /**
         * Set fog size by navigationItem size
         */
        updateFogSize: function (navigationItem) {
            var itemHeight = navigationItem.domNode().offsetHeight + 200
            var parentHeight = this.domNode().offsetHeight

            if (itemHeight > parentHeight) {
                this.topLayer().get('fog')[0].css('height', itemHeight)
            }
        },
    },

    UIStackNavigation__layer: {
        expand: function () {
            this.append(
                this.get('/'), Beast.node("fog",{__context:this,"Active":true})
            )

            if (!this.mod('root')) {
                this.on('mousedown', function (e) {
                    var PointedDom = document.elementFromPoint(e.clientX, e.clientY)
                    if (PointedDom === this.domNode()) {
                        this.parentBlock().popAll()
                    }
                })
            }
        }
    },

    UIStackNavigation__fog: {
        inherits: 'Control',
        mod: {
            Active: false,
        },
        on: {
            Release: function () {
                if (!this.parentBlock().mod('Pushing')) {
                    this.parentBlock().popAll()
                }
            }
        }
    },

    /**
     * @block UISwitchNavigation Паттерн табовой навигации
     * @tag base
     */
    UISwitchNavigation: {
        inherits: 'UINavigation',
        expand: function() {
            this.append(
                this.get('/').map(function(item, index) {
                    return Beast.node("layer",{__context:this},item)
                })
            )
        },

        /**
         * Switches to item element with @index
         */
        switchToIndex: function (index) {
            if (this.elem('layer').length !== 0) {
                this.elem('layer').forEach(function(layer, layerIndex) {
                    var navigationItem = layer.get('/')[0]
                    if (layerIndex === index) {
                        layer.activate()
                    } else {
                        layer.release()
                    }
                })
            } else {
                this.param('switchToIndex', index)
            }
        }
    },
    UISwitchNavigation__layer: {
        inherits: 'UINavigation',
        noElems: true,
        mod: {
            State: 'release'
        },
        expand: function () {
            if (this.parentBlock().param('switchToIndex') === this.index()) {
                this.activate()
            }

            this.append(this.get('/'))
        }
    }
})
