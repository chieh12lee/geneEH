
(function(factory) {
	'use strict'
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory)
	} else if (typeof exports !== 'undefined') {
		module.exports = factory(require('jquery'))
	} else {
		factory(jQuery)
	}
})(function($) {
	'use strict'

	$.fn.gene = {
    debug: 0,
    tags: [],
    evts: {},
    scriptName: 'jquery.gene',
    subFolder: 'scripts/plugins',
    taClass: 'gee',
    apiUri: '/',

    goBack: function(me) {
        history.go(-1);
    },

    stdSubmit: function(me) {

        var g = $.fn.gene,
            f = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form'),
            dAction = function() {

                me.removeAttr('disabled').find('i').remove();

                if (this.code == '1') {
                    if (me.attr('reset') === '1') {
                        f[0].reset();
                    }

                    if (g.isset(this.data.msg)) {
                        g.alert({
                            title: 'Alert!',
                            txt: this.data.msg
                        });
                    }

                    if (g.isset(this.data.uri)) {
                        location.href = (this.data.uri === '') ? g.apiUri : this.data.uri;
                    }

                    if (g.isset(this.data.goback)) {
                        history.go(-1);
                    }

                    if (g.isset(this.data.reset)) {
                        f[0].reset();
                    }

                    if (g.check(this.data.func)) {
                        g.clog(this.data.func);
                        g.exe(this.data.func, me);
                    }
                } else {
                    if (g.isset(this.data) && g.isset(this.data.msg)) {
                        g.alert({
                            title: 'Alert!',
                            txt: this.data.msg
                        });
                    } else {
                        g.alert({
                            title: 'Error!',
                            txt: 'Server Error, Plaese Try Later(' + this.code + ')'
                        });
                    }
                }
            };

        f.find('input').each(function() {
            if ($(this).val() == $(this).attr('placeholder')) $(this).val('');
        });

        if (!$.validatr.validateForm(f)) {
            return false;
        }
        else {
            me.attr('disabled', 'disabled').append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');

            g.yell(me.data('uri'), f.serialize(), dAction, dAction);
        }

    },

    yell: function(uri, postData, successCB, errorCB, type, hideLoadAnim) {

        var g = $.fn.gene;
        var json = (uri.indexOf('://') == -1) ? 'json' : 'jsonp';
        type = type || 'POST';
        uri = (uri.indexOf('://') == -1) ? g.apiUri + uri : uri;

        if (!hideLoadAnim) {
            g.loadAnim('show');
        }

        $.ajax({
                'url': uri,
                'type': type,
                'data': postData,
                'dataType': json,
                'cache': false
            })
            .done(function(j) {
                if (j) {
                    g.clog(j);
                    if (g.isset(j.errorCode)) {
                        if (typeof errorCB == 'function') {
                            errorCB.call(j);
                        }
                        else {
                            g.alert({
                                title: 'Error!',
                                txt: 'Server Error, Plaese Try Later(' + j.errorCode + ')'
                            });
                        }
                    }
                    else {
                        if (typeof successCB == 'function') {
                            successCB.call(j);
                        }
                    }
                } else {
                    g.alert({
                        title: 'Error!',
                        txt: 'Server Error, Plaese Try Later(2)'
                    });
                }
            })
            .fail(function(o, s) {
                g.err('ajax fail(' + o.status + ')!!');
            })
            .always(function() {
                g.clog('ajax complete');
                if (!hideLoadAnim) {
                    g.loadAnim('hide');
                }
            });
    },

    resetForm: function(me) {
        var f = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form');
        f[0].reset();
    },

    getChainOption: function(me) {
        var g = $.fn.gene,
            ta = me.data('ta'),
            uri = me.data('uri'),
            v = me.val();

        $.get(
            uri + '&pid=' + v,
            function(data) {
                $('#' + ta).html(data);
            }
        );
    },

    loadAnim: function(command) {
        var obj = $('body'),
            anim = (command == 'show' || obj.hasClass('loadAnim')) ? 'show' : 'hide';

        if (anim == 'hide' || command == 'hide') {
            obj.removeClass('loadAnim');
        } else {
            obj.addClass('loadAnim');
        }
    },

    alert: function(me) {
        var title = me.title || me.data('title');
        var content = me.txt || me.data('txt');

        // $('#errorModal')
        // .find('.title').html(title).end()
        // .find('.content').html(content).end()
        // .modal('show');
        alert(content);
    },

    test: function(me) {
        var g = $.fn.gene;

        g.clog(me);
    },

    exe: function(func, args) {
        var g = $.fn.gene,
            fun = (!g.check(func)) ? g['notfound'] : g[func];

        g.clog('exe::' + func);

        return fun.call(this, args);
    },

    pageController: function(me) {
        var g = $.fn.gene,
            func = 'load' + me.attr('id').capitalize();
        if (!g.check(func)) {
            g.clog('load:::' + func);
            g.load(func, 'controller');
        }

        if (!g.check(func)) {
            g.clog('load fail:::' + func);
        } else {
            g.clog('start::' + me.attr('id').capitalize());
            g.exe(func, me);
        }
    },

    load: function(functionName) {
        var g = $.fn.gene,
            loc = window.location.pathname;

        g.clog('script::' + g.subFolder + '/' + functionName + '.js');

        if (!g.check(functionName)) {
            if (typeof importScripts == 'function') {
                g.clog('start importScripts::');
                importScripts(g.subFolder + '/' + functionName + '.js');
            } else {
                g.clog('start scripttag::');
                $('body').append('<script src="' + g.subFolder + '/' + functionName + '.js">\x3C/script>');
            }
        }
    },

    notfound: function(me) {
        var g = $.fn.gene;
        g.err('command not found!!');
    },

    err: function(txt) {
        if (txt !== '')
            this.clog('Error::' + txt);
        else
            this.clog('Error::unknown error!!');
    },

    check: function(functionName) {
        var g = $.fn.gene;
        return g.isset(g[functionName]);
    },

    clog: function(txt) {
        var g = $.fn.gene;
        if (typeof console != 'undefined' && g.debug == 1) {
            if (typeof txt == 'string' || typeof txt == 'number') {
                console.log('gene::' + txt);
            } else {
                console.log('gene::' + typeof(txt));
                console.log(txt);
            }
        }
        return g;
    },

    parseUrlQuery: function(txt) {
        var a = document.createElement('a');
        a.href = txt;
        return (function() {
            var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length,
                i = 0,
                s;
            for (; i < len; i++) {
                if (!seg[i]) {
                    continue;
                }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })();
    },

    hookTag: function(newTagName, func) {
        var g = $.fn.gene;
        if (!g.check(newTagName)) {
            g.tags.push(newTagName);
            g.hook(newTagName, func);
        } else {
            g.clog(newTagName + ' overwrite?');
        }
    },

    hook: function(functionName, fun, evt) {
        var g = $.fn.gene;
        if (!g.check(functionName)) {
            g[functionName] = fun;
            g.evts[functionName] = (evt != 'undefined') ? evt : 'click';
        } else {
            g.clog(functionName + ' overwrite?');
        }
    },

    unhook: function(functionName, fun) {
        var g = $.fn.gene;
        if (g.check(functionName)) {
            delete g[functionName];
        } else {
            g.clog(functionName + ' exist?');
        }
    },

    isset: function(obj) {
        if (typeof obj == 'undefined' || obj === null) {
            return false;
        } else {
            return true;
        }
    },

    bindToEvt: function(evt) {
        var g = $.fn.gene;
        var me = $(this);

        if (me.data('nopde') != 1) {
            evt.preventDefault();


            g.clog('nopde');
        }

        me.event = evt;
        g.clog('start');
        g.exe(me.data('meb')[evt.type], me);
    },

    init: function() {
        var g = $.fn.gene;

        for (var tk in g.tags) {
            g.exe(g.tags[tk], $(g.tags[tk]));
        }

        $('.' + g.taClass).each(function() {
            var me = $(this),
                e = me.data('event'),
                b = me.data('behavior'),
                ebi = me.data('gene'),
                meb = {};

            if (!g.isset(b)) {
                b = 'notfound';
            }

            if (!g.isset(e)) {
                e = (!g.isset(g.evts[b])) ? 'click' : g.evts[b];
            }

            if (!g.isset(ebi)) {
                meb[e] = b;
            } else {
                var eba = ebi.replace(' ', '').split(',');
                for (var ai = 0; ai < eba.length; ai++) {
                    var ebo = eba[ai].split(':');
                    if (!g.isset(ebo[1])) {
                        ebo[1] = ebo[0];
                        ebo[0] = 'click';
                    }
                    meb[ebo[0]] = ebo[1];
                }
            }

            g.clog(meb);

            me.data('meb', meb).unbind();

            for (var ei in meb) {
                if (!g.check(meb[ei])) {
                    g.clog('load:::' + meb[ei]);
                    g.load(meb[ei]);
                }

                if (!g.check(meb[ei])) {
                    g.clog('load fail:::' + meb[ei]);
                }

                if (ei == 'init') {
                    g.exe(meb[ei], me);
                } else {
                    me.on(ei, g.bindToEvt);
                }
            }
        }).removeClass(g.taClass);
    }
    }



	$.fn.applyGEE = function(ta, obj) {
		var g = $.fn.gene
		if (g.isset(ta)) {
			g.exe(ta, obj)
		} else {
			var b = this.data('behavior')
			g.exe(b, this)
		}

		return this
	}
})

export default $.fn.gene
