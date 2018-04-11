const REGEX_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //eslint-disable-line
const REGEX_RATE = /^\$?[0-9]+(\.[0-9][0-9])?$/;

const validator = {
  isValidId(id) {
    return !isNaN(id);
  },
  isValidString(str, len) {
    if (!str || str.length === 0 || typeof str !== 'string') return false;
    if (len && str.length < len) return false;
    return true;
  },
  isValidEmail(email) {
    if (!email) return false;
    return REGEX_EMAIL.test(String(email.trim()).toLowerCase());
  },
  isValidPassword(name) {
    // Check if the value is greater or equal to 5 characters
    return (name.length >= 6);
  },
  isValidEmailHash(id) {
    return (id.length === 40);
  },
  isValidEpoch(_time) {
    let time = _time;
    if (String.valueOf(time).length <= 10) {
      time *= 1000;
    }

    const startEpoch = (new Date(time)).getTime();
    if (startEpoch === undefined || isNaN(startEpoch) || startEpoch < 1) {
      return false;
    }
    return time;
  },
  isValidRate(rate) {
    if (REGEX_RATE.test(rate.toString())) {
      return true;
    }

    return false;
  }
};

module.exports = validator;
