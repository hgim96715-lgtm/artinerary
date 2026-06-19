import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateNicknameDto {
  @IsString()
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  @MaxLength(10, { message: '닉네임은 10자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9_]+$/, {
    message: '닉네임은 한글·영문·숫자·밑줄만 사용할 수 있습니다.',
  })
  nickname: string;
}
