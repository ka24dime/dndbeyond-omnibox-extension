'use strict';
chrome.omnibox.onInputChanged.addListener(
    function(text, suggest) {
        console.log('inputChanged: ' + text);
        var suggestions = [];
        var categories = ["spell", "race", "class", "background", "monster", "item", "feat"];
        categories.forEach(function(category,index,arr) {
            if (category.includes(text)) {
                suggestions.push({content: category, description: "search " + category});
            }
        });
        if (text.includes("spell ") || text.includes("sp ")) {
            var spell_filters = ["class", "search"];
            var filter_text = text.substr(text.lastIndexOf(' ') + 1);
            var string_base = text.substring(0, text.lastIndexOf(' ') + 1);
            console.log(filter_text);
            spell_filters.forEach(function(filter,index,arr) {
                if (filter.includes(filter_text)) {
                    suggestions.push({content: string_base + filter, description: "filter by " + filter});
                }
            });
            var class_regex = /(class|cl|c)\s*(\w+)/;
            var match = class_regex.exec(text);
            if (match) {
                console.log(match[2]);
                var classes = ["bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard"];
                var class_text = match[2];
                classes.forEach(function(class_name,index,arr) {
                    if (class_name.includes(class_text)) {
                        suggestions.push({content: string_base + class_name, description: "class " + class_name});
                    }
                })
            }
        }
        suggest(suggestions);
    }
);

chrome.omnibox.onInputEntered.addListener(
    function(text) {
        console.log('inputEntered: ' + text);
        var url_base = 'https://www.dndbeyond.com/';
        var params = text.split(' ');
        var resource = params.shift();
        var url_suffix = '';

        switch (resource) {
            case 'sp':
            case 'spell':
                url_suffix = buildSpellURL(params);
                break;
            case 'race':
                url_suffix = "races/" + params;
                break;
            case 'class':
                url_suffix = "classes/" + params;
                break;
            case 'bg':
            case 'background':
                url_suffix = "backgrounds?filter-name=" + params;
                break;
            case 'mon':
            case 'monster':
                url_suffix = "monsters?filter-search=" + params;
                break;
            case 'item':
                url_suffix = "equipment?filter-search=" + params;
                break;
            case 'feat':
                url_suffix = "feats?filter-name=" + params;
                break;
        }
        console.log("moving to " + url_base + url_suffix);
        chrome.tabs.update({ url: url_base + url_suffix });
    }
);


function buildSpellURL(params) {
    var spell_prefix = 'spells?';
    while (params.length > 0) {
        var category = params.shift();
        var class_to_search = 0;
        var search_text = '';
        switch (category) {
            case 'c':
            case 'cl':
            case 'class':
                var class_name = params.shift();
                switch (class_name) {
                    case 'b':
                    case 'bard':
                        class_to_search = 1;
                        break;
                    case 'c':
                    case 'cleric':
                        class_to_search = 2;
                        break;
                    case 'd':
                    case 'druid':
                        class_to_search = 3;
                        break;
                    case 'p':
                    case 'paladin':
                        class_to_search = 4;
                        break;
                    case 'r':
                    case 'ranger':
                        class_to_search = 5;
                        break;
                    case 's':
                    case 'sorcerer':
                        class_to_search = 6;
                        break;
                    case 'wa':
                    case 'war':
                    case 'warlock':
                        class_to_search = 7;
                        break;
                    case 'wi':
                    case 'wiz':
                    case 'wizard':
                        class_to_search = 8;
                        break;
                    default:
                        class_to_search = 0;
                }
                break;
            case 's':
            case 'search':
                search_text = params.shift();
                break;
            default:
                search_text = '';
        }
    }

    var class_filter = 'filter-class=' + class_to_search;
    var search_filter = 'filter-search=' + search_text;
    return spell_prefix + class_filter + "&" + search_filter;
}

function buildRaceURL (params) {
    url_prefix = 'races/';
    return url_prefix + params;
}