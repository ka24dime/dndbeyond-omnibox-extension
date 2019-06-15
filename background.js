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
        var category = params.shift();
        var url_suffix = '';

        if ('spells'.startsWith(category)) {
            url_suffix = buildSpellURL(params.shift());
        } else if ('races'.startsWith(category)) {
            url_suffix = "races/" + params.shift();
        } else if ('classes'.startsWith(category)) {
            var class_search = parseClass(params.shift());
            url_suffix = "classes/" + class_search.class_name;
        } else if ('backgrounds'.startsWith(category)) {
            url_suffix = "backgrounds?filter-name=" + params.shift();
        } else if ('monsters'.startsWith(category)) {
            url_suffix = "monsters?filter-search=" + params.shift();
        } else if ('items'.startsWith(category) || 'equipment'.startsWith(category)) {
            url_suffix = "equipment?filter-search=" + params.shift();
        } else if ('feats'.startsWith(category)) {
            url_suffix = "feats?filter-name=" + params.shift();
        }

        console.log("moving to " + url_base + url_suffix);
        chrome.tabs.update({ url: url_base + url_suffix });
    }
);


function buildSpellURL(params) {
    var spell_prefix = 'spells?';
    var class_search = new Object();
    var search_text = '';
    var level = '';
    while (params.length > 0) {
        var category_text = params.shift();
        if ('class'.startsWith(category_text)) {
            var class_text = params.shift();
            class_search = parseClass(class_text);
        } else if ('level'.startsWith(category_text)) {
            level = params.shift();
        } else if ('search'.startsWith(category_text)) {
            search_text = params.shift();
        }
    }

    var class_filter = 'filter-class=' + class_search.class_integer;
    var search_filter = 'filter-search=' + search_text;
    var level_filter = 'filter-level=' + level;
    var url_return = spell_prefix + class_filter + '&' + search_filter + '&' + level_filter;
    return url_return;
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

function parseClass(text) {
    var return_obj = new Object();

    if ('bard'.startsWith(text)) {
        return_obj.class_integer = 1;
        return_obj.class_name = 'bard';
    } else if ('cleric'.startsWith(text)) {
        return_obj.class_integer = 2;
        return_obj.class_name = 'cleric';
    } else if ('druid'.startsWith(text)) {
        return_obj.class_integer = 3;
        return_obj.class_name = 'druid';
    } else if ('paladin'.startsWith(text)) {
        return_obj.class_integer = 4;
        return_obj.class_name = 'paladin';
    } else if ('ranger'.startsWith(text)) {
        return_obj.class_integer = 5;
        return_obj.class_name = 'ranger';
    } else if ('sorcerer'.startsWith(text)) {
        return_obj.class_integer = 6;
        return_obj.class_name = 'sorcerer';
    } else if ('warlock'.startsWith(text)) {
        return_obj.class_integer = 7;
        return_obj.class_name = 'warlock';
    } else if ('wizard'.startsWith(text)) {
        return_obj.class_integer = 8;
        return_obj.class_name = 'wizard';
    } else {
        return_obj.class_integer = 0;
        return_obj.class_name = 'none';
    }

    return return_obj;
}