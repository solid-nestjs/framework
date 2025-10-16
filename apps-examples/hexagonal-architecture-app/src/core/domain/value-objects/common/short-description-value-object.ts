import { DescriptionValueObject } from '../primitives/description-value-object';
import { DomainValidationService } from '../../services';

export class ShortDescriptionValueObject extends DescriptionValueObject {
  private static readonly validationService = new DomainValidationService();

  constructor(value?: string) {
    super(value);
    ShortDescriptionValueObject.validationService.validateStringWithLength(
      value,
      'value',
      'ShortDescriptionValueObject',
      2,
      500
    );
  }

  static create(value?: string): ShortDescriptionValueObject {
    return new ShortDescriptionValueObject(value);
  }

  static empty(): ShortDescriptionValueObject {
    return new ShortDescriptionValueObject();
  }
}
