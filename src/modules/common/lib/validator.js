import { isPresent } from '@common/utils/type';

const removeSpecialCharacter = (value) => value.replace(/-|\(| |\)/g, '');

const REQUIRED_MESSAGE = 'This field is required.';

export const INBUILT_FIELD_TYPES = {
  // Specify field type as `email`
  email: {
    // Pattern against which field should be tested
    isValid: (value) => {
      // eslint-disable-next-line max-len
      const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return emailPattern.test(value) && !value.includes('*');
    },
    message: 'Enter a valid email id.(Ex: example@test.com)',
  },
  // Specify field type as `lenghtMax:<max>`
  lengthMax: {
    // Function which tests if field value is valid
    // Additional arguments can be passed to a field type after `:`
    // and separating arguments by `,`
    //
    // Example: In this case `lengthMax` field needs a max value which
    // can be passed in this way: `lengthMax:10`.
    // `10` will be passed to isValid function as arg[0]
    isValid: (value, ...args) => value.length <= parseInt(args[0], 10),
    message: 'Should not be more than {{0}} characters.',
  },
  // Specify field type as `lenghtMin:<min>`
  lengthMin: {
    isValid: (value, ...args) => value.length >= parseInt(args[0], 10),
    message: 'Should be atleast {{0}} characters.',
  },
  // Specify field type as `lenghtRange:<min>,<max>`
  lengthRange: {
    isValid: (value, ...args) => (
      value.length >= parseInt(args[0], 10)
      && value.length <= parseInt(args[1], 10)
    ),
    message: 'Should be between {{0}} and {{1}} characters length.',
  },
  // Specify field type as `mobile`
  mobile: {
    // Temporary phone number validation logic
    isValid: (value) => {
      if (value.includes('-')) {
        const [countryCode, ...numbers] = value.split('-');
        const number = numbers.join('');
        if (countryCode === '+91') {
          return /^[6-9]\d{9}$/.test(number);
        } else if (countryCode === '+1') {
          // eslint-disable-next-line max-len
          return /^\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/.test(removeSpecialCharacter(number));
        } else {
          return /^[1-9][\d]{5,14}$/.test(number);
        }
      } else {
        return /^[\d]{6,15}$/.test(value.split(' ').join(''));
      }
    },
    message: 'Enter a valid phone number. '
      + 'Do not include leading 0 or country code',
  },
  // Specify field type as `number`
  number: {
    isValid: (value) => !Number.isNaN(parseFloat(value)),
    message: 'Enter a valid number',
  },
  // Specify field type as `number:1,100`
  numberRange: {
    isValid: (value, ...args) => {
      const parsedNumber = parseFloat(value);

      if (Number.isNaN(parsedNumber)) return false;

      return (
        parsedNumber >= parseFloat(args[0])
        && parsedNumber <= parseFloat(args[1])
      );
    },
    message: 'Should be greater than {{0}} and less than {{1}}.',
  },
  // Specify field type as `required`
  required: {
    isValid: (value) => isPresent(value),
    message: 'Cannot be empty',
  },
  // Specify field type as `startsWith:<str-to-start-with>`
  startsWith: {
    isValid: (value, ...args) => (
      typeof value === 'string'
      && value.startsWith(args[0])
    ),
    message: 'Invalid input.',
  },
  // Specify field type as `pan`
  pan: {
    isValid: (value) => {
      const panNumberPattern = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
      return panNumberPattern.test(value);
    },
    message: 'Enter a valid pan number.(Ex: BNZAA2318J)',
  },
};

/**
 * A generic `Validator` class to easily validate form data by just passing
 * schema.
 *
 * ## Defining schema for validation
 * Lets consider a sign up form with fields listed below
 * (in bracketts is the name of field in the form):
 * 1. Email (email),
 * 2, Mobile (phone_number),
 * 3. Username (name),
 * 4. Password (password),
 *
 * Then schema can be defined in below format
 * ```
 * {
 *     email: 'email',
 *     phone_number: 'mobile',
 *
 *     // To understand what the data after `:` means see the field type
 *     // definition in `INBUILT_FIELD_TYPES`
 *     password: 'lengthRange:8,16',
 *     name: 'lengthMin:6'
 * }
 * ```
 *
 * By default all fields are required, if you have to make a field optional
 * then it can be done in below way
 * ```
 * {
 *     name: {
 *         type: 'lengthMin:6',
 *         required: false,
 *         // If you need a custom error message then it can be added here
 *         // or else default message for the field type will be used
 *         message: 'A custom error message.'
 *     }
 * }
 * ```
 *
 * If you have some custom validation requirement then it can be handled in
 * two ways.
 * 1. If you think the validation requirement is common and similar requirement
 *    may arise in multiple scenarios, then just add a new field type to
 *    `INBUILD_FIELD_TYPES`. Follow the documentation written on top of it to
 *    understand how you can add new field types.
 * 2. Other way is explicity defining a validator function/pattern for your
 *    field along with it in the schema itself. See below example for more
 *    clarity
 *    ```
 *    {
 *        // Lets say we want to allow only lowercase letters with
 *        // underscores for name
 *        name: {
 *            required: true,
 *
 *            // You can specify a function in `isValid` key
 *            isValid: (value) => /^[a-b_]+[a-b]$/.test(value),
 *
 *            // Or also by specific the regex pattern it should match
 *            pattern: /^[a-b_]+[a-b]$/,
 *
 *            message: 'Error message that should be displayed'
 *        }
 *    }
 *    ```
 *
 * Sometimes a field might be required on conditional basis in such cases
 * you would want to control the logic of that using isValid function. You
 * can do that by using `skipRequiredCheck` flag for the respecitve field
 *
 * ```
 * {
 *     name: {
 *         type: 'lengthMin:6',
 *         skipRequiredCheck: true,
 *         isValid: (value) => {
 *             // Some custom logic
 *         }
 *     }
 * }
 * ```
 *
 * ## Usage
 *
 * ```
 *     // Create validator instance by passing a schema
 *     const validator = new Validator(schema);
 *
 *     // When you need to validate fields of the form then pass fields of the
 *     // form as a json to the `check` method of the instance.
 *     const errors = validator.check(data);
 *     // Above method call returns `null` if there are no errors else it
 *     // returns a json with errors of fields
 *
 *     // `check` method also takes `options` parameter which is optional
 *     const errors = validate.check(data, { validateOnlyIfPresent: true })
 *     // Above method call will validate only the fields whose value is
 *     // not one of [null, undefined, '']
 * ```
 */
