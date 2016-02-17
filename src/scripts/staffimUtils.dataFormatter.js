'use strict';
(function() {
    angular.module('staffimUtils')
        .factory('SUFormatterDate', function(moment) {
            return {
                formatter: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.format('YYYY-MM-DDT00:00:00.000') + 'Z';
                    }

                    return null;
                },
                parser: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.toDate();
                    }

                    return null;
                }
            };
        })
        .factory('SUFormatterDateTime', function(moment) {
            return {
                formatter: function(val) {
                    return val ? (moment(val).format('YYYY-MM-DDTHH:mm:ss') + 'Z') : null;
                },
                parser: function(val) {
                    return val ? moment(val).toDate() : null;
                }
            };
        })
        .factory('SUFormatterWeek', function(moment) {
            return {
                formatter: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.isoday(1).format('YYYY-MM-DDT00:00:00.000') + 'Z';
                    }

                    return null;
                },
                formatterEnd: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.isoday(7).format('YYYY-MM-DDT00:00:00.000') + 'Z';
                    }

                    return null;
                },
                parser: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.isoday(1).toDate();
                    }

                    return null;
                }
            };
        });
})();
