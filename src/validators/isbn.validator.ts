import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const isISBN = require('is-isbn');

export function IsValidIsbn(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: 'isValidIsbn',
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && isISBN.validate(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid ISBN-10 or ISBN-13`;
        },
      },
    });
  };
}
