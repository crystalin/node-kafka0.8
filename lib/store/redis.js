'use strict'

var redis = require('redis');
var util = require('util');
var EventEmitter = require('events').EventEmitter;


var redisStore = function(options) {
	this.options = options || {};
	this.host = this.options.host || 'localhost';
	this.port = this.options.port || 6379;
	this.prefix = this.options.prefix || 'kafka-node'
	this.delimiter = this.options.delimiter || ':'
}

util.inherits(redisStore, EventEmitter)

redisStore.prototype.init = function() {
	var self = this;
	this.store = redis.createClient(this.port, this.host, this.options);

	this.store.on('error', function(err) {
		
	})

	this.store.on('ready', function() {
		self.emit('ready');
	});

}

redisStore.prototype.fetchOffset = function(groupId, topic, partitionId, callback) {
	var key = this.prefix + this.delimiter + groupId + this.delimiter + topic + this.delimiter + partitionId;
	this.store.get(key, function(err, reply) {
		var index = parseInt(reply);
		if (isNaN(index)) {
			index = 0;
		}
 		callback && callback(index);
	});
}

redisStore.prototype.commitOffset = function(groupId, topic, partitionId, offset, callback) {
	var key = this.prefix + this.delimiter + groupId + this.delimiter + topic + this.delimiter + partitionId;
	this.store.watch(key);
	this.store
			.multi()
			.set(key, offset)
			.exec(function(err, reply) {
				callback && callback(err);
			});
}

redisStore.prototype.cleanup = function() {
	this.store.quit();
}

module.exports = redisStore;
