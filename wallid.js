// http://jsfiddle.net/wfhLc11L/104/
(function(window, document, undefined) {
	"use strict";

	var self = {
			patterns: {
				email: {
					classname: 'email',
					regex: /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9_](?:[a-zA-Z0-9_\-](?!\.)){0,61}[a-zA-Z0-9_-]?\.)+[a-zA-Z0-9_](?:[a-zA-Z0-9_\-](?!$)){0,61}[a-zA-Z0-9_]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/g
				},
				noDigits: {
					classname: 'no-digits',
					regex: /^(\D)+$/ig
				},
				onlyDigits: {
					classname: 'only-digits',
					regex: /^([0-9]*)$/ig
				},
				notEmpty: {
					classname: 'not-empty',
					regex: /.+/ig
				}
			}
		},
		_ = {
			methods: {
				$setDirty: function() {
					_.setState.call(this, 'add', 'is-dirty', '$dirty', true);
				},
				$unsetDirty: function() {
					_.setState.call(this, 'remove', 'is-dirty', '$dirty', false);
				},
				$setValid: function() {
					_.setState.call(this, 'add', 'is-valid', '$valid', true);
				},
				$unsetValid: function() {
					_.setState.call(this, 'remove', 'is-valid', '$valid', false);
				},
				$setInvalid: function() {
					_.setState.call(this, 'add', 'is-invalid', '$invalid', true);
				},
				$unsetInvalid: function() {
					_.setState.call(this, 'remove', 'is-invalid', '$invalid', false);
				}
			},
			event: {
				'input': 'input',
                'textarea': 'input',
				'select': 'change',
                'radio': 'change',
                'checkbox': 'change'
			},
			states: {
				$dirty: false,
				$valid: false,
				$error: []
			},
			formStates: {
				$submitted: false,
				$required: []
			}
		};

	_.extendObject = function(out) {
		out = out || {};

		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i]) {
				continue;
			}

			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key)) {
					out[key] = arguments[i][key];
				}
			}
		}

		return out;
	};

	_.setState = function(classMethod, className, prop, bool) {
		if (prop && bool !== undefined) {
			this[prop] = bool;
		}

		this.classList[classMethod](className);
	};

	_.validatePattern = function(element, pattern, isRegex) {
		var errorIndex = element.$error.indexOf(pattern.classname),
			regex = isRegex ?
				new RegExp(pattern.regex) :
				document.forms[element.$form].elements[pattern.regex].value;

		if ((isRegex && regex.test(element.value) === true) ||
			element.value == regex) {
			// valid

			_.setState.call(element, 'add', 'is-valid-' + pattern.classname);
			_.setState.call(element, 'remove', 'is-invalid-' + pattern.classname);

			if (errorIndex !== undefined && errorIndex > -1) {
				element.$error.splice(errorIndex, 1);
			}
		} else {
			// invalid

			_.setState.call(element, 'add', 'is-invalid-' + pattern.classname);
			_.setState.call(element, 'remove', 'is-valid-' + pattern.classname);

			if (errorIndex < 0) {
				element.$error.push(pattern.classname);
			}
		}

		_.checkErrors(element);
	};
    
    _.validateRequired = function(element) {
        // todo: validation of radio/checkbox groups
        console.log('no pattern, but required');
        
        _.checkErrors(element);
    }

	_.checkErrors = function(element) {
		if (element.$error && element.$error.length) {
			element.$setInvalid();
			element.$unsetValid();
		} else {
			element.$setValid();
			element.$unsetInvalid();
		}
	};

	_.callValidator = function(event) {
		var element = event.target,
			elName = element.$name;

		if (element.readOnly) {
			return;
		}

		/*if (!document.forms[form].elements[elName].$dirty) {
			document.forms[form].elements[elName].$setDirty();
		}*/

		/*  if (element.minlength > 0) {
		  	_.validateLength(element);
		  }*/

		if (element.pattern) {

			if (self.patterns[element.pattern] !== undefined) {
				
				_.validatePattern(element, self.patterns[element.pattern], true);
				
			} else if (document.forms[element.$form].elements[element.pattern]) {
				
				_.validatePattern(element, {
					classname: document.forms[element.$form].elements[element.pattern].$name,
					regex: element.pattern
				});
				
			} else {

				_.validatePattern(element, {
					classname: 'custom-pattern',
					regex: element.pattern
				}, true);
				
			}
		} else {
			
			if (self.patterns[element.type] !== undefined) {
				
				_.validatePattern(element, self.patterns[element.type], true);
				
			}
            
            if (element.required) {
                _.validateRequired(element);
            }
			
		}
	};

	_.extendFormElements = function() {
		var forms = document.forms,
            event;

		for (var i = 0, len = forms.length; i < len; i += 1) {

			forms[i].$name = forms[i].name;

			for (var formState in _.formStates) {
				if (_.formStates.hasOwnProperty(formState)) {
					forms[i] = _.formStates[formState];
				}
			}

			for (var j = 0, lenElements = forms[i].elements.length; j < lenElements; j += 1) {
                console.dir(forms[i][forms[i].elements[j].name]);
				forms[i][forms[i].elements[j].name].$name = forms[i].elements[j].name;
                forms[i][forms[i].elements[j].name].$error = [];
				forms[i][forms[i].elements[j].name].$required = forms[i][forms[i].elements[j].name].required;
				forms[i][forms[i].elements[j].name].$form = forms[i].$name;
                
                if(forms[i].elements[j].tagName === 'INPUT') {
                 	if(forms[i].elements[j].type === 'radio' || forms[i].elements[j].type === 'checkbox') {
                        event = _.event[forms[i].elements[j].type];
                    } else {
                    	event = _.event[String.prototype.toLowerCase.call(forms[i].elements[j].tagName)];   
                    }
                }

				forms[i].elements[j].addEventListener(event, _.callValidator);

				for (var state in _.states) {
					if (_.states.hasOwnProperty(state)) {
						if (!forms[i][state]) {
							forms[i][state] = _.states[state];
						}
						forms[i][forms[i].elements[j].name][state] = _.states[state];
					}
				}

				for (var method in _.methods) {
					if (_.methods.hasOwnProperty(method)) {
						if (!forms[i][method]) {
							forms[i][method] = _.methods[method];
							forms[i][method].bind(forms[i]);
						}

						forms[i][forms[i].elements[j].name][method] = _.methods[method];
						forms[i][forms[i].elements[j].name][method].bind(forms[i][forms[i].elements[j].name]);
					}
				}
			}
		}
	};

	self.init = function(patterns) {
		self.patterns = _.extendObject(self.patterns, patterns);

		_.extendFormElements();
	};

	return self;
})(window, document).init();
