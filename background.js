'use strict';

chrome.omnibox.onInputChanged.addListener(function(text,suggest) {
    var suggestions = [];
    var categories = ["spell", "race", "class", "background", "monster", "item", "feat"];
    categories.forEach(function(category,index,arr) {
        if (category.includes(text) || category === '') {
            console.log('category "'+ category + '"');
            suggestions.push({content: category, description: "search " + category});
        }
    });
    suggest(suggestions);
});

chrome.omnibox.onInputChanged.addListener(function(text,suggest) {
    var suggestions = [];
    var category = parseCategory(text);
    if ('spells'.includes(parseCategory(text))) {
        console.log('watchSpells sees category: "' + category +'"');
        var current_entry = parseLastFilter(text);
        var spell_filters = ["class", "search"];
        console.log(current_entry);
        if (!current_entry.filter_complete) {
            spell_filters.forEach(function(filter,index,arr) {
                if (filter.includes(current_entry.filter) || current_entry.filter === '') {
                    console.log('add spell filter "' + filter + '"');
                    suggestions.push({content: current_entry.string_base + filter, description: "filter by " + filter});
                }
            });
        } else {
            if ('class'.includes(current_entry.filter)) {
                var classes = ["bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard"];
                var class_text = current_entry.value;
                classes.forEach(function(class_name,index,arr) {
                    if (class_name.includes(class_text) || class_text === '') {
                        console.log('add suggestion "' + class_name + '"');
                        suggestions.push({content: current_entry.string_base + class_name, description: "class " + class_name});
                    }
                });
            }
        }
    }
    suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener(
    function(text) {
        console.log('inputEntered: ' + text);
        var url_base = 'https://www.dndbeyond.com/';
        var params = text.split(' ');
        var resource = params.shift();
        var url_suffix = '';

        switch (resource) {
            case 's':
            case 'sp':
            case 'spell':
                url_suffix = buildSpellURL(params);
                break;
            case 'r':
            case 'race':
                url_suffix = "races/" + params;
                break;
            case 'c':
            case 'class':
                url_suffix = "classes/" + params;
                break;
            case 'b':
            case 'bg':
            case 'background':
                url_suffix = "backgrounds?filter-name=" + params;
                break;
            case 'm':
            case 'mon':
            case 'monster':
                url_suffix = "monsters?filter-search=" + params;
                break;
            case 'i':
            case 'item':
                url_suffix = "equipment?filter-search=" + params;
                break;
            case 'f':
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

function parseLastFilter(text) {
    var text_parts = text.split(' ');
    var return_obj = new Object();
    console.log('text is: "' + text + '"');
    console.log('array length: ' + text_parts.length);
    if (text_parts.length > 2) {
        var text_base_arr = text_parts;
        text_base_arr.pop;
        var text_base = text_base_arr.join(' ');
        return_obj.input_base = text_base;
        if (text_parts.length % 2) {
            return_obj.filter = text_parts[text_parts.length - 1];
            return_obj.filter_complete = inputComplete(text);
            if (return_obj.filter_complete) {
                return_obj.value = '';
                return_obj.value_complete = false;
            }
        } else {
            return_obj.filter = text_parts[text_parts.length - 1];
            return_obj.value = text_parts[text_parts.length - 2];
            return_obj.filter_complete = true;
            return_obj.value_complete = inputComplete(text);
        }
    } else {
        return_obj.filter = '';
        return_obj.filter_complete = false;
    }
    return return_obj;
}

function inputComplete(text) {
    var trailing_regex = /\s$/;
    if (trailing_regex.exec(text)) {
        return 1;
    } else {
        return 0;
    }
}

function parseCategory(text) {
    var text_parts = text.split(' ');
    if (text_parts.length > 1 && inputComplete(text)) {
        return text_parts[0];
    } else {
        return false;
    }
}