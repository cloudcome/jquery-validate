/*!
 * jquery.validate.js
 * @author ydr.me
 * @version 1.0
 */






module.exports = function($){
    'use strict';

    var 
        // isHTML5 = !! ('oninvalid' in document.createElement('input')),
        supportFormData = !! window.FormData,
        defaults = {
            // 表单项目选择器
            // 默认为 Bootstrap3 的表单项目class
            // 也可以为自定义
            // 目的是为了保证表单验证能够按照顺序进行
            formItemSelector: '.form-group',


            // 表单项目中需跳过验证的类
            // 默认为空
            // 跳过验证常用于动态的表单验证，如
            // 选择登陆方式：邮箱登陆或用户名登陆是两个表单项目
            // 二者只需要验证其一即可
            formItemSkipClass: '',


            // 是否跳过验证失败
            // false(默认): 出现验证错误就停止继续验证
            // true: 一直验证到结尾，无论错误与否
            isSkipInvalid: !1,


            // 是否自动提交，只在全部验证正确之后
            // true（默认）：自动调用 FormData 或 $.serizlize
            // false：不会自动提交
            isAutoSubmit: !0,


            // 自动提交的 AJAX 参数
            autoSubmitOptions: {},


            // 自定义本地验证规则
            // checkbox 和 radio 的 id 填写第一个的id值
            // 示例：
            // {
            //    // 每个表单项目可以自定义多个按顺序的本地验证规则
            //    '表单项目id':[
            //       function(){
            //          // 这里必须按照格式来返回json对象
            //          // 一些的数据处理与判断后，返回
            //          return {
            //              // 状态，true表示验证通过，false表示验证失败
            //              status: false,
            //              // 消息，表示表单验证失败的消息，验证通过是不会有消息返回的
            //              msg: '该用户名已经被注册了，请尝试使用其他用户名'
            //          };
            //       }
            //    ]
            // }
            localRules: {},


            // 自定义远程验证方法
            // checkbox 和 radio 的 id 填写第一个的id值
            // *注意*: ajax 验证失败则不会继续该表单项目的剩下的ajax验证
            // 并且ajax验证都放在了本地验证正确之后才进行
            // 参数设置按照 $.ajax 方法来
            // 官方API: http://api.jquery.com/jQuery.ajax/
            // 示例：
            // {
            //    '表单项目id':[
            //     // 每个表单项目可能有1个多个ajax验证，按照数组顺序来
            //     {
            //         // 可以是 post 或 get
            //         type: 'post',
            //         // 可以说 json script text jsonp
            //         dataType: 'json',
            //         // 在跨域请求的时候，强烈建议添加 timeout 属性，
            //         // 否则在遇到403或其他错误时不能触发success 或 error 回调
            //         timeout: 5000,
            //         // 自行组织data数据
            //         data:{},
            //         // 只接受处理 success 和 error 两个回调
            //         success: function(){
            //              // 这里必须按照格式来返回json对象
            //              // 一些的数据处理与判断后，返回
            //              return {
            //                  // 状态，true表示验证通过，false表示验证失败
            //                  status: false,
            //                  // 消息，表示表单验证失败的消息，验证通过是不会有消息返回的
            //                  msg: '该用户名已经被注册了，请尝试使用其他用户名'
            //              };
            //         },
            //         // error 的设置参考 success
            //         error: function(){}
            //    }]
            // };
            remoteRules: {},


            // 验证正确时回调
            // this: 当前表单项目的js对象
            onvalid: $.noop,

            // 验证错误时回调
            // this: 当前表单项目的js对象
            // 参数1: 错误消息
            oninvalid: $.noop,

            // 聚焦时回调
            // this: 当前表单项目的js对象
            onfocus: $.noop,

            // 正在远程验证
            // this: 当前表单项目的js对象
            onremote: $.noop,

            // 全部验证都正确
            // this: form
            onsuccess: $.noop,

            // 全部验证完成，包括正确和错误
            // this: form
            oncomplete: $.noop,

            // 表单提交后回调
            onsubmit: $.noop
        };


    $.fn.validate = function(settings) {
        var options = $.extend({}, defaults, settings);

        return this.each(function() {
            var $form = $(this),
                items = _parseFormItems($form, options),
                itemsLength = items.length,
                ajaxCurrent = 0,
                ajaxLength = 0,
                itemCurrent = 0,
                itemNopass = 0;

            if (!itemsLength) return options.oncomplete.call($form[0]);


            // 验证队列
            ! function _queue() {
                var item = items[itemCurrent],
                    // 自定义本地验证
                    localRules = (options.localRules[item.id] || []),
                    localIndex = 0,
                    localLength = localRules.length,
                    localTemp,
                    // 自定义 ajax 长度
                    ajaxLength = (options.remoteRules[item.id] || []).length,
                    // 错误消息
                    msg = item.msg,
                    _msg = '';


                options.onfocus.call(item.elem);

                // 验证 required
                if (item.required && _isEmpty(item.value)) {
                    switch(item.type){
                        case 'text':
                        default:
                        _msg = '此项必填';
                        break;

                        case 'radio':
                        case 'select':
                        case 'checkbox':
                        _msg = '此项必选';
                        break;

                        case 'file':
                        _msg = '上传文件必选';
                        break;
                    }
                    return _error(msg.required || _msg);
                }

                if(item.type==='file' && !~$.inArray((item.value.match(/[^\.]*$/)||[''])[0], item.suffix)){
                    return _error(msg.suffix || '文件类型必须是' + item.suffix.join(',') +'之一');
                }


                // 验证 minlength
                if (item.minlength && item.value.length < item.minlength) {
                    return _error(msg.maxlength || '长度不能小于' + item.minlength);
                }

                // 验证 maxlength
                if (item.maxlength && item.value.length > item.maxlength) {
                    return _error(msg.maxlength || '长度不能大于' + item.maxlength);
                }


                // 验证 pattern
                if (item.reg && !item.reg.test(item.value)) {
                    return _error(msg.pattern || '不符合规则要求');
                }


                // 验证 type
                if (!_validateType(item.type, item.value)) {
                    return _error(msg.type || '不符合类型要求');
                }


                // 验证 number
                if (item.type === 'number' && item.value !== undefined) {
                    if (item.value < item.min) return _error(msg.min || '不能小于' + item.min);
                    if (item.value > item.max) return _error(msg.max || '不能大于' + item.max);
                    if (item.value % item.step) return _error(msg.step || '必须是' + item.step+'的公倍数');
                }


                // 验证 equal
                if (item.$equal.length && item.value !== item.$equal.val()) {
                    return _error(msg.equal||'填写不匹配');
                }


                // 验证checkbox
                // 验证 multiple select
                if (item.type === 'checkbox' || item.type === 'select' && item.multiple) {
                    if (item.least && item.value.length < item.least) return _error(msg.least||'最少需要选择'+item.least+'项');
                    if (item.most && item.value.length > item.most) return _error(msg.most||'最多只能选择'+item.most+'项');
                }



                // 自定义本地验证
                for (localIndex in localRules) {
                    localTemp = localRules[localIndex].call(item.elem);
                    if (!localTemp.status) return _error(localTemp.msg);
                }


                // 自定义 ajax 验证
                if (ajaxLength) {
                    ! function _recursion() {
                        _ajax(function(json) {
                            // 正确才继续
                            if (json.status) {
                                ajaxCurrent++;
                                if (ajaxCurrent === ajaxLength) {
                                    _success();
                                } else _recursion();
                            }
                            // 出错就停止验证，减少网络开销
                            else return _error(json.msg);
                        });
                    }();
                } else _success();



                // ajax请求

                function _ajax(callback) {
                    var ajaxOptions = options.remoteRules[item.id][ajaxCurrent],
                        _ajaxOptions = $.extend({}, ajaxOptions);
                    _ajaxOptions.success = _ajaxOptions.error = _ajaxOptions.complete = null;
                    options.onremote.call(item.elem);
                    $.ajax(_ajaxOptions).done(function() {
                        callback(ajaxOptions.success.apply(item.elem, arguments));
                    }).fail(function() {
                        callback(ajaxOptions.error.apply(item.elem, arguments));
                    });
                }


                // 错误处理

                function _error(error) {
                    itemNopass++;
                    itemCurrent++;
                    options.oninvalid.call(item.elem, error||'不符合要求');
                    // 跳过错误的
                    if (options.isSkipInvalid) {
                        itemsLength !== itemCurrent ? _queue() : options.oncomplete.call($form[0]);
                    }
                    // 不跳过错误的
                    else {
                        options.oncomplete.call($form[0]);
                    }
                }


                // 所有验证完毕 => 正确处理

                function _success() {
                    ajaxCurrent = 0;
                    ajaxLength = 0;
                    itemCurrent++;
                    options.onvalid.call(item.elem);
                    if (itemCurrent === itemsLength) {
                        options.oncomplete($form[0]);
                        if (!itemNopass) {
                            options.onsuccess.call($form[0]);
                            if (options.isAutoSubmit) _submit();
                        }
                    } else {
                        _queue();
                    }
                }
            }();
        });


        // 表单提交

        function _submit() {
            var submitOptions = $.extend({}, {
                url: $form.attr('action') || location.href,
                type: $form.attr('method') || 'post',
                data: supportFormData ? new FormData($form[0]) : $form.serialize()
            }, options.autoSubmitOptions);
            if (supportFormData) {
                submitOptions.processData = !1;
                submitOptions.contentType = !1;
            }
            $.ajax(submitOptions).always(options.onsubmit);
        }
    };





    $.fn.validate.defaults = defaults;
    return this;





    /**
     * 判断是否为空对象
     * @param  {*}  object 要判断的对象
     * @return {Boolean} 是否为空
     * @version 1.0
     * 2014年6月13日11:35:26
     */
    function _isEmpty(object){
        return object ===undefined || object ===null || object==='';
    }





    /**
     * 解析表单为一个表单项目集合
     * @param  {Object} $form     表单对象
     * @param  {Object} options   配置
     * @return {Array}  规则数组
     * @version 1.1
     * 2014年3月14日16:24:47
     * 2014年6月13日11:16:24
     */

    function _parseFormItems($form, options) {
        var $formItems = $(options.formItemSelector, $form),
            formItemSkipClass = options.formItemSkipClass,
            $inputs = $(),
            // 已经加入规则的项目
            has = {},
            rules = [];

        $formItems.each(function() {
            if (!formItemSkipClass || !$(this).hasClass(formItemSkipClass)) {
                $inputs = $inputs.add($('input,select,textarea', this));
            }
        });

        $inputs.each(function() {
            var $item = $(this),
                tagName = $item[0].tagName.toLowerCase(),
                value = $item.val(),
                name = $item.attr('name'),
                pattern = $item.attr('pattern'),
                multiple = $item.prop('multiple'),
                equal = $item.data('equal'),
                placeholder = $item.data('placeholder') || '',
                type = $item.data('type') || $item.attr('type'),
                rule = {};


            if (!has[name] && $item.attr('type') !== 'hidden' && $item.css('display') !== 'none') {
                has[name] = 1;

                if (tagName === 'select' || tagName === 'textarea') type = tagName;

                // checkbox
                if (type === 'checkbox') {
                    value = [];
                    $('[name=' + name + ']:checked', $form).each(function() {
                        value.push(this.value);
                    });
                }
                // radio
                else if (type === 'radio') {
                    value = $('[name=' + name + ']:checked', $form).val();
                }
                // number
                else if (type === 'number') {
                    value = _formatNumber(value);
                }
                // select
                // single ""
                // multiple null
                // multiple ["1","2"]
                // 单选时去除默认项
                else if (type === 'select' && !multiple && value === placeholder) {
                    value = undefined;
                }
                // multiple null
                else if (type === 'select' && value === null) {
                    value = [];
                }
                // file
                else if (type === 'file') {
                    value = (value.match(/[^\/\\]*$/) || [''])[0];
                }


                rule = {
                    elem: $item[0],
                    id: $item.attr('id'),
                    name: name,
                    type: type,
                    suffix: ($item.data('suffix')||'').split(','),

                    // 值
                    value: value,

                    // 最短、最长
                    minlength: _formatNumber($item.data('minlength')),
                    maxlength: _formatNumber($item.attr('maxlength')),

                    // 正则
                    pattern: pattern,
                    reg: pattern ? new RegExp(pattern) : undefined,

                    // 最小、最大值
                    min: _formatNumber($item.attr('min')),
                    max: _formatNumber($item.attr('max')),

                    // 步进值
                    step: _formatNumber($item.attr('step')),

                    // 最少、最多
                    least: _formatNumber($item.data('least')),
                    most: _formatNumber($item.data('most')),

                    // 必填
                    required: $item.prop('required'),

                    // 多选
                    multiple: multiple,

                    // 等于
                    $equal: equal ? $('#' + $item.data('equal')) : [],
                    msg: $item.data('msg') || {}
                };
                rules.push(rule);
            }
        });
        return rules;
    }



    /**
     * 格式化数字，非数字转换为 undefined
     * @param  {*} 任何
     * @param  {*} 默认值
     * @return {Number/undefined}
     * @version 1.0
     * 2014年3月13日16:05:23
     */

    function _formatNumber(number, defaultNumber) {
        number = number * 1;
        return isNaN(number) ? defaultNumber : number;
    }



    /**
     * 验证表单type类型的字符串
     * @param  {String} 格式
     * @param  {String} 字符串
     * @return {Boolean} 真假
     * @version 1.0
     * 2014年3月11日22:16:44
     */

    function _validateType(type, value) {
        switch (type) {
            case 'url':
                return /^https?:\/\/([\w-]+\.)+([a-z]{2,6}|xn--[a-z\d]+)/i.test(value)
            case 'email':
                return /^[a-z\d][\w-.]*@([\w-]+\.)+([a-z]{2,6}|xn--[a-z\d]+)$/i.test(value);
            case 'number':
                return /^\d+$/.test(value);
            case 'date':
            case 'month':
            case 'week':
            case 'time':
            case 'datetime':
            case 'datetime-local':
                return _checkDate(type, value);
            case 'color':
                // #0000ff
                return /^#[\da-f]{6}$/.test(value);
        }

        return !0;
    }


    /**
     * 验证date格式字符串是否合法
     * @param  {String} 格式
     * @param  {String} 字符串
     * @return {Boolean} 真假
     * @version 1.0
     * 2014年3月11日22:16:44
     */

    function _checkDate(type, value) {
        var
        reg = {
            // 2014-03-10
            'date': /^(\d{4})-(\d{2})-(\d{2})()()$/,
            // 2014-03
            'month': /^(\d{4})-(\d{2})()()()$/,
            // 2014-W14
            'week': /^(\d{4})()()()()-W(\d{2})$/,
            // 03:03
            'time': /^()()()(\d{2}):(\d{2})$/,
            // 2014-03-10T03:03
            'datetime': /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
            // 2014-03-11T21:59
            'datetime-local': /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
        }, D, year, gYear, month, gMonth, date, gDate, hours, gHours, minutes, gMinutes;
        if (reg[type].test(value)) {
            year = 1 * RegExp.$1 || 1;
            month = 1 * RegExp.$2 || 1;
            date = 1 * RegExp.$3 || 1;
            hours = 1 * RegExp.$4 || 1;
            minutes = 1 * RegExp.$5 || 1;
            D = new Date(year, month - 1, date, hours, minutes);
            gYear = D.getFullYear();
            gMonth = D.getMonth() + 1;
            gDate = D.getDate();
            gHours = D.getHours();
            gMinutes = D.getMinutes();
            if (type === 'date') {
                return gYear === year && gMonth === month && date === gDate;
            } else if (type === 'month') {
                return gYear === year && gMonth === month;
            } else if (type === 'week') {
                return gYear === year;
            } else if (type === 'time') {
                return gHours === hours && gMinutes === minutes;
            } else if (type === 'datetime' || type === 'datetime-local') {
                return gYear === year && gMonth === month && date === gDate && gHours === hours && gMinutes === minutes;
            }
        } else return !1;
    }

};
