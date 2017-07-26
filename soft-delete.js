'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

var _utils = require('loopback/lib/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt,
      deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt,
      _ref$scrub = _ref.scrub,
      scrub = _ref$scrub === undefined ? false : _ref$scrub;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, scrub: scrub });

  var properties = Model.definition.properties;
  var idName = Model.dataSource.idName(Model.modelName);

  var scrubbed = {};
  if (scrub !== false) {
    var propertiesToScrub = scrub;
    if (!Array.isArray(propertiesToScrub)) {
      propertiesToScrub = (0, _keys2.default)(properties).filter(function (prop) {
        return !properties[prop][idName] && prop !== deletedAt;
      });
    }
    scrubbed = propertiesToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, { type: Date, required: false });

  Model.destroyAll = function softDestroyAll(where, cb) {
    cb = cb || (0, _utils.createPromiseCallback)();

    Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return cb(null, result);
    }).catch(function (error) {
      return cb(error);
    });

    return cb.promise;
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    cb = cb || (0, _utils.createPromiseCallback)();

    Model.updateAll((0, _defineProperty3.default)({}, idName, id), (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return cb(null, result);
    }).catch(function (error) {
      return cb(error);
    });

    return cb.promise;
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    cb = cb === undefined && typeof options === 'function' ? options : cb;
    cb = cb || (0, _utils.createPromiseCallback)();

    this.updateAttributes((0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return cb(null, result);
    }).catch(function (error) {
      return cb(error);
    });

    return cb.promise;
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = (0, _defineProperty3.default)({}, deletedAt, null);

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvZnQtZGVsZXRlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiTW9kZWwiLCJkZWxldGVkQXQiLCJzY3J1YiIsIm1vZGVsTmFtZSIsInByb3BlcnRpZXMiLCJkZWZpbml0aW9uIiwiaWROYW1lIiwiZGF0YVNvdXJjZSIsInNjcnViYmVkIiwicHJvcGVydGllc1RvU2NydWIiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJwcm9wIiwicmVkdWNlIiwib2JqIiwiZGVmaW5lUHJvcGVydHkiLCJ0eXBlIiwiRGF0ZSIsInJlcXVpcmVkIiwiZGVzdHJveUFsbCIsInNvZnREZXN0cm95QWxsIiwid2hlcmUiLCJjYiIsInVwZGF0ZUFsbCIsInRoZW4iLCJyZXN1bHQiLCJjYXRjaCIsImVycm9yIiwicHJvbWlzZSIsInJlbW92ZSIsImRlbGV0ZUFsbCIsImRlc3Ryb3lCeUlkIiwic29mdERlc3Ryb3lCeUlkIiwiaWQiLCJyZW1vdmVCeUlkIiwiZGVsZXRlQnlJZCIsInByb3RvdHlwZSIsImRlc3Ryb3kiLCJzb2Z0RGVzdHJveSIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJ1cGRhdGVBdHRyaWJ1dGVzIiwiZGVsZXRlIiwicXVlcnlOb25EZWxldGVkIiwiX2ZpbmRPckNyZWF0ZSIsImZpbmRPckNyZWF0ZSIsImZpbmRPckNyZWF0ZURlbGV0ZWQiLCJxdWVyeSIsImRlbGV0ZWQiLCJsZW5ndGgiLCJhbmQiLCJyZXN0IiwiY2FsbCIsIl9maW5kIiwiZmluZCIsImZpbmREZWxldGVkIiwiX2NvdW50IiwiY291bnQiLCJjb3VudERlbGV0ZWQiLCJ3aGVyZU5vdERlbGV0ZWQiLCJfdXBkYXRlIiwidXBkYXRlIiwidXBkYXRlRGVsZXRlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFHQTs7OztBQUZBLElBQU1BLFFBQVEsc0JBQWQ7O2tCQUllLFVBQUNDLEtBQUQsUUFBdUQ7QUFBQSw0QkFBN0NDLFNBQTZDO0FBQUEsTUFBN0NBLFNBQTZDLGtD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LFFBQXJCekMsS0FBcUIsdUVBQWIsRUFBYTs7QUFDM0U7QUFDQSxRQUFJc0Msd0JBQUo7QUFDQSxRQUFJLENBQUN0QyxLQUFELElBQVUsb0JBQVlBLEtBQVosRUFBbUI0QixNQUFuQixLQUE4QixDQUE1QyxFQUErQztBQUM3Q1Usd0JBQWtCaEIsZUFBbEI7QUFDRCxLQUZELE1BRU87QUFDTGdCLHdCQUFrQixFQUFFVCxLQUFLLENBQUU3QixLQUFGLEVBQVNzQixlQUFULENBQVAsRUFBbEI7QUFDRDs7QUFQMEUsdUNBQU5RLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQVEzRSxXQUFPUyxRQUFRUixJQUFSLGlCQUFhckQsS0FBYixFQUFvQjRELGVBQXBCLFNBQXdDUixJQUF4QyxFQUFQO0FBQ0QsR0FURDtBQVVELEMiLCJmaWxlIjoic29mdC1kZWxldGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgX2RlYnVnIGZyb20gJy4vZGVidWcnO1xuY29uc3QgZGVidWcgPSBfZGVidWcoKTtcblxuaW1wb3J0IHsgY3JlYXRlUHJvbWlzZUNhbGxiYWNrIH0gZnJvbSAnbG9vcGJhY2svbGliL3V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAoTW9kZWwsIHsgZGVsZXRlZEF0ID0gJ2RlbGV0ZWRBdCcsIHNjcnViID0gZmFsc2UgfSkgPT4ge1xuICBkZWJ1ZygnU29mdERlbGV0ZSBtaXhpbiBmb3IgTW9kZWwgJXMnLCBNb2RlbC5tb2RlbE5hbWUpO1xuXG4gIGRlYnVnKCdvcHRpb25zJywgeyBkZWxldGVkQXQsIHNjcnViIH0pO1xuXG4gIGNvbnN0IHByb3BlcnRpZXMgPSBNb2RlbC5kZWZpbml0aW9uLnByb3BlcnRpZXM7XG4gIGNvbnN0IGlkTmFtZSA9IE1vZGVsLmRhdGFTb3VyY2UuaWROYW1lKE1vZGVsLm1vZGVsTmFtZSk7XG5cbiAgbGV0IHNjcnViYmVkID0ge307XG4gIGlmIChzY3J1YiAhPT0gZmFsc2UpIHtcbiAgICBsZXQgcHJvcGVydGllc1RvU2NydWIgPSBzY3J1YjtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvcGVydGllc1RvU2NydWIpKSB7XG4gICAgICBwcm9wZXJ0aWVzVG9TY3J1YiA9IE9iamVjdC5rZXlzKHByb3BlcnRpZXMpXG4gICAgICAgIC5maWx0ZXIocHJvcCA9PiAhcHJvcGVydGllc1twcm9wXVtpZE5hbWVdICYmIHByb3AgIT09IGRlbGV0ZWRBdCk7XG4gICAgfVxuICAgIHNjcnViYmVkID0gcHJvcGVydGllc1RvU2NydWIucmVkdWNlKChvYmosIHByb3ApID0+ICh7IC4uLm9iaiwgW3Byb3BdOiBudWxsIH0pLCB7fSk7XG4gIH1cblxuICBNb2RlbC5kZWZpbmVQcm9wZXJ0eShkZWxldGVkQXQsIHt0eXBlOiBEYXRlLCByZXF1aXJlZDogZmFsc2V9KTtcblxuICBNb2RlbC5kZXN0cm95QWxsID0gZnVuY3Rpb24gc29mdERlc3Ryb3lBbGwod2hlcmUsIGNiKSB7XG4gICAgY2IgPSBjYiB8fCBjcmVhdGVQcm9taXNlQ2FsbGJhY2soKVxuXG4gICAgTW9kZWwudXBkYXRlQWxsKHdoZXJlLCB7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+IGNiKG51bGwsIHJlc3VsdCkpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gY2IoZXJyb3IpKTtcblxuICAgIHJldHVybiBjYi5wcm9taXNlXG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlID0gTW9kZWwuZGVzdHJveUFsbDtcbiAgTW9kZWwuZGVsZXRlQWxsID0gTW9kZWwuZGVzdHJveUFsbDtcblxuICBNb2RlbC5kZXN0cm95QnlJZCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QnlJZChpZCwgY2IpIHtcbiAgICBjYiA9IGNiIHx8IGNyZWF0ZVByb21pc2VDYWxsYmFjaygpXG5cbiAgICBNb2RlbC51cGRhdGVBbGwoeyBbaWROYW1lXTogaWQgfSwgeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCl9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+IGNiKG51bGwsIHJlc3VsdCkpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gY2IoZXJyb3IpKTtcblxuICAgIHJldHVybiBjYi5wcm9taXNlXG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuICBNb2RlbC5kZWxldGVCeUlkID0gTW9kZWwuZGVzdHJveUJ5SWQ7XG5cbiAgTW9kZWwucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBzb2Z0RGVzdHJveShvcHRpb25zLCBjYikge1xuICAgIGNiID0gKGNiID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpID8gb3B0aW9ucyA6IGNiO1xuICAgIGNiID0gY2IgfHwgY3JlYXRlUHJvbWlzZUNhbGxiYWNrKClcblxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyh7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+IGNiKG51bGwsIHJlc3VsdCkpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gY2IoZXJyb3IpKTtcblxuICAgIHJldHVybiBjYi5wcm9taXNlXG4gIH07XG5cbiAgTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuICBNb2RlbC5wcm90b3R5cGUuZGVsZXRlID0gTW9kZWwucHJvdG90eXBlLmRlc3Ryb3k7XG5cbiAgLy8gRW11bGF0ZSBkZWZhdWx0IHNjb3BlIGJ1dCB3aXRoIG1vcmUgZmxleGliaWxpdHkuXG4gIGNvbnN0IHF1ZXJ5Tm9uRGVsZXRlZCA9IHtbZGVsZXRlZEF0XTogbnVsbH07XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZE9yQ3JlYXRlLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfZmluZCA9IE1vZGVsLmZpbmQ7XG4gIE1vZGVsLmZpbmQgPSBmdW5jdGlvbiBmaW5kRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZC5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX2NvdW50ID0gTW9kZWwuY291bnQ7XG4gIE1vZGVsLmNvdW50ID0gZnVuY3Rpb24gY291bnREZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIGNvdW50IG9ubHkgcmVjZWl2ZXMgYSAnd2hlcmUnLCB0aGVyZSdzIG5vd2hlcmUgdG8gYXNrIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBsZXQgd2hlcmVOb3REZWxldGVkO1xuICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0gcXVlcnlOb25EZWxldGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICB9XG4gICAgcmV0dXJuIF9jb3VudC5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF91cGRhdGUgPSBNb2RlbC51cGRhdGU7XG4gIE1vZGVsLnVwZGF0ZSA9IE1vZGVsLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uIHVwZGF0ZURlbGV0ZWQod2hlcmUgPSB7fSwgLi4ucmVzdCkge1xuICAgIC8vIEJlY2F1c2UgdXBkYXRlL3VwZGF0ZUFsbCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdGhlcmUncyBub3doZXJlIHRvIGFzayBmb3IgdGhlIGRlbGV0ZWQgZW50aXRpZXMuXG4gICAgbGV0IHdoZXJlTm90RGVsZXRlZDtcbiAgICBpZiAoIXdoZXJlIHx8IE9iamVjdC5rZXlzKHdoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHdoZXJlTm90RGVsZXRlZCA9IHF1ZXJ5Tm9uRGVsZXRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0geyBhbmQ6IFsgd2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZCBdIH07XG4gICAgfVxuICAgIHJldHVybiBfdXBkYXRlLmNhbGwoTW9kZWwsIHdoZXJlTm90RGVsZXRlZCwgLi4ucmVzdCk7XG4gIH07XG59O1xuIl19
