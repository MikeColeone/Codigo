import type { UploadType } from '@codigo/share';
import type { IResources } from '@codigo/share';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'resources' })
export class Resources implements IResources {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  url: string = '';

  @Column()
  account_id: number = 0;

  @Column()
  type: UploadType = 'image';

  @Column()
  name: string = '';
}
