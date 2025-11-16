import { IsString, IsOptional, IsPhoneNumber, MaxLength, IsUrl } from 'class-validator';

/**
 * DTO (Data Transfer Object) cho việc cập nhật thông tin user.
 * Chúng ta dùng class-validator để đảm bảo client chỉ gửi
 * đúng các trường và đúng định dạng.
 */
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  /**
   * Ví dụ: Validate số điện thoại theo chuẩn VN
   * (Bạn có thể đổi 'VN' thành null nếu không cần)
   */
  @IsPhoneNumber('VN') 
  @IsOptional()
  phoneNumber?: string;
  
  @IsUrl()
  @IsOptional()
  photoURL?: string;
}