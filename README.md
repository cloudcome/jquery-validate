# jquery-validate [![spm version](http://spmjs.io/badge/jquery-validate)](http://spmjs.io/package/jquery-validate)

AUTHOR WEBSITE: [http://ydr.me/](http://ydr.me/)

jquery.fn.validate HTML5 HTML5 local&remote validate

**五星提示：当前脚本未作优化、未完工，请勿用在生产环境**

__IT IS [A SPM PACKAGE](http://spmjs.io/package/jquery-validate).__





#USAGE
```
var $ = require('jquery');
require('jquery-validate')($);


// 普通 input:file
$('#form').validate();
```


#DOM ATTR

##表单各种属性参数设置
* 在脚本处理 type=email 或 url 等项目时，无法读取非法的数据，因此
* 需要将type修改为 text ，然后添加 data-type=email 或 ur


## input:text
## textarea
* 属性: required 必填项
* 属性: pattern 正则
* 属性: maxlength 最大长度
* 属性: data-msg{required,pattern,maxlength} 消息json字符串

## input:password
* 属性: required 必填项
* 属性: pattern 正则
* 属性: maxlength 最大长度
* 属性: data-equal 与之相等的表单项目id
* 属性: data-msg{required,pattern,maxlength,equal} 消息json字符串

## input:number
* 属性: required 必填项
* 属性: min 最小值
* 属性: max 最大值
* 属性: step 公倍数
* 属性: data-msg{required,min,max,step,type} 消息json字符串

## input:email
* input:url
* input:date
* input:datetime
* input:datetime-local
* input:time
* input:week
* 属性: required 必填项
* 属性: data-msg{required,type} 消息json字符串

## single select
* 属性: required 必选项
* 属性: data-placeholder 占位值，默认""
* 属性: data-msg{required} 消息json字符串

## multiple select
* 属性: data-placeholder 占位值，默认""
* 属性: data-least 必须最小数量，默认无限制
* 属性: data-most 必须最大数量，默认无限制
* 属性: data-msg{least,most} 消息json字符串

## input:checkbox
* 属性: data-least 必须最小数量，默认无限制
* 属性: data-most 必须最大数量，默认无限制
* 属性: data-msg{least,most} 消息json字符串

## input:radio
* 属性: required 必选项
* 属性: data-msg{required} 消息json字符串

##所有表单的ajax需要额外处理




#OPTIONS
```
$.fn.validate.defaults = {
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
```
