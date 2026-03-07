import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomTool {
  /**
   * @description: 生成随机字符串
   */

  randomCode(): number {
    return Math.floor(Math.random() * (9999 - 1000)) + 1000;
  }

  // to-do: 生成随机图像
  randomImage() {
    return 'https://c-ssl.dtstatic.com/uploads/item/202003/18/20200318091411_bopif.thumb.400_0.jpg';
  }

  // 生成随机昵称
  randomNickName(): string {
    const adjectives = ['快乐的', '聪明的', '勇敢的', '善良的'];
    const nouns = ['小猫', '小狗', '小熊', '小兔'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}${noun}`;
  }
}