class Validator {
  constructor(schema) {
    this._schema = schema;
    this._init();
  }

  check(data, options = {}) {
    const { validateOnlyIfPresent } = options;
    const errors = {};

    Object.keys(data).forEach(key => {
      const value = data[key];
      if (validateOnlyIfPresent && !isPresent(value)) return;

      const error = this._getError(key, value);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      return errors;
    } else {
      return null;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _createValidatorFn({ isValid, pattern }, throwCreationFailError = false) {
    if (pattern) {
      return (value) => pattern.test(value);
    } else if (isValid) {
      return isValid;
    } else if (throwCreationFailError) {
      throw new Error(
        `Field schema needs one of these to be defined: `
        + `a valid field type from 'INBUILT_FIELD_TYPES' or `
        + `a valid regex pattern to match field against or a valid 'isValid'`
        + `function`,
      );
    } else {
      return null;
    }
  }

  _generateFullSchema(fieldSchema) {
    return {
      args: this._getFieldArgs(fieldSchema),
      isValid: this._getValidatorFn(fieldSchema),
      message: this._resolveMessage(fieldSchema),
      required: this._getRequired(fieldSchema),
      skipRequiredCheck: this._getSkipRequiredCheck(fieldSchema),
    };
  }

  _init() {
    this._fullSchema = {};

    Object.keys(this._schema).forEach(field => {
      this._fullSchema[field] = this._generateFullSchema(this._schema[field]);
    });
  }

  _getFieldArgs(fieldSchema) {
    const rawFieldType = this._getRawFieldType(fieldSchema);
    if (rawFieldType) {
      const argsString = rawFieldType.split(':')[1];
      if (argsString) {
        return argsString.split(',');
      }
    }

    return [];
  }

  _getFieldType(fieldSchema) {
    const rawFieldType = this._getRawFieldType(fieldSchema);
    if (rawFieldType) {
      return rawFieldType.split(':')[0];
    }

    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  _getRawFieldType(fieldSchema) {
    if (typeof fieldSchema === 'string') {
      return fieldSchema;
    } else if (isPresent(fieldSchema.type)) {
      return fieldSchema.type;
    }

    return null;
  }

  _getValidatorFn(fieldSchema) {
    const fieldType = this._getFieldType(fieldSchema);
    if (fieldType) {
      const validatorFn = this._createValidatorFn(
        INBUILT_FIELD_TYPES[fieldType],
      );
      if (validatorFn) {
        return validatorFn;
      }
    } else {
      return this._createValidatorFn(fieldSchema, true);
    }

    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  _getRequired(fieldSchema) {
    if (typeof fieldSchema !== 'string' && isPresent(fieldSchema.required)) {
      return fieldSchema.required;
    } else {
      return true;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _getSkipRequiredCheck(fieldSchema) {
    if (typeof fieldSchema !== 'string') {
      return Boolean(fieldSchema.skipRequiredCheck);
    } else {
      return false;
    }
  }

  _resolveMessage(fieldSchema) {
    const fieldType = this._getFieldType(fieldSchema);
    const fieldArgs = this._getFieldArgs(fieldSchema);
    // Highest priority to message specified in schema
    let resolvedMessage = fieldSchema.message || '';
    if (!resolvedMessage && fieldType) {
      resolvedMessage = INBUILT_FIELD_TYPES[fieldType].message;
    }

    fieldArgs.forEach((fieldArg, index) => {
      // Mimics `replaceAll`
      resolvedMessage = resolvedMessage.split(`{{${index}}}`).join(fieldArg);
    });

    return resolvedMessage;
  }

  _getError(key, value) {
    const fieldSchema = this._fullSchema[key];
    if (!fieldSchema) return null;

    const {
      args, isValid, message, required, skipRequiredCheck,
    } = fieldSchema;
    const present = isPresent(value);
    if (skipRequiredCheck) {
      if (!isValid(value, ...args)) {
        return message;
      }
    } else if (required && !present) {
      return REQUIRED_MESSAGE;
    } else if (present && !isValid(value, ...args)) {
      return message;
    }

    return null;
  }
}

export default Validator;
