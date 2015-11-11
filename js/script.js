$(document).ready(function(){

    var textProcessor = {
        wordprocessor: function(property) {
            var words = new Lexer().lex(property);
            var taggedWords = new POSTagger().tag(words);
            for (i in taggedWords) {
                var taggedWord = taggedWords[i];
                var word = taggedWord[0];
                var tag = taggedWord[1];
            }

            return taggedWords;
        },

        tags: function(property, cb) {
            var goal = textProcessor.wordprocessor(property);

            return cb(goal);
        },

        html: {
            goal: function(goal, partsOfSpeech) {

                var punctuation = "[.]"; //,-\/#!$%\^&\*;:{}=\-_`~()


                goal.number += '<span class="expand"><img src="assets/expand_icon.svg" alt="expand icon"></span><span class="goal_number">';
                goal.text += '<h2>';

                // I need to refactor the logic
                // It works fast and as expected but there must be a more elegant solution

                // rewrite sentence
                var len = partsOfSpeech.length;
                for(var i=0; i < len; i++) {

                    //detect and format punctuation
                    if(i < len-1) {
                        if( i <= 2 ) {
                            //get goal number
                            if(i == 2) {
                                goal.number += '<span>Goal ' + goal.that.rank + ':';
                                goal.number += '</span>';
                            }
                        } else {
                            // write goal text
                            goal.text += '<span data-speech="' + partsOfSpeech[i][1] + '">';
                                if( partsOfSpeech[i+1][0].match(',') ) {
                                    goal.text += partsOfSpeech[i][0];
                                } else if(partsOfSpeech[i+1][0].match(punctuation)) {
                                    goal.text += partsOfSpeech[i][0];
                                } else {
                                    goal.text += partsOfSpeech[i][0] + ' ';
                                }
                            goal.text += '</span>';

                        }
                    } else {
                        if( i <= 2 ) {
                            //get goal number
                            if(i == 2) {
                                goal.number += '<span>Goal ' + goal.that.rank + ':';
                                goal.number += '</span>';
                            }
                        } else {
                            // write goal text
                            goal.text += '<span data-speech="' + partsOfSpeech[i][1] + '">';
                                if( partsOfSpeech[i][0].match(',') || partsOfSpeech[i][0].match(punctuation) ) {
                                    goal.text += partsOfSpeech[i][0];
                                }  else {
                                    goal.text += partsOfSpeech[i][0] + ' ';
                                }
                            goal.text += '</span>';

                        }
                    }
                }

                goal.text += '</h2>';
                goal.number += '</span>';

                return goal;
            },

            description: function(goal, partsOfSpeech) {
                var punctuation = "[.!?]";

                goal.description += '<div class="verbose_wrapper">';
                goal.description += '<div class="goal_description"><h5>Description:</h5><p>';


                // rewrite sentence
                var len = partsOfSpeech.length;
                for(var i=0; i < len; i++) {
                    if(i < len-1) {
                        goal.description += '<span data-speech="' + partsOfSpeech[i][1] + '">';

                            if( partsOfSpeech[i+1][0].match(',') ) {
                                goal.description += partsOfSpeech[i][0];
                            } else if(partsOfSpeech[i+1][0].match(punctuation)) {
                                goal.description += partsOfSpeech[i][0];
                            } else {
                                goal.description += partsOfSpeech[i][0] + ' ';
                            }
                        goal.description += '</span>';
                    } else {
                        goal.description += '<span data-speech="' + partsOfSpeech[i][1] + '">';

                            if( partsOfSpeech[i][0].match(',') || partsOfSpeech[i][0].match(punctuation)) {
                                goal.description += partsOfSpeech[i][0];
                            } else {
                                goal.description += partsOfSpeech[i][0] + ' ';
                            }
                        goal.description += '</span>';
                    }
                }

                goal.description += '</p></div>';

                return goal;
            },

            targets: function(goal, partsOfSpeech) {
                var punctuation = "[.]";

                goal.targets += '<div class="goal_targets"><h5>Targets:</h5><p>';

                    var len = partsOfSpeech.length;
                        for(var i=0; i < len; i++) {
                            if(i < len-1) {
                                goal.targets += '<span data-speech="' + partsOfSpeech[i][1] + '">';

                                    if( partsOfSpeech[i+1][0].match(',') ) {
                                        goal.targets += partsOfSpeech[i][0];
                                    } else if(partsOfSpeech[i+1][0].match(punctuation)) {
                                        goal.targets += ' ' + partsOfSpeech[i][0];
                                    } else {
                                        goal.targets += partsOfSpeech[i][0] + ' ';
                                    }
                                goal.targets += '</span>';
                            } else {
                                goal.targets += '<span data-speech="' + partsOfSpeech[i][1] + '">';

                                    if( partsOfSpeech[i][0].match(',') ) {
                                        goal.targets += partsOfSpeech[i][0];
                                    } else if(partsOfSpeech[i][0].match(punctuation)) {
                                        goal.targets += ' ' + partsOfSpeech[i][0];
                                    } else {
                                        goal.targets += partsOfSpeech[i][0] + ' ';
                                    }
                                goal.targets += '</span>';
                            }
                        }

                goal.targets += '</p></div>';
                goal.targets += '</div>' // close verbose_wrapper

                return goal;
            }
        },

        process: function(goals, cb) {
            var html = '';
            var $goals_wrapper = $('#goals_wrapper');

            goals.forEach(function(g, j){
                var goalNumber = '',
                    goalText = '',
                    goalDescription = '',
                    goalTargets = '';

                //prep container
                html += '<div class="goal_block" data-color="'+ g.color +'">';

                textProcessor.tags(g['goal'], function(taggedWords) {
                    var thisGoal = textProcessor.html.goal({
                        that: g,
                        number: goalNumber,
                        text: goalText
                         },
                    taggedWords);

                    html += thisGoal.number;
                    html += thisGoal.text;
                });

                textProcessor.tags(g['description'].replace(/(?:\r\n|\r|\n)/g, '<br><br>'), function(taggedWords) {
                    var thisGoal = textProcessor.html.description({
                            description: goalDescription,
                         },
                    taggedWords);

                    html += thisGoal.description;
                });

                textProcessor.tags(g['target'].replace(/(?:\r\n|\r|\n)/g, '<br> • '), function(taggedWords) {
                    var thisGoal = textProcessor.html.targets({
                            targets: goalTargets,
                         },
                    taggedWords);

                    html += thisGoal.targets;
                });

                //close container
                html += '</div>';

            });

            $goals_wrapper.append(html);

            return cb();
        }
    };

    var fn = {
        util: {
            isInArray: function(value,arr) {
                return arr.indexOf(value) > -1;
            }
        },
        select: {
            partsOfSpeech: function() {
                var $select = $('select');
                var nMatches = 0;
                    var highlighter = function(selector, currentSearch, color) {
                        var stack = '';
                        /********** Write part of speech to stack ***********/

                            if( currentSearch && currentSearch.indexOf(',') > -1 ) {
                                stack = currentSearch.split(',');
                            } else {
                                stack = currentSearch;
                            }
                                //console.log('stack is---',stack);

                            selector.each(function(i, v){
                                var $this = $(this),
                                    $needle = $this.data('speech');

                                    if( stack instanceof Array && fn.util.isInArray( $needle, stack) || $needle === stack) {
                                        $this.parent().css('color', color.deboss);
                                        $this.css('color', color.emboss);
                                        nMatches++;

                                    }  else if(stack && $needle != stack && !fn.util.isInArray( $needle, stack)) {
                                        // it is not in stack
                                        $this.css('color', color.deboss);
                                    }


                            });
                    }
                // get value
                $select.on('change', function(){
                    var $currentVal = $select.find('option:selected').val();
                    var $currentSearch =$select.find('option:selected').data('type');
                    var $matched = $('.numberMatches');
                    var $clearBtn = $('.clear');
                /********** Reset match number ***********/
                        nMatches = 0

                /********** Process Goals ***********/
                    var $goal = $('.goal_block h2'),
                        $verbose = $('.active_description'); //find expanded descriptions

                        //reset highlight
                        $goal.css('color', '#333');
                        highlighter($goal.find('span'),
                                    $currentSearch,
                                    { emboss: '#333', deboss: '#ddd' });

                    /********** Process Description and Targets (verbose_wrapper) ***********/
                        //reset highlight
                        $verbose.css('color', '#333');
                        highlighter( $verbose.find('span'),
                                    $currentSearch,
                                    { emboss: '#333', deboss: '#B9B9C0' } );

                    /********** Display n matched ***********/
                        if( $currentVal != 'default' ) {
                            $matched.empty().fadeIn().append('Matched: <span class="nMatch">' + nMatches + '</span>');
                            $clearBtn.fadeIn();
                        }
                });
                //do not cache - clear dropdown selection
                $('.clear').on('click', function() {
                    $('select').val('default').trigger("chosen:updated");
                    $('.goal_block span').css('color', '#333');
                    $('.numberMatches').fadeOut();
                    $(this).fadeOut();
                });

            }
        },

        triggerSelect: function() {
            var $select = $('select'),
                $currentVal = $select.find('option:selected').val();

                $select.val($currentVal).trigger('change');
        },

        toggleGoal: function() {
            var $goalName = $('.goal_block h2'),
                $goalIcon = $('.goal_block .expand');

                $goalName.on('click', function(){
                    var $this = $(this);
                    $this.parent().find('.verbose_wrapper').toggleClass('active_description');
                    $this.parent().find('.goal_description').fadeToggle(500);
                    $this.parent().find('.goal_targets').fadeToggle(500);
                    $this.parent().find('.expand').toggleClass('rotate');

                    fn.triggerSelect();
                });

                $goalIcon.on('click', function(){
                    var $this = $(this);
                    $this.parent().find('.verbose_wrapper').toggleClass('active_description');
                    $this.parent().find('.goal_description').fadeToggle(500);
                    $this.parent().find('.goal_targets').fadeToggle(500);
                    $this.toggleClass('rotate');

                    fn.triggerSelect();

                });
        },

        collapse: function() {
            //inidvidual goal
            var $collapseAll = $('.btn_container div').eq(1),
                $goalBlock = $('.goal_block'),
                $description = $goalBlock.find('.goal_description'),
                $targets = $goalBlock.find('.goal_targets'),
                $expand_btn = $goalBlock.find('.expand'),
                $verbose = $('.verbose_wrapper');

            //all
            $collapseAll.on('click', function() {
                $description.fadeOut(500);
                $targets.fadeOut(500);
                $expand_btn.removeClass('rotate');
                $verbose.removeClass('active_description');

                fn.triggerSelect();

            });
        },

        expand: function() {
            //inidvidual goal
            var $expandAll = $('.btn_container div').eq(0),
                $goalBlock = $('.goal_block'),
                $description = $goalBlock.find('.goal_description'),
                $targets = $goalBlock.find('.goal_targets'),
                $expand_btn = $goalBlock.find('.expand'),
                $verbose = $('.verbose_wrapper');


            //all
            $expandAll.on('click', function() {
                $description.fadeIn(500);
                $targets.fadeIn(500);
                $expand_btn.addClass('rotate');
                $verbose.addClass('active_description');

                fn.triggerSelect();
            });
        }
    };

    var stats = {};
    stats['view'] = {

        filterOut: function(data) {
            // filter out from display
            var toFilter = [];

            for(var i = 0; i < data.length; i++) {

                switch(data[i].pos) {
                    case undefined:
                        toFilter.push(i);
                    break;
                    case "IN": //preposition
                        //console.log(data[i]);
                        toFilter.push(i);
                    break;
                    case "DT": // the
                        //console.log(data[i]);
                        data.splice(i,1);
                    break;
                    case "CD": // cardinal number
                        //console.log(data[i]);
                        toFilter.push(i);
                    break;
                    case "CC": //Coord Conjunction
                        //console.log(data[i]);
                        toFilter.push(i);
                    break;
                    case "TO": //to
                        console.log(data[i]);
                        toFilter.push(i);
                    break;
                }


                switch(data[i].word) {
                    case "$":
                        toFilter.push();
                    break;
                    case "":
                        toFilter.push(i);
                    break;
                    case ",":
                        //console.log(data[i]);
                        toFilter.push(i);
                    break;
                    case "–":
                        //console.log(data[i]);
                        toFilter.push(i);
                    break;
                    case ".":
                        //console.log(data[i]);
                        toFilter.push(i);
                    break;
                    case "•":
                        //console.log(data[i]);
                        toFilter.push(i);
                    break;
                    case "to": //to
                        //console.log(data[i]);
                        toFilter.push(i);
                    break;
                }
            }

            data = _.filter(data, function(item, index){
                return !_.contains( toFilter, index);
            });

            return data;
        },

        display: function(data) {
            var totalCount = 7735;

            var mostCommonWord = '';

            data.forEach(function(d,i){
                if(d.count > 1) {
                    mostCommonWord += '<div>';
                    mostCommonWord += '<span class="thisCount">'+d.count+'</span>';
                    mostCommonWord += '<span class="thisBar" style="width:'+ d.count/1.15 +'%;"></span>';
                    mostCommonWord += '<span class="thisWord"><span>'+d.word+'</span></span>';
                    mostCommonWord += '</div>';
                }
            });

            $('.words').append(mostCommonWord);
        }
    };

    $.getJSON('data/priorities.json', function(goals){

        // create the color strip
        var colors = ['e5233b','dfa53a', '4d9e38', 'c91a29', 'ff3a20', '27bde2', 'fdc30a', 'a21a42', 'fe6925', 'de1267', 'fd9d24', 'c28d31', '3f7e47', '0997d9', '56c02a', '00689d', '1b476a'];

            var strip = '';
            colors.forEach(function(c,i){
                strip += '<span style="background-color:#' + c + ';" data-color="'+ c +'"></span>'
            });

            $('#color_strip').append(strip);

        // process and display goals
        textProcessor.process(goals, function() {
            fn.expand();
            fn.collapse();
            fn.toggleGoal();
            fn.select.partsOfSpeech();
        });


        // nicer select
        $('select').chosen();


        // the stats panel view
        $.getJSON('exports/stats.json', function(data){
            var originalData = JSON.parse(JSON.stringify(data));

            var data = stats.view.filterOut(data);
            stats.view.display(data);

        });

        /********** Back to top scroller ***********/

        var offset = 300,
            offset_opacity = 1200,
            scroll_top_duration = 700,
            $back_to_top = $('.top');

        //hide or show the "back to top" link
        $(window).scroll(function(){
            ( $(this).scrollTop() > offset ) ? $back_to_top.addClass('is-visible') : $back_to_top.removeClass('is-visible fade-out');
            if( $(this).scrollTop() > offset_opacity ) {
                $back_to_top.addClass('fade-out');
            }
        });

        //smooth scroll to top
        $back_to_top.on('click', function(event){
            event.preventDefault();
            $('body,html').animate({
                scrollTop: 0 ,
                }, scroll_top_duration
            );
        });

    });

});
