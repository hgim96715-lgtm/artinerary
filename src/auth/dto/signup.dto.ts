import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @Matches(/^[가-힣a-zA-Z0-9_]+$/, {
    message: '닉네임은 한글·영문·숫자·밑줄만 사용할 수 있습니다.',
  })
  nickname: string;
}
