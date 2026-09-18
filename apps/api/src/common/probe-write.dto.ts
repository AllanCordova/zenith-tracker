import { IsString } from 'class-validator';

export class ProbeWriteDto {
  @IsString()
  name!: string;
}
