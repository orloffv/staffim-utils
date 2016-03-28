'use strict';
(function() {
    moment.durationSeconds = function(seconds) {
        return moment.duration(seconds, 'seconds').format('h [час], m [мин], s [сек]');
    };
})();
