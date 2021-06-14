/**
 * 判断是否为null、undefined和空字符串
 */
export default function isEmpty(property): boolean {
  return (
    property === null || property === '' || typeof property === 'undefined'
  );
}
