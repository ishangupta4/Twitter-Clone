console.log('Working');

var hashtags = [];
var mentions = [];

function hashtagchecker(str) {
    var index = str.indexOf('#');
    if (index == -1) {
        return
    }
    var hashtag = '';
    var slicingindex;
    for (i = index + 1; i < str.length; i++) {
        if (str[i] == ' ') {
            hashtags.push(hashtag);
            slicingindex = i + 1;
            break;
        } else {
            hashtag = hashtag + str[i]
        }

    }
    hashtagchecker(str.slice(slicingindex));
}

function mentionchecker(str) {
    var index = str.indexOf('@');
    if (index == -1) {
        return
    }
    var mention = '';
    var slicingindex;
    for (i = index + 1; i < str.length; i++) {
        if (str[i] == ' ') {
            mentions.push(mention);
            slicingindex = i + 1;
            break;
        } else {
            mention = mention + str[i];
            if (i+1  == str.length) {
                mentions.push(mention);
                slicingindex = i;
                break;
            }
        }   
    }
    console.log(slicingindex);
    mentionchecker(str.slice(slicingindex));

}

function checker(str) {
    hashtags = [];
    mentions = [];
    hashtagchecker(str);
    mentionchecker(str);
    console.log(hashtags);
    console.log(mentions);
    return { hashtags, mentions };
}

module.exports = checker;

