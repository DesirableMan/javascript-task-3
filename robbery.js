"use strict";

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
const isStar = true;

const days = ["ПН", "ВТ", "СР"];

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
function getAppropriateMoment(schedule, duration, workingHours) {
    console.info(schedule, duration, workingHours);

    const timeObject = parseTime(workingHours.to);
    const bankTimeZone = timeObject.timezone;
    const workingMinutes = getWorkingMinutes(workingHours);
    const scheduleMinutes = getScheduleMinutes(schedule, bankTimeZone);
    const robberyTime = getRobberyTime(
        scheduleMinutes,
        duration,
        workingMinutes
    );

    return {
        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            return robberyTime.length > 0;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например, "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            if (this.exists()) {
                return formatDate(robberyTime[0], template);
            }
            return `""`;
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            if (robberyTime.length > 1) {
                robberyTime.shift();

                return true;
            }
            return false;
        },
    };
}

/**
 * @param {String} time - принимает строку расписания
 * @returns {Object} - возвращает объект, значения Number
 */
function parseTime(time) {
    let [, day, hours, minutes, timezone] = time.match(
        /([А-Я]{2})? ?(\d{2}):(\d{2})\+(\d)/
    );
    return {
        day: day ? days.indexOf(day) : 0,
        hours: Number(hours),
        minutes: Number(minutes),
        timezone: Number(timezone),
    };
}

/**
 * @param {Object} workingHours – принимает время работы банка в часах
 * @returns {Object} - возвращает время работы банка в минутах с понедельника по среду
 */
function getWorkingMinutes(workingHours) {
    let itemFrom = parseTime(workingHours.from);
    itemFrom = itemFrom.hours * 60 + itemFrom.minutes;
    let itemTo = parseTime(workingHours.to);
    itemTo = itemTo.hours * 60 + itemTo.minutes;
    let minutesDayOne = days.indexOf("ПН") * (24 * 60);
    let minutesDayTwo = days.indexOf("ВТ") * (24 * 60);
    let minutesDayThree = days.indexOf("СР") * (24 * 60);

    return [
        { from: itemFrom + minutesDayOne, to: itemTo + minutesDayOne },
        { from: itemFrom + minutesDayTwo, to: itemTo + minutesDayTwo },
        { from: itemFrom + minutesDayThree, to: itemTo + minutesDayThree },
    ];
}

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} bankTimeZone - Часовой пояс банка
 * @returns {Object} - возвращает расписание банды в минутах в зависимости от часового пояса банка
 */
function getScheduleMinutes(schedule, bankTimeZone) {
    let scheduleMinutes = {};
    Object.keys(schedule).forEach((person) => {
        scheduleMinutes[person] = [];
        schedule[person].forEach((item) => {
            let itemOne = parseTime(item.from);
            itemOne =
                itemOne.day * (24 * 60) +
                (itemOne.hours * 60 + itemOne.minutes) +
                (bankTimeZone - itemOne.timezone) * 60;
            let itemTwo = parseTime(item.to);
            itemTwo =
                itemTwo.day * (24 * 60) +
                (itemTwo.hours * 60 + itemTwo.minutes) +
                (bankTimeZone - itemTwo.timezone) * 60;

            scheduleMinutes[person].push({
                from: itemOne,
                to: itemTwo,
            });
        });
    });
    return scheduleMinutes;
}

/**
 * @param {Object} schedule -принимает на вход расписание банды в минутах в зависимости от часового пояса банка
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingMinutes  - принимает на вход время работы банка в минутах с понедельника по среду
 * @returns {Array} - возвращает массив дат возможного ограбления в минутах
 */
function getRobberyTime(schedule, duration, workingMinutes) {
    function checkTime(time, start, duration) {
        return (
            (time.from < start && start < time.to) ||
            (time.from < start + duration && start + duration < time.to) ||
            (time.from > start && time.from < start + duration)
        );
    }

    const robberyTime = [];
    const keys = Object.keys(schedule);
    for (
        let i = workingMinutes[0].from;
        i <= workingMinutes[workingMinutes.length - 1].to;

    ) {
        if (
            keys.some((key) =>
                schedule[key].some((time) => checkTime(time, i, duration))
            ) ||
            workingMinutes.every(
                (time) => i < time.from || time.to < i + duration
            )
        ) {
            i++;
            continue;
        }
        if (
            robberyTime.length === 0 ||
            i - robberyTime[robberyTime.length - 1] >= 30
        ) {
            robberyTime.push(i);
        }
        i++;
    }

    return robberyTime;
}

/**
 * @param {Number} customDate - принимает на вход дату ограбления в минутах
 * @param {String} template - принимает на вход строку Например, "Начинаем в %HH:%MM (%DD)"
 * @returns {String} - возвращает строку "Начинаем в 14:59 (СР)"
 */
function formatDate(customDate, template) {
    const formatTime = (number) =>
        number.toString().length === 1 ? `0${number}` : number;
    const day = days[Math.floor(customDate / (60 * 24))];
    const hours = Math.floor((customDate / 60) % 24);
    let minutes = customDate % 60;

    return template
        .replace("%HH", formatTime(hours))
        .replace("%MM", formatTime(minutes))
        .replace("%DD", day);
}

module.exports = {
    getAppropriateMoment,

    isStar,
};
