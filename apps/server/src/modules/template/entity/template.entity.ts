import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type {
  PageCategory,
  PageLayoutMode,
  TemplateDeviceType,
  TemplatePreset,
} from '@codigo/schema';

@Entity({ name: 'template' })
export class Template {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ unique: true })
  key: string = '';

  @Column()
  name: string = '';

  @Column({ type: 'text' })
  desc: string = '';

  @Column({ type: 'simple-json' })
  tags: string[] = [];

  @Column()
  page_title: string = '';

  @Column({ type: 'varchar', length: 20 })
  page_category: PageCategory = 'admin';

  @Column({ type: 'varchar', length: 20 })
  layout_mode: PageLayoutMode = 'absolute';

  @Column({ type: 'varchar', length: 20 })
  device_type: TemplateDeviceType = 'pc';

  @Column({ type: 'int' })
  canvas_width: number = 1280;

  @Column({ type: 'int' })
  canvas_height: number = 900;

  @Column()
  active_page_path: string = '/';

  @Column({ type: 'int', default: 0 })
  pages_count: number = 0;

  @Column({ type: 'varchar', nullable: true })
  cover_url: string | null = null;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status: 'draft' | 'published' | 'archived' = 'published';

  @Column({ type: 'int', default: 1 })
  version: number = 1;

  @Column({ type: 'simple-json' })
  preset: TemplatePreset = {} as TemplatePreset;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}

