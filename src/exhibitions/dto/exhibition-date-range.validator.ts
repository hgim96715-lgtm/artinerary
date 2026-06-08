import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ExhibitionDateRangeConstraint', async: false })
export class ExhibitionDateRangeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const { startDate, endDate } = args.object as {
      startDate?: Date;
      endDate?: Date;
    };
    if (!startDate || !endDate) {
      return true;
    }
    const startValid =
      startDate instanceof Date && !Number.isNaN(startDate.getTime());
    const endValid =
      endDate instanceof Date && !Number.isNaN(endDate.getTime());
    if (!startValid || !endValid) {
      return false;
    }
    return endDate >= startDate;
  }
  defaultMessage() {
    return '종료일은 시작일보다 이후여야 합니다. 다시 확인해주세요.';
  }
}
