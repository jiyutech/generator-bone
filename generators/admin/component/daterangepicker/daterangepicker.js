'use strict';
var Vue = window.Vue;
var _ = window._;
var $ = window.$;

window.moment = require('moment');
moment.defineLocale('zh-cn', {
    months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
    monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
    weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
    weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
    weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
    longDateFormat : {
        LT : 'Ah点mm分',
        LTS : 'Ah点m分s秒',
        L : 'YYYY-MM-DD',
        LL : 'YYYY年MMMD日',
        LLL : 'YYYY年MMMD日Ah点mm分',
        LLLL : 'YYYY年MMMD日ddddAh点mm分',
        l : 'YYYY-MM-DD',
        ll : 'YYYY年MMMD日',
        lll : 'YYYY年MMMD日Ah点mm分',
        llll : 'YYYY年MMMD日ddddAh点mm分'
    },
    meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
    meridiemHour: function (hour, meridiem) {
        if (hour === 12) {
            hour = 0;
        }
        if (meridiem === '凌晨' || meridiem === '早上' ||
                meridiem === '上午') {
            return hour;
        } else if (meridiem === '下午' || meridiem === '晚上') {
            return hour + 12;
        } else {
            // '中午'
            return hour >= 11 ? hour : hour + 12;
        }
    },
    meridiem : function (hour, minute, isLower) {
        var hm = hour * 100 + minute;
        if (hm < 600) {
            return '凌晨';
        } else if (hm < 900) {
            return '早上';
        } else if (hm < 1130) {
            return '上午';
        } else if (hm < 1230) {
            return '中午';
        } else if (hm < 1800) {
            return '下午';
        } else {
            return '晚上';
        }
    },
    calendar : {
        sameDay : function () {
            return this.minutes() === 0 ? '[今天]Ah[点整]' : '[今天]LT';
        },
        nextDay : function () {
            return this.minutes() === 0 ? '[明天]Ah[点整]' : '[明天]LT';
        },
        lastDay : function () {
            return this.minutes() === 0 ? '[昨天]Ah[点整]' : '[昨天]LT';
        },
        nextWeek : function () {
            var startOfWeek, prefix;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';
            return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
        },
        lastWeek : function () {
            var startOfWeek, prefix;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() < startOfWeek.unix()  ? '[上]' : '[本]';
            return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
        },
        sameElse : 'LL'
    },
    ordinalParse: /\d{1,2}(日|月|周)/,
    ordinal : function (number, period) {
        switch (period) {
        case 'd':
        case 'D':
        case 'DDD':
            return number + '日';
        case 'M':
            return number + '月';
        case 'w':
        case 'W':
            return number + '周';
        default:
            return number;
        }
    },
    relativeTime : {
        future : '%s内',
        past : '%s前',
        s : '几秒',
        m : '1 分钟',
        mm : '%d 分钟',
        h : '1 小时',
        hh : '%d 小时',
        d : '1 天',
        dd : '%d 天',
        M : '1 个月',
        MM : '%d 个月',
        y : '1 年',
        yy : '%d 年'
    },
    week : {
        // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});
moment.locale('zh-cn');
// require('../../vendor/adminlte/plugins/jquery-ui.js');
require('../../vendor/adminlte/plugins/daterangepicker/daterangepicker.js');
require('../../vendor/adminlte/plugins/timepicker/bootstrap-timepicker.js');

module.exports = Vue.component( 'daterangepicker', {
  template: require('./daterangepicker.html'),
  replace: true,

  data: function(){
    return {
    };
  },
  props: [
    'null',
    'withTime',
    'timeIncrement',
    'start',
    'end',
    'fullMode',
  ],
  computed: {
    format: function(){
      return this.withTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
    }
  },
  methods: {
    setup: function(){
      $(this.$$.calendarBtn).daterangepicker({
        timePicker: this.withTime,
        timePicker12Hour: false,
        timePickerIncrement: this.timeIncrement || 30,
        format: 'YYYY-MM-DD HH:mm:ss',
        startDate: this.start || this.defStart,
        endDate: this.end || this.defEnd,
        locale: {
          applyLabel: '确定',
          cancelLabel: '取消',
          fromLabel: '开始',
          toLabel: '结束',
          weekLabel: '周',
          customRangeLabel: '自定义范围',
          daysOfWeek: moment.weekdaysMin(),
          monthNames: moment.monthsShort(),
          firstDay: moment.localeData()._week.dow
        }
      }).on('apply.daterangepicker', function(e, DateRangePicker){
        this.start = DateRangePicker.startDate.format(this.format);
        this.end = DateRangePicker.endDate.format(this.format);
      }.bind(this));
    }
  },
  beforeCompile: function(){
    var tmr = moment(Date.now());
    this.defStart = tmr.format( this.withTime ? 'YYYY-MM-DD 9:00:00' : 'YYYY-MM-DD' );
    this.defEnd = tmr.format( this.withTime ? 'YYYY-MM-DD 11:00:00' : 'YYYY-MM-DD' );
    if ( !this.null && ( !this.start || !this.end ) ) {
      this.start = this.defStart;
      this.end = this.defEnd;
    }
  },
  ready: function(){
    this.setup();
  },
  watch: {
    start: {
      handler: function(){
        this.setup();
      }
    },
    end: {
      handler: function(){
        this.setup();
      }
    }
  }
})
