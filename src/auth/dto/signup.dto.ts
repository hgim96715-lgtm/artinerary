import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  @MaxLength(10, { message: '닉네임은 10자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9_]+$/, {
    message: '닉네임은 한글·영문·숫자·밑줄만 사용할 수 있습니다.',
  })
  nickname: string;
}
