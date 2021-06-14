const IMG_MIMETYPE = ['png', 'jpg', 'jpeg'];

/**
 * 通过mimeType判断是否图片
 * @param mimeType 文件类型
 */
export default function isImg(mimeType: string): boolean {
  return IMG_MIMETYPE.includes(mimeType);
}
